-- Migration: Create support ticket system
-- Date: 2026-04-13
-- Description: Creates tables for users, tickets, conversations, and managers

-- ============================================
-- TABLE: telegram_users
-- Хранит информацию о пользователях Telegram
-- ============================================
CREATE TABLE IF NOT EXISTS telegram_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_chat_id BIGINT UNIQUE NOT NULL,
  telegram_username TEXT,
  telegram_first_name TEXT,
  telegram_last_name TEXT,
  assigned_manager_id UUID, -- FK будет добавлен позже
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_telegram_users_chat_id ON telegram_users(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_users_username ON telegram_users(telegram_username);
CREATE INDEX IF NOT EXISTS idx_telegram_users_manager ON telegram_users(assigned_manager_id);

-- ============================================
-- TABLE: tickets
-- Тикеты поддержки (создаются вручную менеджером)
-- ============================================
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES telegram_users(id) ON DELETE CASCADE,
  manager_id UUID, -- будет связан с admin_users
  status TEXT NOT NULL CHECK (status IN ('new', 'open', 'pending', 'closed')) DEFAULT 'new',
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  subject TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES admin_users(id)
);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_manager_id ON tickets(manager_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);

-- ============================================
-- TABLE: conversations
-- Переписка между менеджером и пользователем
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'manager', 'bot')),
  sender_id UUID, -- user_id или manager_id в зависимости от sender_type
  text TEXT NOT NULL,
  attachments JSONB, -- опционально: файлы, фото
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_ticket_id ON conversations(ticket_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_unread ON conversations(is_read, sender_type) WHERE is_read = false;

-- ============================================
-- TABLE: managers
-- Профили менеджеров (расширение admin_users)
-- ============================================
CREATE TABLE IF NOT EXISTS managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID UNIQUE NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  telegram_chat_id BIGINT, -- для уведомлений в Telegram
  is_online BOOLEAN DEFAULT false,
  max_tickets INT DEFAULT 10, -- максимальное количество тикетов
  current_tickets INT DEFAULT 0, -- текущая нагрузка
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_managers_admin_user ON managers(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_managers_telegram ON managers(telegram_chat_id);

-- ============================================
-- FOREIGN KEY: связываем telegram_users с managers
-- ============================================
ALTER TABLE telegram_users
  ADD CONSTRAINT fk_telegram_users_manager
  FOREIGN KEY (assigned_manager_id) REFERENCES managers(id) ON DELETE SET NULL;

-- ============================================
-- TRIGGERS: updated_at для всех таблиц
-- ============================================

-- Для telegram_users
DROP TRIGGER IF EXISTS update_telegram_users_updated_at ON telegram_users;
CREATE TRIGGER update_telegram_users_updated_at
  BEFORE UPDATE ON telegram_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Для tickets
DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Для managers
DROP TRIGGER IF EXISTS update_managers_updated_at ON managers;
CREATE TRIGGER update_managers_updated_at
  BEFORE UPDATE ON managers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ФУНКЦИИ: вспомогательные функции
-- ============================================

-- Функция: автоматическое обновление current_tickets у менеджера
CREATE OR REPLACE FUNCTION update_manager_ticket_count()
RETURNS TRIGGER AS $$
BEGIN
  -- При создании тикета с назначенным менеджером
  IF TG_OP = 'INSERT' AND NEW.manager_id IS NOT NULL THEN
    UPDATE managers
    SET current_tickets = current_tickets + 1,
        updated_at = now()
    WHERE id = NEW.manager_id;
    RETURN NEW;
  
  -- При удалении тикета или снятии менеджера
  ELSIF TG_OP = 'DELETE' AND OLD.manager_id IS NOT NULL THEN
    UPDATE managers
    SET current_tickets = GREATEST(current_tickets - 1, 0),
        updated_at = now()
    WHERE id = OLD.manager_id;
    RETURN OLD;
  
  -- При изменении менеджера (с одного на другого)
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.manager_id IS DISTINCT FROM NEW.manager_id THEN
      -- У старого менеджера уменьшаем
      IF OLD.manager_id IS NOT NULL THEN
        UPDATE managers
        SET current_tickets = GREATEST(current_tickets - 1, 0),
            updated_at = now()
        WHERE id = OLD.manager_id;
      END IF;
      -- У нового менеджера увеличиваем
      IF NEW.manager_id IS NOT NULL THEN
        UPDATE managers
        SET current_tickets = current_tickets + 1,
            updated_at = now()
        WHERE id = NEW.manager_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_manager_tickets ON tickets;
CREATE TRIGGER trg_update_manager_tickets
  AFTER INSERT OR UPDATE OR DELETE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_manager_ticket_count();

-- ============================================
-- VIEW: быстрая статистика по тикетам
-- ============================================
CREATE OR REPLACE VIEW ticket_statistics AS
SELECT
  m.id AS manager_id,
  au.email AS manager_email,
  au.full_name AS manager_name,
  m.is_online,
  m.max_tickets,
  m.current_tickets,
  COUNT(t.id) FILTER (WHERE t.status = 'new') AS new_tickets,
  COUNT(t.id) FILTER (WHERE t.status = 'open') AS open_tickets,
  COUNT(t.id) FILTER (WHERE t.status = 'pending') AS pending_tickets,
  COUNT(t.id) FILTER (WHERE t.status = 'closed') AS closed_tickets,
  COUNT(t.id) AS total_tickets
FROM managers m
LEFT JOIN admin_users au ON m.admin_user_id = au.id
LEFT JOIN tickets t ON m.id = t.manager_id
GROUP BY m.id, au.email, au.full_name;

-- ============================================
-- RLS ОТКЛЮЧЁН — аутентификация через session/cookie
-- ============================================
ALTER TABLE telegram_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE managers DISABLE ROW LEVEL SECURITY;

-- ============================================
-- COMMENTS: документация
-- ============================================
COMMENT ON TABLE telegram_users IS 'Пользователи Telegram, которые писали боту';
COMMENT ON TABLE tickets IS 'Тикеты поддержки (создаются вручную менеджером)';
COMMENT ON TABLE conversations IS 'Переписка в рамках тикета (менеджер ↔ пользователь)';
COMMENT ON TABLE managers IS 'Профили менеджеров (расширение admin_users)';
COMMENT ON VIEW ticket_statistics IS 'Статистика по тикетам для каждого менеджера';
