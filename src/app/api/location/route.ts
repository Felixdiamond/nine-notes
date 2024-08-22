import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        // Extract the user's IP address from request headers
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';

        // Validate the IP address (optional, if you want to add some validation)
        if (!ip) {
            return NextResponse.json({ error: 'IP address not found' }, { status: 400 });
        }

        // Fetch location data based on the user's IP address
        const response = await fetch(`https://ipinfo.io/${ip}/json?token=${process.env.NEXT_PUBLIC_IPINFO_TOKEN}`);
        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch Location' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json({ country: data.country }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'An error occurred during fetching Location' }, { status: 500 });
    }
}
