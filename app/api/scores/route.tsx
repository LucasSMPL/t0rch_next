import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const scoresFilePath = path.resolve(process.cwd(), 'scores.json');

export async function GET() {
  try {
    if (!fs.existsSync(scoresFilePath)) {
      fs.writeFileSync(scoresFilePath, JSON.stringify([]));
    }

    const scores = JSON.parse(fs.readFileSync(scoresFilePath, 'utf-8'));
    return NextResponse.json({ success: true, data: scores });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load scores' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!fs.existsSync(scoresFilePath)) {
      fs.writeFileSync(scoresFilePath, JSON.stringify([]));
    }

    const newScore = await request.json();
    const scores = JSON.parse(fs.readFileSync(scoresFilePath, 'utf-8'));
    scores.push(newScore);
    scores.sort((a: any, b: any) => b.score - a.score);
    fs.writeFileSync(scoresFilePath, JSON.stringify(scores, null, 2));
    return NextResponse.json({ success: true, data: scores });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save score' }, { status: 500 });
  }
}
