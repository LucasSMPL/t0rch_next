package cmd

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"regexp"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/icholy/digest"
	"github.com/spf13/cobra"
	"github.com/supabase-community/supabase-go"
	"golang.org/x/sync/semaphore"
)

func init() {
	rootCmd.AddCommand(runCmd)
}

var runCmd = &cobra.Command{
	Use:   "start",
	Short: "Start t0rch_go as an HTTP server",
	Run: func(cmd *cobra.Command, args []string) {
		r := gin.Default()
		r.Use(cors.Default())

		r.POST("/scan", scanHandler)
		r.POST("/scan-test", scanTestHandler)

		r.Run(":7070")
	},
}

func scanHandler(c *gin.Context) {
	var ipRanges ScanApiBody
	decoder := json.NewDecoder(c.Request.Body)

	if err := decoder.Decode(&ipRanges); err != nil {
		http.Error(c.Writer, err.Error(), http.StatusBadRequest)
		c.Writer.WriteHeader(http.StatusBadRequest)
		return
	}
	if len(ipRanges.Ranges) == 0 {
		http.Error(c.Writer, "No Ranges Provided", http.StatusBadRequest)
		c.Writer.WriteHeader(http.StatusBadRequest)
		return
	}
	client := &http.Client{
		Transport: &digest.Transport{
			Username: "root",
			Password: "root",
			// Transport: &http.Transport{
			// 	Dial: (&net.Dialer{
			// 		Timeout:   30 * time.Second,
			// 		KeepAlive: 30 * time.Second,
			// 	}).Dial,
			// 	TLSHandshakeTimeout:   10 * time.Second,
			// 	ResponseHeaderTimeout: 10 * time.Second,
			// 	ExpectContinueTimeout: 1 * time.Second,
			// },
		},
		// Timeout: time.Second * 10,
	}

	spClient, err := supabase.NewClient(
		"https://conqcdxbczhqszglmwyk.supabase.co",
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvbnFjZHhiY3pocXN6Z2xtd3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzk4NjM0NDQsImV4cCI6MTk5NTQzOTQ0NH0.LNi12BRKMOOmqW396mjgm_wgJp79U-Ie994EyLlfxnc",
		nil,
	)
	if err != nil {
		HandleError(err)
	}

	data, _, err := spClient.From("miner_models").Select("*,manufacturer:manufacturers(*)", "", false).Execute()
	if err != nil {
		HandleError(err)
	}
	var models []MinerModel
	err = json.Unmarshal(data, &models)
	if err != nil {
		HandleError(err)
		return
	}

	wg := sync.WaitGroup{}
	ctx := context.TODO()
	count := atomic.Int32{}
	sem := semaphore.NewWeighted(200)
	// s := time.Now()

	streamChan := make(chan ScanApiRes)

	for ri := 0; ri < len(ipRanges.Ranges); ri++ {
		ipRange := ipRanges.Ranges[ri]
		for ip := ipRange.Start; !ip.Equal(ipRange.End); ip = incrementIP(ip) {
			wg.Add(1)

			go func(client *http.Client, ip net.IP, models []MinerModel) {
				innerWg := sync.WaitGroup{}
				innerWg.Add(4)
				sem.Acquire(ctx, 1)
				defer wg.Done()
				defer sem.Release(1)
				defer count.Add(1)
				s := time.Now()

				summaryCh := make(chan IpSummary, 1)
				statsCh := make(chan IpStats, 1)
				confCh := make(chan IpMinerConf, 1)
				logsCh := make(chan string, 1)

				go func(client *http.Client, ip net.IP) {
					defer innerWg.Done()
					defer close(summaryCh)

					getMinerSummary(
						client,
						ip,
						summaryCh,
					)
				}(client, ip)
				go func(client *http.Client, ip net.IP) {
					defer innerWg.Done()
					defer close(statsCh)

					getMinerStats(
						client,
						ip,
						statsCh,
					)
				}(client, ip)
				go func(client *http.Client, ip net.IP) {
					defer innerWg.Done()
					defer close(confCh)

					getMinerConf(
						client,
						ip,
						confCh,
					)
				}(client, ip)
				go func(client *http.Client, ip net.IP) {
					defer innerWg.Done()
					defer close(logsCh)

					getMinerLogs(
						client,
						ip,
						logsCh,
					)
				}(client, ip)

				innerWg.Wait()

				summary := <-summaryCh
				stats := <-statsCh
				conf := <-confCh
				logs := <-logsCh

				var model *MinerModel
				for _, e := range models {
					if fmt.Sprintf("%s %s (%dT)", e.Manufacturer.Name, e.Model, e.HashRate) == summary.Info.Type ||
						fmt.Sprintf("%sMiner %s (%dT)", e.Manufacturer.Name, e.Model, e.HashRate) == summary.Info.Type ||
						fmt.Sprintf("%s %s (%d)", e.Manufacturer.Name, e.Model, e.HashRate) == summary.Info.Type ||
						fmt.Sprintf("%s %s", e.Manufacturer.Name, e.Model) == summary.Info.Type {
						model = &e
						break
					}
				}
				if model == nil {
					HandleError(fmt.Errorf("model not found: %v", summary.Info.Type))
					return
				}
				// fmt.Printf("Model: %v\n", *model)

				worker := ""
				if len(conf.Pools) > 0 {
					worker = conf.Pools[0].User
				}
				elapsed := 0
				if len(summary.Summary) > 0 {
					elapsed = summary.Summary[0].Elapsed
				}
				rate5s := 0
				if len(summary.Summary) > 0 {
					rate5s = int(summary.Summary[0].Rate_5s)
				}
				fanNum := 0
				if len(stats.Stats) > 0 {
					fanNum = int(stats.Stats[0].FanNum)
				}
				chainNum := 0
				if len(stats.Stats) > 0 {
					chainNum = int(stats.Stats[0].ChainNum)
				}
				isUnderhashing := false
				if len(summary.Summary) > 0 {
					isUnderhashing = (float64(rate5s) / 1000) < (float64(model.HashRate) * 0.8)
				}

				controller := "N/A"
				powerType := "Unknown"
				hbType := "Unknown"
				psuFailure := false

				controllerKeywords := []string{"Xilinx", "amlogic", "BeagleBone"}
				c := ContainsAny(logs, controllerKeywords)
				if c != "" {
					controller = c
				}

				psuFailingKeywords := []string{"power voltage can not meet the target", "ERROR_POWER_LOST", "stop_mining: get power type version failed!"}
				p := ContainsAny(logs, psuFailingKeywords)
				if p != "" {
					psuFailure = true
				}
				// if Keyword is found but Hashrate = normal - ignore psuFailure.

				powerRgx := regexp.MustCompile("power type version: (0x[0-9a-fA-F]+)")
				searchRes := strings.Split(powerRgx.FindString(logs), " ")
				if len(searchRes) >= 4 {
					powerType = searchRes[3]
				}

				hbModelRgx := regexp.MustCompile("load machine (.*?) conf")
				searchRes = strings.Split(hbModelRgx.FindString(logs), " ")
				if len(searchRes) >= 4 {
					hbType = searchRes[2]
				}

				// fmt.Printf("%v - %v\n", powerType, hbModel)
				fmt.Printf("%v - %v - %v\n", count.Load(), ip.String(), time.Since(s))

				scannedIp := ScanApiRes{
					ip.String(),
					summary.Info.Type,
					worker,
					elapsed,
					rate5s,
					fanNum,
					chainNum,
					powerType,
					controller,
					isUnderhashing,
					hbType,
					psuFailure,
				}
				streamChan <- scannedIp
				// gCtx.SSEvent("ip-summary", scannedIp)
				// fmt.Println(scannedIp)
			}(client, ip, models)
		}
	}
	c.Header("content-type", "application/json")
	c.Writer.WriteHeader(http.StatusOK)
	go func(s chan ScanApiRes) {
		for item := range s {
			c.SSEvent("ip-summary", item)
		}
		// c.Stream(func(w io.Writer) bool {
		// 	if msg, ok := <-s; ok {
		// 		c.SSEvent("ip-summary", msg)
		// 		return true
		// 	}
		// 	return false
		// })

	}(streamChan)

	wg.Wait()
	close(streamChan)

}

