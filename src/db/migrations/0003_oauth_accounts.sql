CREATE TABLE IF NOT EXISTS oauth_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK(provider IN ('google')),
  provider_account_id TEXT NOT NULL,
  email TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS oauth_provider_account_unique ON oauth_accounts(provider, provider_account_id);
CREATE INDEX IF NOT EXISTS oauth_user_idx ON oauth_accounts(user_id);
