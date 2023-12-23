package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

func init() {
  rootCmd.AddCommand(versionCmd)
}

var versionCmd = &cobra.Command{
  Use:   "version",
  Short: "Version of t0rch_go",
  Run: func(cmd *cobra.Command, args []string) {
    fmt.Println("t0rch_go v0.9")
  },
}