import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowBigDownDash } from "lucide-react";

// Since the API response is a simple object with the USD price,
// we don't necessarily need a separate interface if we're only fetching USD,
// but for the sake of clarity and expansion, let's define it:
interface BitcoinPriceResponse {
  USD: number;
}

const BitcoinPriceComponent: React.FC = () => {
  const [bitcoinPrice, setBitcoinPrice] = useState<string | null>(null);

  useEffect(() => {
    const fetchBitcoinPrice = async () => {
      try {
        const btcPriceResponse = await axios.get(
          "https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD"
        );
        const btcPrice = btcPriceResponse.data.USD;
        // Format the price to be more readable, with thousands separators
        const formattedBtcPrice = btcPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        setBitcoinPrice(formattedBtcPrice);
      } catch (error) {
        console.error("Failed to fetch Bitcoin price:", error);
        setBitcoinPrice("Error fetching price");
      }
    };

    fetchBitcoinPrice();
  }, []);

  return (
    <Card >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-medium">
          Bitcoin Price
        </CardTitle>
        <ArrowBigDownDash />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-orange-600">
          {bitcoinPrice ? bitcoinPrice : 'Loading...'}
        </div>
      </CardContent>
    </Card>
  );
};

export default BitcoinPriceComponent;
