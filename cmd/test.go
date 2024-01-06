package cmd

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/icholy/digest"
	"github.com/spf13/cobra"
)

func init() {
	rootCmd.AddCommand(testCmd)
}

var testCmd = &cobra.Command{
	Use:   "test",
	Short: "Test Anything in this command",
	Run: func(cmd *cobra.Command, args []string) {
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
			Timeout: time.Second * 10,
		}

		apiEndpoint := "/cgi-bin/summary.cgi"
		fullURL := fmt.Sprintf("http://10.0.108.11%s", apiEndpoint)

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

		resBytes, _ := io.ReadAll(res.Body)
		log.Println(string(resBytes))

		var ipSummary IpSummary
		err = json.Unmarshal(resBytes, &ipSummary)
		// err = json.NewDecoder(res.Body).Decode(&ipSummary)
		if err != nil {
			HandleError(err)
			return
		}
		log.Println(ipSummary)

	},
}
