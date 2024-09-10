"use client"

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface HashrateData {
  timestamp: number;
  totalHashrate: number;
}

const chartConfig = {
  hashrate: {
    label: "Hashrate",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const HashratePage = () => {
  const [hashrateData, setHashrateData] = useState<HashrateData[]>([]);
  const [totalHashrate, setTotalHashrate] = useState<number>(0);

  const fetchHashrateData = async () => {
    try {
      const response = await axios.get('/api/getHashrate');

      // Log the API response to see what data is returned
      console.log('API Response:', response.data);

      // Update state with the fetched data
      setHashrateData(response.data.hashrateData);

      // Log the total hashrate before setting it
      console.log('Setting totalHashrate:', response.data.totalHashrate);

      // Set the total hashrate in state
      setTotalHashrate(response.data.totalHashrate);
    } catch (error) {
      console.error('Error fetching hashrate data:', error);
    }
  };

  useEffect(() => {
    fetchHashrateData();
    const interval = setInterval(fetchHashrateData, 90000); // Fetch data every 90 seconds
    return () => clearInterval(interval);
  }, []);

  const formattedData = hashrateData.map(entry => ({
    timestamp: new Date(entry.timestamp).toLocaleTimeString(),
    hashrate: entry.totalHashrate / 1_000_000,  // Convert from GH/s to PH/s
  }));

  console.log('Total Hashrate before conversion:', totalHashrate);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site #1 - Live Aggregated Hashrate</CardTitle>
        <CardDescription>
          Showing total hashrate for the last 60 minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
      <ChartContainer config={chartConfig}>
  <AreaChart
    accessibilityLayer
    data={formattedData}
    margin={{
      left: 12,
      right: 12,
    }}
  >
    <CartesianGrid vertical={false} />
    <XAxis
      dataKey="timestamp"
      tickLine={false}
      axisLine={false}
      tickMargin={8}
    />
    <YAxis
      label={{
        value: 'PH/s',
        angle: -90,
        position: 'insideLeft',
        style: { textAnchor: 'middle' }
      }}
    />
    <ChartTooltip
      cursor={false}
      content={<ChartTooltipContent indicator="line" />}
    />
    <Area
      dataKey="hashrate"
      type="natural"
      fill="#ff9e00"
      fillOpacity={0.4}
      stroke="#ffffff"
    />
  </AreaChart>
</ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-large">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Current Total Hashrate: {Number.isFinite(totalHashrate) && totalHashrate > 0 ? (totalHashrate / 1_000_000).toFixed(2) : 'N/A'} PH/s <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
            60 minute window.
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default HashratePage;
