"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowBigDownDash, ChevronsUpDown, Flame, HelpCircle, Radar } from "lucide-react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';
import TransactionFeesGraph from "./components/TransactionFeesGraph";
import t0_wordmark from "public/t0_wordmark.svg"
import axios from 'axios';
import HalvingComponent from "./components/HalvingComponent";
import BitcoinPriceComponent from "./components/BitcoinPrice";
import DifficultyAdjustmentComponent from "./components/DifficultyAdjust";
import MinedBlocks from "./components/MinedBlocks";
import DifficultyGraph from "./components/DifficultyGraph";
import BlocksByCountryPage from "./components/BlocksByCountry";

  const DashboardPage: React.FC = () => {
  const svgUrl = '/t0_wordmark.svg';

    return (
        <>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
      <img src={svgUrl} alt="t0 wordmark" style={{ width: '300px', height: '150px' }} />
      </div>
      
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 pl-20 pr-20">
      <BitcoinPriceComponent />
      <HalvingComponent />
      <DifficultyAdjustmentComponent />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 pt-10 pl-20 pr-20">
        <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-3xl font-medium">
            Bitcoin Transaction Fees (3m)
          </CardTitle>
          <Radar />
        </CardHeader>
        <CardContent>
          <TransactionFeesGraph />
        </CardContent>
      </Card>
  
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-3xl font-medium">
              Difficulty Graph (2y)
            </CardTitle>
            <ArrowBigDownDash />
          </CardHeader>
          <CardContent>
            <DifficultyGraph />
          </CardContent>
        </Card>
      </div>

      <div className="pt-10 pl-20 pr-20">
      <BlocksByCountryPage />
      <MinedBlocks />
      </div>
      </>
    );
  };
  
  export default DashboardPage;