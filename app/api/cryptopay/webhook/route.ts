import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyCryptoWebhook } from '@/lib/crypto-pay'

export async function POST(req: Request) {
  const body = await req.text()

  if (!verifyCryptoWebhook(body, req.headers.get('crypto-pay-api-signature'))) {
    return NextResponse.json({ error: 'bad signature' }, { status: 401 })
  }

  try {
    const event = JSON.parse(body)

    if (event.update_type !== 'invoice_paid') {
      return NextResponse.json({ ok: true })
    }

    const providerId = Number(event.payload.invoice_id)
    const sql = db()

    const invoices = await sql`
      SELECT *
      FROM invoices
      WHERE provider_id = ${providerId}
    `

    const invoice = invoices[0]

    if (!invoice || invoice.status === 'paid') {
      return NextResponse.json({ ok: true })
    }

    const marked = await sql`
      UPDATE invoices
      SET status = 'paid'
      WHERE id = ${invoice.id}
        AND status <> 'paid'
      RETURNING id
    `

    if (!marked[0]) {
      return NextResponse.json({ ok: true })
    }

    await sql.transaction([
      sql`
        UPDATE users
        SET balance = balance + ${invoice.amount}
        WHERE telegram_id = ${invoice.telegram_id}
      `,
      sql`
        INSERT INTO balance_log (telegram_id, amount, reason)
        VALUES (
          ${invoice.telegram_id},
          ${invoice.amount},
          'Crypto Pay deposit'
        )
      `,
    ])

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'invalid event' }, { status: 400 })
  }
}