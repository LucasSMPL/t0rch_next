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
  const filePath = path.join(process.cwd(), 'app/api/sleepMiners/miner_ip.csv');
  const logFilePath = path.join(process.cwd(), 'app/api/sleepMiners/log.csv');
  const detailedLogFilePath = path.join(process.cwd(), 'app/api/sleepMiners/detailed_log.txt');
  const ipAddresses: string[] = [];

  const startTime = performance.now();

  // Create a write stream for the detailed log file
  const detailedLogStream = fs.createWriteStream(detailedLogFilePath, { flags: 'a' });
  detailedLogStream.write(`Start Time: ${new Date().toISOString()}\n`);

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
        body: '{"miner-mode": "0"}', // Ensure this is unformatted --- MINER MODE 0 = AWAKE --- MINER MODE 1 = SLEEP
      };

      const results: { ip: string, status: string, error: string, timeTaken: number }[] = [];
      let completedRequests = 0;

      // Function to send a single request
      const sendRequest = async (ip: string) => {
        const requestStartTime = performance.now();
        console.log(`Sending request to ${ip}`);
        detailedLogStream.write(`Sending request to ${ip} at ${new Date().toISOString()}\n`);
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
            detailedLogStream.write(`Success for ${ip}: ${timeTaken.toFixed(2)} ms\n`);
          } else {
            results.push({ ip, status: 'failure', error: 'Invalid response', timeTaken });
            detailedLogStream.write(`Failure for ${ip}: Invalid response, ${timeTaken.toFixed(2)} ms\n`);
          }
        } catch (error: unknown) {
          const requestEndTime = performance.now();
          const timeTaken = requestEndTime - requestStartTime;
          results.push({ ip, status: 'failure', error: (error as Error).message, timeTaken });
          detailedLogStream.write(`Error for ${ip}: ${(error as Error).message}, ${timeTaken.toFixed(2)} ms\n`);
        }

        completedRequests++;
        if (completedRequests % 100 === 0 || completedRequests === ipAddresses.length) {
          const progress = (completedRequests / ipAddresses.length) * 100;
          console.log(`Progress: ${progress.toFixed(2)}% (${completedRequests}/${ipAddresses.length})`);
          detailedLogStream.write(`Progress: ${progress.toFixed(2)}% (${completedRequests}/${ipAddresses.length}) at ${new Date().toISOString()}\n`);
        }
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

      // Close the detailed log stream
      detailedLogStream.write(`Total Time Taken: ${totalTimeTaken.toFixed(2)} ms\n`);
      detailedLogStream.write(`End Time: ${new Date().toISOString()}\n`);
      detailedLogStream.end();

      // Log results
      console.log('Successful requests:', results.filter(r => r.status === 'success'));
      console.log('Failed requests:', results.filter(r => r.status === 'failure'));
      console.log('Total time taken:', totalTimeTaken.toFixed(2), 'ms');

      return NextResponse.json({
        message: 'Requests processed',
        results,
        totalTimeTaken: totalTimeTaken.toFixed(2),
        logFileUrl: '/api/sleepMiners/log' // URL to download the log file
      });
    });

  return NextResponse.json({ message: 'Processing requests' });
}

export async function GET(req: NextRequest) {
  const logFilePath = path.join(process.cwd(), 'app/api/sleepMiners/log.csv');

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
