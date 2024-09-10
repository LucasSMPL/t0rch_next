import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { Radar } from "lucide-react";

export default async function Site1() {
    
    const response = await axios.get(
    "https://thingproxy.freeboard.io/fetch/https://api.foreman.mn/api/v2/clients/3028",
    {
      headers: {
        accept: "application/json",
        Authorization: "Token 5827e98b613a4844a0255904a805e6f86dc3775f",
      },
    }
  );

  const onlineMiners = response.data[0]?.miners?.online;
  const totalMiners = response.data[0]?.miners?.total;
  const offlineMiners = response.data[0]?.miners?.offline;
  const hashRateInHashes = response.data[0]?.hashRate;
  const hashRateInPH = hashRateInHashes / 1e15;
  const roundedHashRateInPH = Math.round(hashRateInPH * 100) / 100;

  return (
    <div className="grid gap-4 md:grid-cols-5 lg:grid-cols-5 pt-10 pl-20 pr-20">
          <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-3xl font-medium">
              Site 1
            </CardTitle>
            <Radar />
          </CardHeader>
          <CardContent className="text-xl">
            Cedar Falls, IA
          </CardContent>
          <CardContent className="text-xl">
            Miners Online: {onlineMiners} / {totalMiners}
          </CardContent>
          <CardContent className="text-xl">
            Total Hashrate: {hashRateInPH}
          </CardContent>
          <CardContent className="text-xl">
            Total Power:
          </CardContent>
          <CardContent className="text-xl">
            Internet:
          </CardContent>
        </Card>

    </div>
  );
}
