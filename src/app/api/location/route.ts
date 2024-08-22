import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    try {
        const response = await fetch(`https://ipinfo.io/json?token=${process.env.NEXT_PUBLIC_IPINFO_TOKEN}`);
        if (!response.ok) {
          return NextResponse.json({ error: 'Failed to fetch Location' }, { status: response.status });
        }
        const data = await response.json();
        return NextResponse.json({ country: data.country }, { status: 200 });
      } catch (error) {
        return NextResponse.json({ error: 'An error occurred during fetching Location' }, { status: 500 });
      }
}