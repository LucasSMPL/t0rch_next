import React, { useEffect, useState } from "react";
import axios from "axios";

interface PoolData {
  name: string;
  blocks_mined: number;
}

interface CountryData {
  code: string;
  label: string;
  pools: PoolData[];
  blocks_mined: number;
}

const BlocksByCountryPage: React.FC = () => {
  const [countryData, setCountryData] = useState<CountryData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://corsproxy.io/?https://insights.braiins.com/api/v1.0/blocks-by-country");
        setCountryData(response.data);
      } catch (error) {
        console.error("Error fetching blocks by country data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
    <div className="flex justify-center w-full">
              <h1 className="text-3xl font-medium pb-2">
                Mined Blocks By Country
              </h1>
            </div>
    <div style={{ overflowX: "auto", display: "flex", justifyContent: "center" }}>
      <table style={{ width: "55%", borderCollapse: "collapse" }}>
        <thead>
        <tr style={{ backgroundColor: "#e9580b" }}>
            {countryData.map((country) => (
              <th key={country.code} style={{ border: "1px solid #dddddd", textAlign: "center", padding: "4px" }}>
                {country.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {countryData.map((country) => (
              <td key={country.code} style={{ border: "1px solid #dddddd", textAlign: "center", padding: "4px" }}>
                {country.blocks_mined}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default BlocksByCountryPage;
