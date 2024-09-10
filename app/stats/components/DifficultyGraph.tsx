
// const response = await axios.get("https://corsproxy.io/?https://insights.braiins.com/api/v1.0/hashrate-and-difficulty-history?timeframe=2y");
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

interface ChartData {
  x: string;
  difficulty: number;
  hashrate: number;
  price: number;
}

interface TooltipPayload {
  color: string;
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

interface HashrateData {
    [poolName: string]: Array<{ x: string; y: number }>;
  }
  
  interface ApiDataResponse {
    difficulty: Array<{ x: string; y: number }>;
    hashrate: HashrateData;
    price: Array<{ x: string; y: number }>;
  }
  
  interface ChartData {
    x: string;
    difficulty: number;
    hashrate: number;
    price: number;
  }

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      >
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>{`${entry.name}: ${entry.value.toFixed(2)}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

const formatYAxis = (tickItem: number): string => {
    // Depending on the expected range of your data, adjust formatting
    if (tickItem >= 1e15) {
      return `${(tickItem / 1e15).toFixed(1)}P`;
    } else if (tickItem >= 1e12) {
      return `${(tickItem / 1e12).toFixed(1)}T`;
    } else if (tickItem >= 1e9) {
      return `${(tickItem / 1e9).toFixed(1)}G`;
    } else if (tickItem >= 1e6) {
      return `${(tickItem / 1e6).toFixed(1)}M`;
    } else {
      return `${tickItem.toFixed(0)}`;
    }
  };

export default function DifficultyGraph() {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const response = await axios.get<ApiDataResponse>("https://corsproxy.io/?https://insights.braiins.com/api/v1.0/hashrate-and-difficulty-history?timeframe=2y");
        if (response.status === 200) {
          const data = response.data; // TypeScript now knows the structure of `data`
          const hashrateAggregated = Object.entries(data.hashrate).reduce((acc, [poolName, entries]) => {
            entries.forEach(({ x, y }: { x: string; y: number }) => { // Now properly typed
              const dateKey = new Date(x).toLocaleDateString();
              acc[dateKey] = (acc[dateKey] || 0) + y;
            });
            return acc;
          }, {} as Record<string, number>); // Initialize `acc` as a Record mapping strings to numbers
  
          const formattedData: ChartData[] = data.difficulty.map(d => {
            const dateKey = new Date(d.x).toLocaleDateString();
            return {
              x: dateKey,
              difficulty: d.y,
              hashrate: hashrateAggregated[dateKey] || 0,
              price: data.price.find(p => new Date(p.x).toLocaleDateString() === dateKey)?.y || 0,
            };
          });
          setChartData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
  
    fetchAllData();
  }, []);

  console.log(chartData)

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          <linearGradient id="colorDifficulty" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#e9580b" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#e9580b" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorHashrate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ffd700" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#ffd700" stopOpacity={0} />
          </linearGradient>
          {/* Comment out or remove the gradient for Price if not needed */}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#555" />
        <XAxis dataKey="x" stroke="#ccc" />
        <YAxis yAxisId="left" orientation="left" stroke="#ccc" tickFormatter={formatYAxis} />
        <YAxis yAxisId="right" orientation="right" stroke="#ccc" tickFormatter={formatYAxis} allowDataOverflow={true} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area yAxisId="left" type="monotone" dataKey="difficulty" stroke="#e9580b" fillOpacity={1} fill="url(#colorDifficulty)" name="Difficulty" />
        <Area yAxisId="right" type="monotone" dataKey="hashrate" stroke="#ffd700" fillOpacity={0.5} fill="url(#colorHashrate)" name="Hashrate" />
        {/* Comment out or remove the Area for Price */}
      </AreaChart>
    </ResponsiveContainer>
  );
}