func HandleError(e error) {
	log.Printf("Error: %v", e.Error())
}

func ContainsAny(s string, substrings []string) string {
	for _, sub := range substrings {
		if strings.Contains(s, sub) {
			return sub
		}
	}
	return ""
}

func getMinerSummary(
	client *http.Client,
	ip net.IP,
	summaryChn chan<- IpSummary,
) {
	apiEndpoint := "/cgi-bin/summary.cgi"
	fullURL := fmt.Sprintf("http://%s%s", ip, apiEndpoint)

	res, err := client.Get(fullURL)
	if err != nil {
		HandleError(err)
		return
	}
	defer res.Body.Close()

	if res.StatusCode >= 300 {
		HandleError(fmt.Errorf("status: %d", res.StatusCode))
		return
	}

	var ipSummary IpSummary
	err = json.NewDecoder(res.Body).Decode(&ipSummary)
	if err != nil {
		HandleError(err)
		return
	}

	io.Copy(io.Discard, res.Body)
	summaryChn <- ipSummary
}

func getMinerConf(
	client *http.Client,
	ip net.IP,
	confChn chan<- IpMinerConf,
) {
	apiEndpoint := "/cgi-bin/get_miner_conf.cgi"
	fullURL := fmt.Sprintf("http://%s%s", ip, apiEndpoint)

	res, err := client.Get(fullURL)
	if err != nil {
		HandleError(err)
		return
	}
	defer res.Body.Close()

	if res.StatusCode >= 300 {
		HandleError(fmt.Errorf("status: %d", res.StatusCode))
		return
	}

	var ipMinerConf IpMinerConf
	err = json.NewDecoder(res.Body).Decode(&ipMinerConf)
	if err != nil {
		HandleError(err)
		return
	}

	io.Copy(io.Discard, res.Body)
	confChn <- ipMinerConf
}
func getMinerLogs(
	client *http.Client,
	ip net.IP,
	logsChn chan<- string,
) {
	apiEndpoint := "/cgi-bin/log.cgi"
	fullURL := fmt.Sprintf("http://%s%s", ip, apiEndpoint)

	res, err := client.Get(fullURL)
	if err != nil {
		HandleError(err)
		return
	}
	defer res.Body.Close()

	if res.StatusCode >= 300 {
		HandleError(fmt.Errorf("status: %d", res.StatusCode))
		return
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		HandleError(err)
		return
	}

	io.Copy(io.Discard, res.Body)
	logsChn <- string(body)
}
func getMinerStats(
	client *http.Client,
	ip net.IP,
	statsChn chan<- IpStats,
) {
	apiEndpoint := "/cgi-bin/stats.cgi"
	fullURL := fmt.Sprintf("http://%s%s", ip, apiEndpoint)

	res, err := client.Get(fullURL)
	if err != nil {
		HandleError(err)
		return
	}
	defer res.Body.Close()

	if res.StatusCode >= 300 {
		HandleError(fmt.Errorf("status: %d", res.StatusCode))
		return
	}

	var ipStats IpStats
	err = json.NewDecoder(res.Body).Decode(&ipStats)
	if err != nil {
		HandleError(err)
		return
	}

	io.Copy(io.Discard, res.Body)
	statsChn <- ipStats
}

