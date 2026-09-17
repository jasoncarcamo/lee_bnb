CREATE TABLE password_reset_tokens (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    admin_id UUID NOT NULL
        REFERENCES admin_account(id)
        ON DELETE CASCADE,

    token_hash TEXT NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,

    used_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);


CREATE INDEX idx_password_reset_tokens_admin
ON password_reset_tokens(admin_id);


CREATE INDEX idx_password_reset_tokens_token_hash
ON password_reset_tokens(token_hash);