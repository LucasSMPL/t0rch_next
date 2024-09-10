"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MiningProfitabilityCalculator: React.FC = () => {
  const [bitcoinPrice, setBitcoinPrice] = useState<number | null>(null);
  const [networkDifficulty, setNetworkDifficulty] = useState<number | null>(null);
  const [profitability, setProfitability] = useState<string | null>(null);

  // Fetch Bitcoin price
  useEffect(() => {
    const fetchBitcoinPrice = async () => {
      try {
        const response = await axios.get('https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD');
        setBitcoinPrice(response.data.USD);
      } catch (error) {
        console.error('Failed to fetch Bitcoin price:', error);
      }
    };
    fetchBitcoinPrice();
  }, []);

  // Fetch Network Difficulty
  useEffect(() => {
    const fetchNetworkDifficulty = async () => {
      try {
        const response = await fetch('https://corsproxy.io/?https://insights.braiins.com/api/v1.0/difficulty-stats');
        const data = await response.json();
        setNetworkDifficulty(data.difficulty);
      } catch (error) {
        console.error('Error fetching network difficulty:', error);
      }
    };
    fetchNetworkDifficulty();
  }, []);

  // Calculate profitability (simplified calculation for demonstration)
  useEffect(() => {
    if (bitcoinPrice && networkDifficulty) {
      // Placeholder values for hashrate, power consumption, etc.
      const hashrateThPerS = 110; // in TH/s
      const powerConsumptionWatts = 3250; // in Watts
      const electricityCostPerKWh = 0.08; // in $/kWh
      const poolMaintenanceFeePercentage = 0.9; // in %

      const bitcoinsMinedPerDay = (hashrateThPerS * 1e12 / networkDifficulty) * 144;
      const miningRevenueUSD = bitcoinsMinedPerDay * bitcoinPrice;
      const miningFeesUSD = miningRevenueUSD * (poolMaintenanceFeePercentage / 100);
      const electricityCostsUSD = (powerConsumptionWatts / 1000) * 24 * electricityCostPerKWh;
      const profitPerDayUSD = miningRevenueUSD - miningFeesUSD - electricityCostsUSD;

      setProfitability(`Profit per day: $${profitPerDayUSD.toFixed(2)}`);
    }
  }, [bitcoinPrice, networkDifficulty]);

  return (
    <div>
      <h2>Mining Profitability Calculator</h2>
      <p>Bitcoin Price: {bitcoinPrice ? `$${bitcoinPrice.toLocaleString('en-US')}` : 'Loading...'}</p>
      <p>Network Difficulty: {networkDifficulty || 'Loading...'}</p>
      <p>{profitability || 'Calculating profitability...'}</p>
    </div>
  );
};

export default MiningProfitabilityCalculator;
