import { NextResponse } from "next/server";
import { pool } from "@/db";
import { getNotifications } from "@/lib/data";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET(request: Request) {
  try {
    await ensureDbInitialized();
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("userId") || "1", 10);
    const list = await getNotifications(userId);
    return NextResponse.json({ notifications: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbInitialized();
    const body = await request.json();
    const { userId } = body;
    if (userId) {
      await pool.query("UPDATE notifications SET is_read = true WHERE user_id = $1", [parseInt(userId, 10)]);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
