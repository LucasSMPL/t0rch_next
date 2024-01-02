package cmd

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"sync"
	"time"

	"github.com/icholy/digest"
	"github.com/spf13/cobra"
)

func init() {
	rootCmd.AddCommand(scanTurboCmd)
	// Flags for the scan command
	scanTurboCmd.Flags().IP("start", nil, "Start IP for scanning")
	scanTurboCmd.Flags().IP("end", nil, "End IP for scanning")

	// Allow the user to pass start and end values directly using -s and -e
	// scanTurboCmd.Flags().IntP("start", "s", 0, "Start value for scanning")
	// scanTurboCmd.Flags().IntP("end", "e", 0, "End value for scanning")
	// scanTurboCmd.MarkFlagRequired("start")
	// scanTurboCmd.MarkFlagRequired("end")

}

var scanTurboCmd = &cobra.Command{
	Use:   "scan_turbo",
	Short: "Turbo Scan a range of IP addresses",
	Run: func(cmd *cobra.Command, args []string) {
		startTime := time.Now()
		defer func() {
			fmt.Println("Execution Time: ", time.Since(startTime))
		}()

		start, _ := cmd.Flags().GetIP("start")
		end, _ := cmd.Flags().GetIP("end")

		if start == nil {
			startStr, _ := cmd.Flags().GetIP("start")
			fmt.Printf("Enter start value: ")
			fmt.Scanln(&startStr)
			if startStr == nil {
				fmt.Println("Error: Invalid IP Address")
				return
			}
			start = startStr
		}
		if end == nil {
			endStr, _ := cmd.Flags().GetIP("end")
			fmt.Printf("Enter end value: ")
			fmt.Scanln(&endStr)
			if endStr == nil {
				fmt.Println("Error: Invalid IP Address")
				return
			}
			end = endStr
		}

		fmt.Printf("Scanning from %d to %d\n", start, end)
		client := &http.Client{
			Transport: &digest.Transport{
				Username: "root",
				Password: "root",
			},
			Timeout: time.Duration(5) * time.Second,
		}

		wg := sync.WaitGroup{}

		// ch := make(chan *IpSummary)

		// w := tabwriter.NewWriter(os.Stdout, 10, 1, 5, ' ', 0)
		// fs := "%s\t%s\t%s\n"
		// fmt.Fprintf(w, fs, "IP", "Miner", "STATUS")
		for ip := start; !ip.Equal(end); ip = incrementIP(ip) {
			wg.Add(1)
			go func(client *http.Client, ip net.IP) {
				getMinerOnIp(client, ip)

				wg.Done()
			}(client, ip)
		}
		wg.Wait()
	},
}

func getMinerOnIp(client *http.Client, ip net.IP) (*IpSummary, error) {
	apiEndpoint := "/cgi-bin/summary.cgi"

	fullURL := fmt.Sprintf("http://%s%s", ip, apiEndpoint)
	res, err := client.Get(fullURL)
	if err != nil {
		// fmt.Printf("IP: %s - API call failed: %v\n", ip, err)
		return nil, err
	}
	defer res.Body.Close()

	var ipSummary IpSummary
	err = json.NewDecoder(res.Body).Decode(&ipSummary)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	// fmt.Printf("IP: %s - API call status: %s\n", ip, ipSummary.Status.Status)
	// fmt.Fprintf(w, fs, ip.String(), ipSummary.Status.Status, "p.Status")

	return &ipSummary, nil
}
