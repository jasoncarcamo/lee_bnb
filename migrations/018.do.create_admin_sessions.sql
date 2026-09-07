CREATE TABLE admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    admin_id UUID NOT NULL
        REFERENCES admin_account(id)
        ON DELETE CASCADE,

    session_token_hash TEXT NOT NULL UNIQUE,

    ip_address INET,

    user_agent TEXT,

    expires_at TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_sessions_admin
ON admin_sessions(admin_id);

CREATE INDEX idx_admin_sessions_expires
ON admin_sessions(expires_at);