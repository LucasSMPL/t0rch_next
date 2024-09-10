import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { ArrowUp, Building2, Check } from "lucide-react";

export default async function SiteCard({
  siteId,
  name,
  location,
  lg,
  lt,
}: {
  siteId: number;
  name: string;
  location: string;
  lg: number;
  lt: number;
}) {
  const siteStats = await getSiteStats(siteId);
  const siteWeather = await getSiteWeather({ lg, lt });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-10">
        <CardTitle className="text-3xl font-medium">{name}</CardTitle>
        <Building2 style={{ color: "#ff9e00" }} />
      </CardHeader>
      <CardContent className="text-xl" style={{ color: "#aeaeae" }}>
        {location}
      </CardContent>
      <CardContent className="text-xl">
        Miners Online:{" "}
        <span style={{ color: "#4ade80" }}>{siteStats.online}</span> /{" "}
        <span style={{ color: "#4ade80" }}>{siteStats.total}</span>
      </CardContent>
      <CardContent className="text-xl">
        Miners Offline:{" "}
        <span className="text-[#ff2f00]">{siteStats.powerDraw}</span> (
        {siteStats.offlinePercentage}%)
      </CardContent>
      <CardContent className="text-xl">
        Total Hashrate:{" "}
        <span style={{ color: "#ff9e00" }}>{siteStats.hashRateInPH}</span> PH/s
      </CardContent>
      <CardContent className="text-xl">
        Total Power:{" "}
        <span style={{ color: "#ff9e00" }}>{siteStats.powerDraw}</span>{" "}
        MW&apos;s
      </CardContent>
      <CardContent className="text-xl">
        Temperature:{" "}
        <span className="text-[#006eff]">
          {siteWeather.apparentTemperature}
        </span>{" "}
        °F
      </CardContent>
      <CardContent className="text-xl flex items-center">
        Wind Data:&nbsp;
        <span className="text-[#006eff]">{siteWeather.windSpeed} MPH</span>
        <span
          className="ml-2"
          style={{
            transform: `rotate(${siteWeather.windTowards}deg)`,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          <ArrowUp style={{ color: "#006eff" }} />
        </span>
      </CardContent>
      <CardContent className="text-xl">
        <div className="flex items-center">
          <span>ISP: 250 MB/s </span>
          <Check className="pl-2" style={{ color: "#4ade80" }} />
        </div>
      </CardContent>
    </Card>
  );
}

const getSiteWeather = async ({ lg, lt }: { lg: number; lt: number }) => {
  const siteWeather = await axios.get<{
    current: {
      temperature_2m: number;
      wind_speed_10m: number;
      wind_direction_10m: number;
    };
  }>(
    `https://api.open-meteo.com/v1/forecast?latitude=${lt}&longitude=-${lg}&current=temperature_2m,wind_speed_10m,wind_direction_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&forecast_days=1`
  );
  const apparentTemperature = siteWeather.data.current.temperature_2m;
  const windSpeed = siteWeather.data.current.wind_speed_10m;
  const windFrom = siteWeather.data.current.wind_direction_10m;
  const windTowards = windFrom < 180 ? windFrom + 180 : windFrom - 180;

  return {
    apparentTemperature,
    windSpeed,
    windTowards,
  };
};

const getSiteStats = async (siteId: number) => {
  const siteData = await axios.get<
    {
      miners: { online: number; offline: number; total: number };
      hashRate: number;
      powerDraw: number;
    }[]
  >(`https://api.foreman.mn/api/v2/clients/${siteId}`, {
    headers: {
      accept: "application/json",
      Authorization: "Token 5827e98b613a4844a0255904a805e6f86dc3775f",
    },
  });
  const online = siteData.data.at(0)?.miners?.online ?? 0;
  const offline = siteData.data.at(0)?.miners?.offline ?? 0;
  const total = siteData.data.at(0)?.miners?.total ?? 0;
  const offlinePercentage = ((offline / total) * 100).toFixed(2);
  const hashRateInHashes = siteData.data.at(0)?.hashRate ?? 0;
  const hashRateInPH = (hashRateInHashes / 1e15).toFixed(2);
  const powerDraw = ((siteData.data.at(0)?.powerDraw ?? 0) / 1_000_000).toFixed(
    2
  );
  return {
    online,
    offline,
    total,
    offlinePercentage,
    hashRateInPH,
    powerDraw,
  };
};
