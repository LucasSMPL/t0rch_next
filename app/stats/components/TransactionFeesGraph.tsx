"use client"
import React, { useEffect, useState } from "react";
import axios from "axios";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AvgBlockFeesData {
    x: string; // Date and time
    y: number; // Average block fees in satoshis
  }
  
// Utility function to format values directly in Satoshis
function formatYAxis(value: number): string {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(1)}B sats`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(1)}M sats`;
    } else if (value >= 1e3) {
      return `${(value / 1e3).toFixed(1)}K sats`;
    } else {
      return `${value} sats`;
    }
  }
  
  
  const TransactionFeesGraph = () => {
    const [avgBlockFeesData, setAvgBlockFeesData] = useState<AvgBlockFeesData[]>([]);
  
    useEffect(() => {
      const fetchAvgBlockFeesData = async () => {
        try {
          const response = await axios.get("https://corsproxy.io/?https://insights.braiins.com/api/v1.0/transaction-fees-history?timeframe=3m");
          const formattedData = response.data.avg_block_fees.map((item: AvgBlockFeesData) => ({
            ...item, x: new Date(item.x).toLocaleDateString() // Convert timestamp to more readable date
          }));
          setAvgBlockFeesData(formattedData);
        } catch (error) {
          console.error("Failed to fetch average block fees data:", error);
        }
      };
  
      fetchAvgBlockFeesData();
    }, []);
  
    return (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={avgBlockFeesData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e9580b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#e9580b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="x" stroke="#ccc" />
            <YAxis stroke="#ccc" tickFormatter={formatYAxis} />
            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
            <Tooltip />
            <Area type="monotone" dataKey="y" stroke="#e9580b" fillOpacity={1} fill="url(#colorUv)" />
          </AreaChart>
        </ResponsiveContainer>
      );
    };
    
    export default TransactionFeesGraph;