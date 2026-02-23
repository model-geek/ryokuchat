-- RLS (Row Level Security) ポリシーと Realtime 設定
-- drizzle-kit では生成できない要素を手書きで管理します。

-- =============================================================
-- RLS を有効化
-- =============================================================
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "channels" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "channel_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- profiles
-- =============================================================
CREATE POLICY "profiles_select" ON "profiles"
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_update_own" ON "profiles"
  FOR UPDATE TO authenticated USING (id = auth.uid());

-- =============================================================
-- channels
-- =============================================================
CREATE POLICY "channels_select" ON "channels"
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "channels_insert_own" ON "channels"
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "channels_update_own" ON "channels"
  FOR UPDATE TO authenticated USING (created_by = auth.uid());

-- =============================================================
-- channel_members
-- =============================================================
CREATE POLICY "channel_members_select" ON "channel_members"
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "channel_members_insert_own" ON "channel_members"
  FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());

CREATE POLICY "channel_members_delete_own" ON "channel_members"
  FOR DELETE TO authenticated USING (profile_id = auth.uid());

-- =============================================================
-- messages
-- =============================================================
CREATE POLICY "messages_select" ON "messages"
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "messages_insert_own" ON "messages"
  FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());

-- =============================================================
-- Realtime
-- =============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
