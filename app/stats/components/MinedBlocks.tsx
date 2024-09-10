"use client"
import React, { useEffect, useState } from "react";
import { CardTitle } from "@/components/ui/card";
import axios from "axios";

interface BlockData {
  height: number;
  timestamp: string;
  pool: string;
  block_value_btc: number;
  block_value_usd: number;
}

const MinedBlocks = () => {
  const [blocks, setBlocks] = useState<BlockData[]>([]);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await axios.get("https://corsproxy.io/?https://insights.braiins.com/api/v1.0/blocks?limit=10");
        setBlocks(response.data);
      } catch (error) {
        console.error("Failed to fetch block data:", error);
      }
    };

    fetchBlocks();
  }, []);

  return (
    <div>
            <div className="flex justify-center w-full">
              <h1 className="text-3xl font-medium pb-2">
                Last 10 Mined Blocks
              </h1>
            </div>
            <div style={{ overflowX: "auto", display: "flex", justifyContent: "center" }}>
      <table style={{ width: "55%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#e9580b" }}>
            <th style={{ border: "1px solid #dddddd", textAlign: "center", padding: "4px" }}>Height</th>
            <th style={{ border: "1px solid #dddddd", textAlign: "center", padding: "4px" }}>Timestamp</th>
            <th style={{ border: "1px solid #dddddd", textAlign: "center", padding: "4px" }}>Pool</th>
            <th style={{ border: "1px solid #dddddd", textAlign: "center", padding: "4px" }}>Block Value (BTC)</th>
            <th style={{ border: "1px solid #dddddd", textAlign: "center", padding: "4px" }}>Block Value (USD)</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block) => (
            <tr key={block.height}>
              <td style={{ border: "1px solid #dddddd", textAlign: "center", padding: "4px" }}>{block.height}</td>
              <td style={{ border: "1px solid #dddddd", textAlign: "center", padding: "4px" }}>{block.timestamp}</td>
              <td style={{ border: "1px solid #dddddd", textAlign: "center", padding: "4px" }}>{block.pool}</td>
              <td style={{ border: "1px solid #dddddd", textAlign: "center", padding: "4px" }}>{block.block_value_btc}</td>
              <td style={{ border: "1px solid #dddddd", textAlign: "center", padding: "4px" }}>${block.block_value_usd.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default MinedBlocks;