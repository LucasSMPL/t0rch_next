import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { BarChart4, Bitcoin, Receipt } from "lucide-react";
import { revalidatePath } from "next/cache";
import SiteCard from "./components/site-card";
import TitleCard from "./components/title-card";

// Site 1 = 8180
// Site 2 = 8179
// Site 3 = 25955
// SMPL = 21556
// Inventory = 25701
// Shelby = 26627
// PrarieRose = 27213
// e94d1b
//ff7f0f

const sites = [
  {
    siteId: 8180,
    name: "Site 1",
    location: "Cedar Falls, IA",
    lg: 92.4455,
    lt: 42.5278,
  },
  {
    siteId: 8179,
    name: "Site 2",
    location: "Lake Mills, IA",
    lg: 93.5333,
    lt: 43.4194,
  },
  {
    siteId: 25955,
    name: "Site 3 (HQ)",
    location: "Cedar Falls, IA",
    lg: 92.4455,
    lt: 42.5278,
  },
  {
    siteId: 26627,
    name: "Site 4",
    location: "Shelby, IA",
    lg: 95.338,
    lt: 41.4767,
  },
  {
    siteId: 27213,
    name: "Site 5",
    location: "Harlan, IA",
    lg: 95.3256,
    lt: 41.653,
  },
];

const reloadData = async () => {
  "use server";
  revalidatePath("/base", "page");
};

export default async function BasePage() {
  console.log("Rendering Page");

  const stats = await getStats();

  return (
    <>
      <TitleCard refreshData={reloadData} />

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 pl-20 pr-20 pb-5">
        {stats.map((item) => (
          <StatsCard key={item.title} {...item} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-5 lg:grid-cols-5 pt-5 pl-20 pr-20">
        {sites.map((site) => (
          <SiteCard key={site.siteId} {...site} />
        ))}
      </div>
    </>
  );
}

const StatsCard = ({
  icon,
  title,
  value,
}: {
  title: string;
  value?: string;
  icon: React.ReactNode;
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[#ff9e00]">
          {value ? value : "Loading..."}
        </div>
      </CardContent>
    </Card>
  );
};

const getStats = async () => {
  // Bitcoin and Hashrate Data (unchanged)
  const bitcoin = await axios.get<{ USD: number }>(
    "https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD"
  );

  const hashRateResponse = await axios.post<{
    data: { bitcoinOverviews: { nodes: { networkHashrate7D: number }[] } };
  }>(
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
    }
  );

  const hashPriceResponse = await axios.post<{
    data: { bitcoinOverviews: { nodes: { hashpriceUsd: number }[] } };
  }>(
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
    }
  );

  return [
    {
      title: "Bitcoin Price",
      value: bitcoin.data.USD.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
      icon: <Bitcoin />,
    },
    {
      title: "Hashprice",
      value: (
        hashPriceResponse.data.data.bitcoinOverviews.nodes[0].hashpriceUsd *
        1000
      ).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
      icon: <Receipt />,
    },
    {
      title: "Network Hashrate (7d)",
      value:
        (
          hashRateResponse.data.data.bitcoinOverviews.nodes[0]
            .networkHashrate7D / 1000000
        ).toFixed(3) + " EH/s",
      icon: <BarChart4 />,
    },
  ];
};