type IpRange struct {
	Start net.IP `json:"start"`
	End   net.IP `json:"end"`
}

type ScanApiBody struct {
	Ranges []IpRange
}

type ScanApiRes struct {
	Ip             string `json:"ip"`
	MinerType      string `json:"miner_type"`
	Worker         string `json:"worker"`
	Uptime         int    `json:"uptime"`
	HashRate       int    `json:"hashrate"`
	FanCount       int    `json:"fan_count"`
	HbCount        int    `json:"hb_count"`
	PowerType      string `json:"power_type"`
	Controller     string `json:"controller"`
	IsUnderhashing bool   `json:"is_underhashing"`
	HashboardType  string `json:"hashboard_type"`
	PsuFailure     bool   `json:"psu_failure"`
}

type IpStats struct {
	Status struct {
		Status     string `json:"STATUS"`
		When       int    `json:"when"`
		Msg        string `json:"Msg"`
		ApiVersion string `json:"api_version"`
	} `json:"STATUS"`
	Info struct {
		MinerVersion string `json:"miner_version"`
		CompileTime  string `json:"CompileTime"`
		Type         string `json:"type"`
	} `json:"INFO"`
	Stats []struct {
		Elapsed   float64 `json:"elapsed"`
		Rate_5s   float64 `json:"rate_5s"`
		Rate_30m  float64 `json:"rate_30m"`
		RateAvg   float64 `json:"rate_avg"`
		RateIdeal float64 `json:"rate_ideal"`
		RateUnit  string  `json:"rate_unit"`
		ChainNum  float64 `json:"chain_num"`
		FanNum    float64 `json:"fan_num"`
		Fan       []int   `json:"fan"`
		HwpTotal  float64 `json:"hwp_total"`
		MinerMode float64 `json:"miner-mode"`
		FreqLevel float64 `json:"freq-level"`
		Chain     []struct {
			Index        float64     `json:"index"`
			FreqAvg      float64     `json:"freq_avg"`
			RateIdeal    float64     `json:"rate_ideal"`
			RateReal     float64     `json:"rate_real"`
			AsicNum      float64     `json:"asic_num"`
			Asic         string      `json:"asic"`
			TempPic      []float64   `json:"temp_pic"`
			TempPcb      []float64   `json:"temp_pcb"`
			TempChip     []float64   `json:"temp_chip"`
			Hw           float64     `json:"hw"`
			EepromLoaded bool        `json:"eeprom_loaded"`
			Sn           string      `json:"sn"`
			Hwp          float64     `json:"hwp"`
			Tpl          [][]float64 `json:"tpl"`
		} `json:"chain"`
	} `json:"STATS"`
}

