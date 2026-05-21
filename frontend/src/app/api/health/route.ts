import { NextResponse } from 'next/server';

/**
 * Lightweight health check route for UptimeRobot.
 * Pinged every 5 minutes to prevent Render free tier from spinning down.
 * URL: GET /api/health
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'coding-classroom-frontend',
    },
    { status: 200 }
  );
}
