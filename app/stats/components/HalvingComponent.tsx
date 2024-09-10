import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowBigDownDash } from "lucide-react";

interface HalvingResponse {
  height: number;
  timestamp: string;
  is_estimate: boolean;
  reward: number;
}

const HalvingComponent: React.FC = () => {
  const [halvingData, setHalvingData] = useState<HalvingResponse | null>(null);

  useEffect(() => {
    const fetchHalvingData = async () => {
      try {
        const response = await axios.get("https://corsproxy.io/?https://insights.braiins.com/api/v2.0/halvings");
        if (response.data && response.data.length > 0) {
          setHalvingData(response.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch halving data:", error);
      }
    };

    fetchHalvingData();
  }, []);

  // Format the timestamp nicely
  const formattedTimestamp = halvingData ? new Date(halvingData.timestamp).toLocaleDateString("en-US", {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: "America/Chicago" // CST/CDT timezone
  }) : '';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-medium">
          Halving at Block #{halvingData?.height}
        </CardTitle>
        <ArrowBigDownDash />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-orange-600">
          Estimated {formattedTimestamp}
        </div>
      </CardContent>
    </Card>
  );
};

export default HalvingComponent;