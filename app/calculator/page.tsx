"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BitcoinMiningCalculator from "./components/calculator";
import MiningProfitabilityCalculator from "./components/v2";

  const CalcPage: React.FC = () => {
    return (
      <MiningProfitabilityCalculator />
        //<BitcoinMiningCalculator />
    );
  }

  export default CalcPage;