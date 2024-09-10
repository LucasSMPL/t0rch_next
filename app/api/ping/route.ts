import { NextResponse } from 'next/server';
import ping from 'ping';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ip1 = searchParams.get('ip1');
  const ip2 = searchParams.get('ip2');

  if (!ip1 || !ip2) {
    return NextResponse.json({ error: 'Both IP parameters are required' }, { status: 400 });
  }

  try {
    const response1 = await ping.promise.probe(ip1);
    const response2 = await ping.promise.probe(ip2);

    return NextResponse.json({
      ip1: { host: response1.host, alive: response1.alive },
      ip2: { host: response2.host, alive: response2.alive }
    }, { status: 200 });
  } catch (error) {
    console.error('Ping error:', error);
    return NextResponse.json({ error: 'Failed to ping hosts' }, { status: 500 });
  }
}