type IpMinerConf struct {
	Pools []struct {
		Url  string `json:"url"`
		User string `json:"user"`
		Pass string `json:"pass"`
	} `json:"pools"`
	ApiListen      bool   `json:"api-listen"`
	ApiNetwork     bool   `json:"api-network"`
	ApiGroups      string `json:"api-groups"`
	ApiAllow       string `json:"api-allow"`
	BitmainFanCtrl bool   `json:"bitmain-fan-ctrl"`
	BitmainFanPwm  string `json:"bitmain-fan-pwm"`
	BitmainUseVil  bool   `json:"bitmain-use-vil"`
	BitmainFreq    string `json:"bitmain-freq"`
	BitmainVoltage string `json:"bitmain-voltage"`
	BitmainCcdelay string `json:"bitmain-ccdelay"`
	BitmainPwth    string `json:"bitmain-pwth"`
	// BitmainWorkMode  int    `json:"bitmain-work-mode"`
	BitmainFreqLevel string `json:"bitmain-freq-level"`
}

type MinerModel struct {
	Id             int     `json:"id"`
	Model          string  `json:"model"`
	IdManufacturer int     `json:"id_manufacturer"`
	HashRate       int     `json:"hashrate"`
	Power          float64 `json:"power"`
	Manufacturer   struct {
		Id   int    `json:"id"`
		Name string `json:"name"`
	} `json:"manufacturer"`
}

