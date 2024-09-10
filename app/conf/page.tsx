import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { Radar, Check, Bitcoin, Receipt, BarChart4, Castle, Building2, GrapeIcon } from "lucide-react";

// Site 1 = 8180
// Site 2 = 8179
// Site 3 = 25955
// SMPL = 21556
// Inventory = 25701
// Shelby = 26627
// PrarieRose = 27213

// e94d1b
//ff7f0f

export default async function () {
    const svgUrl = '/SMPL.svg';

    const cfu = await axios.get(
      "https://api.foreman.mn/api/v2/clients/8180",
      {
        headers: {
          accept: "application/json",
          Authorization: "Token 5827e98b613a4844a0255904a805e6f86dc3775f",
        },
      }
    );
    const cfuOnline = cfu.data[0]?.miners?.online;
    const cfuOffline = cfu.data[0]?.miners?.offline;
    const cfuTotal = cfu.data[0]?.miners?.total;
    const cfuOfflinePercentage = ((cfuOffline / cfuTotal) * 100).toFixed(2);
    const cfuHashRateInHashes = cfu.data[0]?.hashRate;
    const cfuHashRateInPH = cfuHashRateInHashes / 1e15;
    // const cfuRoundedHashRateInPH = Math.round(cfuHashRateInPH * 100) / 100;
    const cfuPowerDraw = cfu.data[0]?.powerDraw / 1_000_000;
      const cfuWeather = await axios.get(
        "https://api.open-meteo.com/v1/forecast?latitude=42.5278&longitude=-92.4455&current=temperature_2m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch",
      );
      const cfuApparentTemperature = cfuWeather.data.current.temperature_2m;

          const lm = await axios.get(
            "https://api.foreman.mn/api/v2/clients/8179",
            {
              headers: {
                accept: "application/json",
                Authorization: "Token 5827e98b613a4844a0255904a805e6f86dc3775f",
              },
            }
          );

          const lmOnline = lm.data[0]?.miners?.online;
          const lmOffline = lm.data[0]?.miners?.offline;
          const lmTotal = lm.data[0]?.miners?.total;
          const lmOfflinePercentage = ((lmOffline / lmTotal) * 100).toFixed(2);
          const lmHashrateInHashes = lm.data[0]?.hashRate;
          const lmHashrateInPH = lmHashrateInHashes / 1e15;
          const lmPowerDraw = lm.data[0]?.powerDraw / 1_000_000;
          
          const lmWeather = await axios.get(
            "https://api.open-meteo.com/v1/forecast?latitude=43.4194&longitude=-93.5333&current=temperature_2m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch",
          );
          const lmApparentTemperature = lmWeather.data.current.temperature_2m;

                const s3 = await axios.get(
                  "https://api.foreman.mn/api/v2/clients/25955",
                  {
                    headers: {
                      accept: "application/json",
                      Authorization: "Token 5827e98b613a4844a0255904a805e6f86dc3775f",
                    },
                  }
                );

                const s3Online = s3.data[0]?.miners?.online;
                const s3Offline = s3.data[0]?.miners?.offline;
                const s3Total = s3.data[0]?.miners?.total;
                const s3OfflinePercentage = ((s3Offline / s3Total) * 100).toFixed(2);
                const s3HashrateInHashes = s3.data[0]?.hashRate;
                const s3HashrateInPH = s3HashrateInHashes / 1e15;
                const s3PowerDraw = s3.data[0]?.powerDraw / 1_000_000;
                
                const s3Weather = await axios.get(
                  "https://api.open-meteo.com/v1/forecast?latitude=42.5278&longitude=-92.4455&current=temperature_2m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch",
                );
                const s3ApparentTemperature = s3Weather.data.current.temperature_2m;
                
                      const shelby = await axios.get(
                        "https://api.foreman.mn/api/v2/clients/26627",
                        {
                          headers: {
                            accept: "application/json",
                            Authorization: "Token 5827e98b613a4844a0255904a805e6f86dc3775f",
                          },
                        }
                      );

                      const shelbyOnline = shelby.data[0]?.miners?.online;
                      const shelbyOffline = shelby.data[0]?.miners?.offline;
                      const shelbyTotal = shelby.data[0]?.miners?.total;
                      const shelbyOfflinePercentage = ((shelbyOffline / shelbyTotal) * 100).toFixed(2);
                      const shelbyHashrateInHashes = shelby.data[0]?.hashRate;
                      const shelbyHashrateInPH = shelbyHashrateInHashes / 1e15;
                      const shelbyPowerDraw = shelby.data[0]?.powerDraw / 1_000_000;
                      
                      const shelbyWeather = await axios.get(
                        "https://api.open-meteo.com/v1/forecast?latitude=41.4767&longitude=-95.338&current=temperature_2m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch",
                      );
                      const shelbyApparentTemperature = shelbyWeather.data.current.temperature_2m;

                            const rose = await axios.get(
                              "https://api.foreman.mn/api/v2/clients/27213",
                              {
                                headers: {
                                  accept: "application/json",
                                  Authorization: "Token 5827e98b613a4844a0255904a805e6f86dc3775f",
                                },
                              }
                            );

                            const roseOnline = rose.data[0]?.miners?.online;
                            const roseOffline = rose.data[0]?.miners?.offline;
                            const roseTotal = rose.data[0]?.miners?.total;
                            const roseOfflinePercentage = ((roseOffline / roseTotal) * 100).toFixed(2);
                            const roseHashrateInHashes = rose.data[0]?.hashRate;
                            const roseHashrateInPH = roseHashrateInHashes / 1e15;
                            const rosePowerDraw = rose.data[0]?.powerDraw / 1_000_000;
                            
                            const roseWeather = await axios.get(
                              "https://api.open-meteo.com/v1/forecast?latitude=41.653&longitude=-95.3256&current=temperature_2m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch",
                            );
                            const roseApparentTemperature = shelbyWeather.data.current.temperature_2m;

                                  const bitcoin = await axios.get(
                                    "https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD",
                                  );
                                  const rawPrice = bitcoin.data.USD;
                                  const bitcoinPrice = rawPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

                                        const hashRateResponse = await axios.post(
                                          "https://api.hashrateindex.com/graphql",
                                          {
                                            query: `
                                                        query MyQuery {
                                                        bitcoinOverviews(last: 1) {
                                                            nodes {
                                                            networkHashrate7D
                                                            }
                                                        }
                                                        }
                                                    `,
                                          },
                                          {
                                            headers: {
                                              "content-type": "application/json",
                                              "x-hi-api-key": "hi.fa4e468a9b71db921e86fb9c0dc5f938",
                                            },
                                          },
                                        );
                                    
                                        const nhRate7d =
                                          (
                                            hashRateResponse.data.data.bitcoinOverviews.nodes[0].networkHashrate7D /
                                            1000000
                                          ).toFixed(3) + " EH/s";

                                                const hashPriceResponse = await axios.post(
                                                  "https://api.hashrateindex.com/graphql",
                                                  {
                                                    query: `
                                                                query MyQuery {
                                                                bitcoinOverviews(last: 1) {
                                                                    nodes {
                                                                    hashpriceUsd
                                                                    }
                                                                }
                                                                }
                                                            `,
                                                  },
                                                  {
                                                    headers: {
                                                      "content-type": "application/json",
                                                      "x-hi-api-key": "hi.fa4e468a9b71db921e86fb9c0dc5f938",
                                                    },
                                                  },
                                                );

                                                const hashPriceUsd = (hashPriceResponse.data.data.bitcoinOverviews.nodes[0].hashpriceUsd) * 1000
                                                console.log(hashPriceUsd)

                                          
                                                const smplCount = (cfuTotal) + (lmTotal) + (s3Total)
                                                const smplHash = (cfuHashRateInPH) + (lmHashrateInPH) + (s3HashrateInPH)
                                                const smplPower = (cfuPowerDraw) + (lmPowerDraw) + (s3PowerDraw)


      return (
          <>  
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '5px' }}>
        <img src={svgUrl} alt="t0 wordmark" style={{ width: '550px', height: '300px' }} />
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 pl-20 pr-20 pb-5">
              <Card >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-medium">
              Bitcoin Price
            </CardTitle>
            <Bitcoin />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#ff9e00]">
              {bitcoinPrice ? bitcoinPrice : 'Loading...'}
            </div>
          </CardContent>
        </Card>
              <Card >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl font-medium">
                    Hashprice
                  </CardTitle>
                  <Receipt />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#ff9e00]">
                   ${hashPriceUsd.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
                    <Card >
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xl font-medium">
                          Network Hashrate (7d)
                        </CardTitle>
                        <BarChart4 />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-[#ff9e00]">
                        {nhRate7d}
                        </div>
                      </CardContent>
                    </Card>
                            <Card >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xl font-medium">
                                Miners Online
                                </CardTitle>
                                <BarChart4 />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-[#ff9e00]">
                                {smplCount}
                                </div>
                            </CardContent>
                            </Card>
                            <Card >
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-xl font-medium">
                                        Our Hashrate
                                        </CardTitle>
                                        <BarChart4 />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-[#ff9e00]">
                                        {smplHash.toFixed(2)} PH/s
                                        </div>
                                    </CardContent>
                                    </Card>
                                                <Card >
                                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                    <CardTitle className="text-xl font-medium">
                                                    Our Power Draw
                                                    </CardTitle>
                                                    <BarChart4 />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold text-[#ff9e00]">
                                                    {smplPower.toFixed(2)} MW's
                                                    </div>
                                                </CardContent>
                                                </Card>
        </div>
        
        {/* <div className="grid gap-4 md:grid-cols-5 lg:grid-cols-5 pt-5 pl-20 pr-20">
          <Card >
          <CardHeader className="flex flex-row items-center justify-between pb-10">
            <CardTitle className="text-3xl font-medium">
              Site 1
            </CardTitle>
            <Building2 style={{ color: "#ff9e00"}}/>
          </CardHeader>
          <CardContent className="text-xl" style={{ color: "#aeaeae"}}>
            Cedar Falls, IA
          </CardContent>
          <CardContent className="text-xl">
            Miners Online: <span style={{ color: "#4ade80"}}>{cfuOnline}</span> / <span style={{ color: "#4ade80"}}>{cfuTotal}</span>
          </CardContent>
          <CardContent className="text-xl">
            Miners Offline: <span className="text-[#ff2f00]">{cfuOffline}</span> ({cfuOfflinePercentage}%)
          </CardContent>
          <CardContent className="text-xl">
            Total Hashrate: <span style={{ color: "#ff9e00"}}>{cfuHashRateInPH.toFixed(2)}</span> PH/s
          </CardContent>
          <CardContent className="text-xl">
            Total Power: <span style={{ color: "#ff9e00"}}>{cfuPowerDraw.toFixed(2)}</span> MW's
          </CardContent>
          <CardContent className="text-xl">
          Temperature: <span className="text-[#006eff]">{cfuApparentTemperature}</span> °F
          </CardContent>
          <CardContent className="text-xl">
          <div className="flex items-center">
            <span>ISP: 250 MB/s </span>
            <Check className="pl-2" style={{ color: "#4ade80" }} />
          </div>
          </CardContent>
        </Card>

          
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-10">
            <CardTitle className="text-3xl font-medium">
              Site 2
            </CardTitle>
            <Building2 style={{ color: "#ff9e00"}}/>
          </CardHeader>
          <CardContent className="text-xl" style={{ color: "#aeaeae"}}>
            Lake Mills, IA
          </CardContent>
          <CardContent className="text-xl">
            Miners Online: <span style={{ color: "#4ade80"}}>{lmOnline}</span> / <span style={{ color: "#4ade80"}}>{lmTotal}</span>
          </CardContent>
          <CardContent className="text-xl">
            Miners Offline: <span className="text-[#ff2f00]">{lmOffline}</span>  ({lmOfflinePercentage}%)
          </CardContent>
          <CardContent className="text-xl">
            Total Hashrate: <span style={{ color: "#ff9e00"}}>{lmHashrateInPH.toFixed(2)}</span> PH/s
          </CardContent>
          <CardContent className="text-xl">
            Total Power: <span style={{ color: "#ff9e00"}}>{lmPowerDraw.toFixed(2)}</span> MW's
          </CardContent>
          <CardContent className="text-xl">
          Temperature: <span className="text-[#006eff]">{lmApparentTemperature}</span> °F
          </CardContent>
          <CardContent className="text-xl">
          <div className="flex items-center">
            <span>ISP: 500 MB/s </span>
            <Check className="pl-2" style={{ color: "#4ade80" }} />
          </div>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-10">
          <CardTitle className="text-3xl font-medium">
              Site 3 (HQ)
            </CardTitle>
            <Building2 style={{ color: "#ff9e00"}}/>
          </CardHeader>
          <CardContent className="text-xl" style={{ color: "#aeaeae"}}>
            Cedar Falls, IA
          </CardContent>
          <CardContent className="text-xl">
            Miners Online: <span style={{ color: "#4ade80"}}>{s3Online}</span> / <span style={{ color: "#4ade80"}}>{s3Total}</span>
          </CardContent>
          <CardContent className="text-xl">
            Miners Offline: <span className="text-[#ff2f00]">{s3Offline}</span> ({s3OfflinePercentage}%)
          </CardContent>
          <CardContent className="text-xl">
            Total Hashrate: <span style={{ color: "#ff9e00"}}>{s3HashrateInPH.toFixed(2)}</span> PH/s
          </CardContent>
          <CardContent className="text-xl">
            Total Power: <span style={{ color: "#ff9e00"}}>{s3PowerDraw.toFixed(2)}</span> MW's
          </CardContent>
          <CardContent className="text-xl">
          Temperature: <span className="text-[#006eff]">{s3ApparentTemperature}</span> °F
          </CardContent>
          <CardContent className="text-xl">
          <div className="flex items-center">
            <span>ISP: 250 MB/s </span>
            <Check className="pl-2" style={{ color: "#4ade80" }} />
          </div>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-10">
          <CardTitle className="text-3xl font-medium">
              Site 4
            </CardTitle>
            <Building2 style={{ color: "#ff9e00"}}/>
          </CardHeader>
          <CardContent className="text-xl" style={{ color: "#aeaeae"}}>
            Shelby, IA
          </CardContent>
          <CardContent className="text-xl">
            Miners Online: <span style={{ color: "#4ade80"}}>{shelbyOnline}</span> / <span style={{ color: "#4ade80"}}>{shelbyTotal}</span>
          </CardContent>
          <CardContent className="text-xl">
            Miners Offline: <span className="text-[#ff2f00]">{shelbyOffline}</span> ({shelbyOfflinePercentage}%)
          </CardContent>
          <CardContent className="text-xl">
            Total Hashrate: <span style={{ color: "#ff9e00"}}>{shelbyHashrateInPH.toFixed(2)}</span> PH/s
          </CardContent>
          <CardContent className="text-xl">
            Total Power: <span style={{ color: "#ff9e00"}}>{shelbyPowerDraw.toFixed(2)}</span> MW's
          </CardContent>
          <CardContent className="text-xl">
          Temperature: <span className="text-[#006eff]">{shelbyApparentTemperature}</span> °F
          </CardContent>
          <CardContent className="text-xl">
          <div className="flex items-center">
            <span>ISP: 100 MB/s </span>
            <Check className="pl-2" style={{ color: "#4ade80" }} />
          </div>
          </CardContent>
        </Card>

    </div> */}
        
        </>
      );
    };
    