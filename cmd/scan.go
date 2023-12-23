package cmd

import (
	"fmt"
	"io"
	"net"
	"net/http"

	"github.com/icholy/digest"
	"github.com/spf13/cobra"
)

func init() {
	rootCmd.AddCommand(scanCmd)
	// Flags for the scan command
	scanCmd.Flags().IP("start", nil, "Start IP for scanning")
	scanCmd.Flags().IP("end", nil, "End IP for scanning")

	// Allow the user to pass start and end values directly using -s and -e
	// scanCmd.Flags().IntP("start", "s", 0, "Start value for scanning")
	// scanCmd.Flags().IntP("end", "e", 0, "End value for scanning")
	// scanCmd.MarkFlagRequired("start")
	// scanCmd.MarkFlagRequired("end")

}

var scanCmd = &cobra.Command{
	Use:   "scan",
	Short: "Scan a range of IP addresses",
	Run: func(cmd *cobra.Command, args []string) {
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
		}
		err := makeAPICalls(client, start, end)
		if err != nil {
			fmt.Println("Error making API calls:", err)
		}
	},
}

func makeAPICalls(client *http.Client, start, end net.IP) error {
	apiEndpoint := "/cgi-bin/summary.cgi"

	for ip := start; !ip.Equal(end); ip = incrementIP(ip) {
		fullURL := fmt.Sprintf("http://%s%s", ip, apiEndpoint)
		res, err := client.Get(fullURL)
		if err != nil {
			fmt.Printf("IP: %s - API call failed: %v\n", ip, err)
			continue
		}
		defer res.Body.Close()
		bodyBytes, _ := io.ReadAll(res.Body)

		fmt.Printf("IP: %s - API call status: %s\n", ip, bodyBytes)
	}

	return nil
}

// incrementIP increments an IP address by one.
func incrementIP(ip net.IP) net.IP {
	nextIP := make(net.IP, len(ip))
	copy(nextIP, ip)

	for i := len(nextIP) - 1; i >= 0; i-- {
		nextIP[i]++
		if nextIP[i] > 0 {
			break
		}
	}

	return nextIP
}