func scanTestHandler(c *gin.Context) {
	var ipRanges ScanApiBody
	decoder := json.NewDecoder(c.Request.Body)

	if err := decoder.Decode(&ipRanges); err != nil {
		http.Error(c.Writer, err.Error(), http.StatusBadRequest)
		c.Writer.WriteHeader(http.StatusBadRequest)
		return
	}
	if len(ipRanges.Ranges) == 0 {
		http.Error(c.Writer, "No Ranges Provided", http.StatusBadRequest)
		c.Writer.WriteHeader(http.StatusBadRequest)
		return
	}
	client := &http.Client{
		Transport: &digest.Transport{
			Username: "root",
			Password: "root",
			// Transport: &http.Transport{
			// 	Dial: (&net.Dialer{
			// 		Timeout:   30 * time.Second,
			// 		KeepAlive: 30 * time.Second,
			// 	}).Dial,
			// 	TLSHandshakeTimeout:   3 * time.Second,
			// 	ResponseHeaderTimeout: 3 * time.Second,
			// 	ExpectContinueTimeout: 1 * time.Second,
			// 	MaxIdleConns:          10,
			// 	IdleConnTimeout:       time.Second * 3,
			// },
		},
		// Timeout: time.Second * 3,
	}

	spClient, err := supabase.NewClient(
		"https://conqcdxbczhqszglmwyk.supabase.co",
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvbnFjZHhiY3pocXN6Z2xtd3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzk4NjM0NDQsImV4cCI6MTk5NTQzOTQ0NH0.LNi12BRKMOOmqW396mjgm_wgJp79U-Ie994EyLlfxnc",
		nil,
	)
	if err != nil {
		HandleError(err)
	}

	data, _, err := spClient.From("miner_models").Select("*,manufacturer:manufacturers(*)", "", false).Execute()
	if err != nil {
		HandleError(err)
	}
	var models []MinerModel
	err = json.Unmarshal(data, &models)
	if err != nil {
		HandleError(err)
		return
	}

	wg := sync.WaitGroup{}
	ctx := context.TODO()
	count := atomic.Int32{}
	sem := semaphore.NewWeighted(200)

	streamChan := make(chan ScanApiRes)

	for ri := 0; ri < len(ipRanges.Ranges); ri++ {
		ipRange := ipRanges.Ranges[ri]
		for ip := ipRange.Start; !ip.Equal(ipRange.End); ip = incrementIP(ip) {
			wg.Add(1)

			go func(client *http.Client, ip net.IP, models []MinerModel) {
				sem.Acquire(ctx, 1)
				defer wg.Done()
				defer sem.Release(1)
				defer count.Add(1)
				s := time.Now()

				// _, err := client.Head(fmt.Sprintf("http://%s", ip))
				_, err := client.Head("https://example.com/")
				// time.Sleep(time.Second * 3)
				if err != nil {
					log.Println(err)
				}
				fmt.Printf("%v - %v - %v\n", count.Load(), ip.String(), time.Since(s))

				scannedIp := ScanApiRes{
					ip.String(),
					"",
					"",
					0,
					0,
					0,
					0,
					"",
					"",
					true,
					"",
					true,
				}
				streamChan <- scannedIp

			}(client, ip, models)
		}
	}
	c.Header("content-type", "application/json")
	c.Writer.WriteHeader(http.StatusOK)
	go func(s chan ScanApiRes) {
		for item := range s {
			c.SSEvent("ip-summary", item)
		}
		// c.Stream(func(w io.Writer) bool {
		// 	if msg, ok := <-s; ok {
		// 		c.Writer.Flush()
		// 		c.SSEvent("ip-summary", msg)
		// 		return true
		// 	}
		// 	return false
		// })

	}(streamChan)

	wg.Wait()
	close(streamChan)

}
