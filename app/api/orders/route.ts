import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuth } from '@/lib/telegram'

export async function POST(req: Request) {
  try {
    const { user } = getAuth(req)
    const { productId } = await req.json()
    const sql = db()

    await sql`
      INSERT INTO users (telegram_id, first_name, username)
      VALUES (${user.id}, ${user.first_name}, ${user.username || null})
      ON CONFLICT (telegram_id) DO UPDATE
      SET first_name = EXCLUDED.first_name,
          username = EXCLUDED.username
    `

    const orders = await sql`
      WITH selected AS (
        SELECT id, title, price, mode, delivery_content
        FROM products
        WHERE id = ${productId}
          AND active = true
          AND mode <> 'paused'
      ),
      debited AS (
        UPDATE users AS u
        SET balance = u.balance - selected.price
        FROM selected
        WHERE u.telegram_id = ${user.id}
          AND u.balance >= selected.price
        RETURNING
          selected.id,
          selected.title,
          selected.price,
          selected.mode,
          selected.delivery_content
      ),
      logged AS (
        INSERT INTO balance_log (telegram_id, amount, reason)
        SELECT
          ${user.id},
          -price,
          'Покупка: ' || title
        FROM debited
        RETURNING id
      )
      INSERT INTO orders (
        telegram_id,
        product_id,
        amount,
        status,
        delivery
      )
      SELECT
        ${user.id},
        id,
        price,
        CASE WHEN mode = 'auto' THEN 'completed' ELSE 'pending' END,
        CASE WHEN mode = 'auto' THEN delivery_content ELSE NULL END
      FROM debited
      RETURNING id, status, delivery
    `

    if (!orders[0]) {
      throw new Error('Недостаточно средств или товар недоступен')
    }

    return NextResponse.json(orders[0])
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Не удалось оформить заказ'

    return NextResponse.json({ error: message }, { status: 400 })
  }
}