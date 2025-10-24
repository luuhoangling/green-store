import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const idNum = Number(id);
  if (Number.isNaN(idNum)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });

  try {
    const rows = await sql`SELECT id, status, total_amount FROM orders WHERE id = ${idNum} LIMIT 1`;
    const order = rows[0] || null;
    return NextResponse.json(order);
  } catch (err) {
    console.error('order status error', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
