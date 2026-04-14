-- Migration: Migrate existing data to ticket system
-- Date: 2026-04-13
-- Description: Переносит пользователей из messages и создаёт менеджеров из admin_users

-- ============================================
-- 1. Перенос пользователей из messages → telegram_users
-- ============================================
INSERT INTO telegram_users (telegram_chat_id, telegram_username, telegram_first_name)
SELECT DISTINCT
  m.telegram_chat_id,
  NULL, -- username не хранился в messages
  m.username AS telegram_first_name
FROM messages m
WHERE NOT EXISTS (
  SELECT 1 FROM telegram_users tu 
  WHERE tu.telegram_chat_id = m.telegram_chat_id
);

-- ============================================
-- 2. Создание записей в managers для существующих admin_users
-- ============================================
INSERT INTO managers (admin_user_id, max_tickets, is_online)
SELECT 
  au.id,
  10, -- default max_tickets
  false -- по умолчанию офлайн
FROM admin_users au
WHERE NOT EXISTS (
  SELECT 1 FROM managers m 
  WHERE m.admin_user_id = au.id
);

-- ============================================
-- 3. (Опционально) Создать тикеты для старых сообщений
-- ============================================
-- Если хотите, чтобы все старые сообщения стали тикетами:
-- Раскомментируйте блок ниже

/*
INSERT INTO tickets (user_id, status, priority, subject)
SELECT DISTINCT
  tu.id,
  'new',
  'medium',
  'Тикет из старых сообщений'
FROM messages m
JOIN telegram_users tu ON tu.telegram_chat_id = m.telegram_chat_id
WHERE NOT EXISTS (
  SELECT 1 FROM tickets t 
  WHERE t.user_id = tu.id
);
*/

-- ============================================
-- Проверка результатов
-- ============================================
DO $$
DECLARE
  users_count INT;
  managers_count INT;
BEGIN
  SELECT COUNT(*) INTO users_count FROM telegram_users;
  SELECT COUNT(*) INTO managers_count FROM managers;
  
  RAISE NOTICE 'Перенесено пользователей: %', users_count;
  RAISE NOTICE 'Создано менеджеров: %', managers_count;
END $$;
