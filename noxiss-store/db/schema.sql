CREATE TABLE IF NOT EXISTS users (telegram_id BIGINT PRIMARY KEY, first_name TEXT NOT NULL, username TEXT, balance NUMERIC(12,2) NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS products (id BIGSERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, price NUMERIC(12,2) NOT NULL, icon TEXT NOT NULL DEFAULT 'sparkles', mode TEXT NOT NULL DEFAULT 'auto' CHECK(mode IN ('auto','manual','paused')), delivery_content TEXT, active BOOLEAN NOT NULL DEFAULT true, sort_order INT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS orders (id BIGSERIAL PRIMARY KEY, telegram_id BIGINT REFERENCES users(telegram_id), product_id BIGINT REFERENCES products(id), amount NUMERIC(12,2) NOT NULL, status TEXT NOT NULL, delivery TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS invoices (id BIGSERIAL PRIMARY KEY, telegram_id BIGINT REFERENCES users(telegram_id), provider_id BIGINT UNIQUE, amount NUMERIC(12,2) NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS balance_log (id BIGSERIAL PRIMARY KEY, telegram_id BIGINT REFERENCES users(telegram_id), amount NUMERIC(12,2) NOT NULL, reason TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
INSERT INTO products(title,description,price,icon,mode,delivery_content,sort_order)
SELECT * FROM (VALUES
('Launch Kit','Чек-лист запуска Telegram Mini App и готовая структура проекта.',5.00,'rocket','auto','Спасибо за покупку! Материалы: https://example.com/launch-kit',1),
('Creator Pack','30 шаблонов постов и сторис для продвижения Telegram-проекта.',12.00,'layers','auto','Creator Pack: https://example.com/creator-pack',2),
('Noxiss UI Kit','Тёмный UI-набор: карточки, формы, навигация и компоненты магазина.',25.00,'gem','auto','Noxiss UI Kit: https://example.com/ui-kit',3)
) AS v(title,description,price,icon,mode,delivery_content,sort_order)
WHERE NOT EXISTS (SELECT 1 FROM products);
