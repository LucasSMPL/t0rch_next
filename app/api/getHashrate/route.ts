import { NextRequest, NextResponse } from 'next/server';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import DigestFetch from 'digest-fetch';

const hashrateFilePath = path.join(process.cwd(), 'hashrateData.json');

export const config = {
  api: {
    bodyParser: false, // Disable body parsing
  },
};

let hashrateData: { timestamp: number, totalHashrate: number }[] = [];

// Load existing data from JSON file
const loadHashrateData = () => {
  if (fs.existsSync(hashrateFilePath)) {
    const rawData = fs.readFileSync(hashrateFilePath, 'utf-8');
    hashrateData = JSON.parse(rawData);
    console.log('Hashrate data loaded from JSON file.');
  } else {
    fs.writeFileSync(hashrateFilePath, JSON.stringify([]));
    console.log('Hashrate JSON file created.');
  }
};

// Save data to JSON file
const saveHashrateData = () => {
  fs.writeFileSync(hashrateFilePath, JSON.stringify(hashrateData, null, 2));
  console.log('Hashrate data saved to JSON file.');
};

// Fetch hashrate data from miners
const fetchHashrateData = async () => {
  console.log('Starting hashrate data fetch...');
  
  // Start timing the API execution
  const startTime = Date.now();

  loadHashrateData();

  const filePath = path.join(process.cwd(), 'app/api/getHashrate/miner_ip.csv');
  const ipAddresses: string[] = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => ipAddresses.push(data.miner_ip))
    .on('end', async () => {
      const client = new DigestFetch('root', 'root');
      const results: { ip: string, hashrate: number | null }[] = [];

      const fetchHashrate = async (ip: string) => {
        try {
          const response = await client.fetch(`http://${ip}/cgi-bin/stats.cgi`, {
            method: 'GET',
          });
          const result = await response.json();

          if (result.STATUS.STATUS === 'S') {
            const rate5s = result.STATS[0]?.rate_5s || 0;
            results.push({ ip, hashrate: rate5s });
          } else {
            results.push({ ip, hashrate: null });
          }
        } catch (error) {
          results.push({ ip, hashrate: null });
        }
      };

      // Send requests concurrently
      const promises = ipAddresses.map((ip) => fetchHashrate(ip));
      await Promise.all(promises);

      // Aggregate total hashrate
      const totalHashrate = results.reduce((sum, result) => sum + (result.hashrate || 0), 0);
      console.log(`Total aggregated hashrate: ${totalHashrate}`);

      // Store the data with a timestamp
      hashrateData.push({ timestamp: Date.now(), totalHashrate });

      // Keep only the last 60 entries
      if (hashrateData.length > 60) {
        hashrateData.shift();
      }

      saveHashrateData();
      
      // Log total API execution time
      const endTime = Date.now();
      console.log(`Hashrate data fetch and save complete. Total time: ${(endTime - startTime) / 1000} seconds.`);
    });
};

// Trigger the API call every 90 seconds
const startInterval = () => {
  setInterval(() => {
    console.log('Auto-triggering hashrate data fetch.');
    fetchHashrateData();
  }, 90000); // 90 seconds
};

startInterval(); // Start the interval when the server starts

export async function POST(req: NextRequest) {
  console.log('Manual trigger via POST request received.');
  await fetchHashrateData(); // Fetch data manually via POST if needed
  return NextResponse.json({ message: 'Processing requests' });
}

export async function GET(req: NextRequest) {
  loadHashrateData();

  // Get the latest entry in the hashrateData array
  const latestEntry = hashrateData.length > 0 ? hashrateData[hashrateData.length - 1] : null;
  const totalHashrate = latestEntry ? latestEntry.totalHashrate : 0;

  return NextResponse.json({ hashrateData, totalHashrate });
}
