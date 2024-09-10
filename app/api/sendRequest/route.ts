import { NextRequest, NextResponse } from 'next/server';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import DigestFetch from 'digest-fetch';

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, so we can handle the file upload
  },
};

export async function POST(req: NextRequest) {
  const filePath = path.join(process.cwd(), 'app/api/awakeMiners/miner_ip.csv');
  const logFilePath = path.join(process.cwd(), 'app/api/awakeMiners/log.csv');
  const ipAddresses: string[] = [];

  const startTime = performance.now();

  // Read and parse the CSV file
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => ipAddresses.push(data.miner_ip))
    .on('end', async () => {
      const client = new DigestFetch('root', 'root');

      const requestOptions = {
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{"miner-mode": "0"}', // Ensure this is unformatted
      };

      const results: { ip: string, status: string, error: string, timeTaken: number }[] = [];

      let completedRequests = 0;
      const totalRequests = ipAddresses.length;

      const updateProgressBar = () => {
        const progressBarLength = 40;
        const progress = (completedRequests / totalRequests) * progressBarLength;
        const progressBar = `[${'='.repeat(progress)}${' '.repeat(progressBarLength - progress)}] ${completedRequests}/${totalRequests}`;
        process.stdout.write(`\r${progressBar}`);
      };

      // Function to send a single request
      const sendRequest = async (ip: string) => {
        const requestStartTime = performance.now();
        console.log(`Sending request to ${ip}`);
        try {
          const response = await client.fetch(`http://${ip}/cgi-bin/set_miner_conf.cgi`, {
            method: 'POST',
            headers: requestOptions.headers,
            body: requestOptions.body,
          });
          const result = await response.json();
          const requestEndTime = performance.now();

          const timeTaken = requestEndTime - requestStartTime;

          if (result.stats === 'success' && result.code === 'M000' && result.msg === 'OK!') {
            results.push({ ip, status: 'success', error: '', timeTaken });
          } else {
            results.push({ ip, status: 'failure', error: 'Invalid response', timeTaken });
          }
        } catch (error: unknown) {
          const requestEndTime = performance.now();
          const timeTaken = requestEndTime - requestStartTime;
          results.push({ ip, status: 'failure', error: (error as Error).message, timeTaken });
        }

        completedRequests++;
        updateProgressBar();
      };

      // Send requests concurrently
      const promises = ipAddresses.map((ip) => sendRequest(ip));
      await Promise.all(promises);

      const endTime = performance.now();
      const totalTimeTaken = endTime - startTime;

      // Generate CSV log file
      const csvString = [
        'ip,status,error,timeTaken',
        ...results.map(entry => `${entry.ip},${entry.status},${entry.error},${entry.timeTaken.toFixed(2)}`)
      ].join('\n');
      fs.writeFileSync(logFilePath, csvString);

      // Log results
      console.log('\nSuccessful requests:', results.filter(r => r.status === 'success'));
      console.log('Failed requests:', results.filter(r => r.status === 'failure'));
      console.log('Total time taken:', totalTimeTaken.toFixed(2), 'ms');

      return NextResponse.json({
        message: 'Requests processed',
        results,
        totalTimeTaken: totalTimeTaken.toFixed(2),
        logFileUrl: '/api/awakeMiners/log' // URL to download the log file
      });
    });

  return NextResponse.json({ message: 'Processing requests' });
}

export async function GET(req: NextRequest) {
  const logFilePath = path.join(process.cwd(), 'app/api/awakeMiners/log.csv');

  if (fs.existsSync(logFilePath)) {
    const fileContents = fs.readFileSync(logFilePath, 'utf8');
    return new Response(fileContents, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=log.csv',
      },
    });
  } else {
    return NextResponse.json({ message: 'Log file not found' }, { status: 404 });
  }
}
