import React, { useState } from 'react';
import axios from 'axios';

interface HardwareStatsParams {
  consumption: number;
  hashrate: number;
  electricity: number;
}

interface HardwareStatsResponse {
  break_even: number;
  break_even_bos: number;
  btc_mined_daily: number;
  btc_mined_daily_bos: number;
  daily_profit: number;
  daily_profit_bos: number;
}

const BitcoinMiningCalculator: React.FC = () => {
  const [params, setParams] = useState<HardwareStatsParams>({
    consumption: 3250,
    hashrate: 110,
    electricity: 0.08,
  });
  const [results, setResults] = useState<HardwareStatsResponse | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams((prevParams) => ({ ...prevParams, [name]: Number(value) }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
  
    const payload = [params];
  
    try {
      const response = await axios.post('https://corsproxy.io/?https://insights.braiins.com/api/v1.0/hardware-stats', payload, config);
      setResults(response.data[0]);
    } catch (error) {
      console.error('Error fetching hardware stats:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="number" name="consumption" value={params.consumption} onChange={handleChange} placeholder="Consumption (W)" />
        <input type="number" name="hashrate" value={params.hashrate} onChange={handleChange} placeholder="Hashrate (TH/s)" />
        <input type="number" name="electricity" value={params.electricity} onChange={handleChange} placeholder="Electricity Cost ($/kWh)" />
        <button type="submit">Calculate</button>
      </form>
      {results && (
        <div style={{ backgroundColor: 'lightgreen', padding: '20px', marginTop: '20px' }}>
          <p>Daily Profit: ${results.daily_profit.toFixed(2)}</p>
          <p>BTC Mined Daily: {results.btc_mined_daily.toFixed(8)} BTC</p>
        </div>
      )}
    </div>
  );
};

export default BitcoinMiningCalculator;