package cmd

import (
	"io"
	"log"
	"net/http"
	"os"
	"sync"
	"sync/atomic"
	"time"

	"github.com/spf13/cobra"
)

func init() {
	rootCmd.AddCommand(testCmd)
}

var testCmd = &cobra.Command{
	Use:   "test",
	Short: "Test Anything in this command",
	Run: func(cmd *cobra.Command, args []string) {
		logFile, err := os.OpenFile("log.txt", os.O_CREATE|os.O_APPEND|os.O_RDWR, 0666)
		if err != nil {
			panic(err)
		}
		defer logFile.Close()
		mw := io.MultiWriter(os.Stdout, logFile)
		log.SetOutput(mw)
		cases := []int{1, 10, 100, 1000, 10000}
		for _, c := range cases {
			makeRequest(c)
		}
	},
}

func makeRequest(n int) {
	wg := sync.WaitGroup{}
	count := atomic.Int32{}
	wg.Add(n)
	s := time.Now()
	for j := 0; j < n; j++ {
		go myGoRoutine(&wg, &count)
	}
	wg.Wait()
	log.Printf("Time Elapsed: %v for %d iterations", time.Since(s), n)
}

func myGoRoutine(wg *sync.WaitGroup, count *atomic.Int32) {
	defer wg.Done()
	s := time.Now()
	defer func() {
		log.Printf("Time Elapsed: %v", time.Since(s))
	}()
	_, err := http.Get("https://dummy.restapiexample.com/api/v1/employee/1")
	if err != nil {
		log.Printf("Error: %v", err.Error())
	}
	count.Add(1)
}
