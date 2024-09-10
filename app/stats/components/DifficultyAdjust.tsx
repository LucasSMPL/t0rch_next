import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowBigDownDash } from "lucide-react";

interface DifficultyAdjustmentResponse {
  progressPercent: number;
  difficultyChange: number;
  estimatedRetargetDate: number;
  remainingBlocks: number;
  remainingTime: number;
  previousRetarget: number;
  previousTime: number;
  nextRetargetHeight: number;
  timeAvg: number;
  adjustedTimeAvg: number;
  timeOffset: number;
  expectedBlocks: number;
}

const DifficultyAdjustmentComponent: React.FC = () => {
  const [difficultyAdjustment, setDifficultyAdjustment] = useState<DifficultyAdjustmentResponse | null>(null);

  useEffect(() => {
    const fetchDifficultyAdjustment = async () => {
      try {
        const response = await axios.get("https://mempool.space/api/v1/difficulty-adjustment");
        setDifficultyAdjustment(response.data);
      } catch (error) {
        console.error("Failed to fetch difficulty adjustment data:", error);
      }
    };

    fetchDifficultyAdjustment();
  }, []);

  const formattedDifficultyChange = difficultyAdjustment
    ? `${difficultyAdjustment.difficultyChange > 0 ? '+' : ''}${difficultyAdjustment.difficultyChange.toFixed(3)}%`
    : 'Loading...';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-medium">
          Bitcoin Difficulty Adjustment
        </CardTitle>
        <ArrowBigDownDash />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-orange-600">
          Next Adjustment: {formattedDifficultyChange}
        </div>
      </CardContent>
    </Card>
  );
};

export default DifficultyAdjustmentComponent;
