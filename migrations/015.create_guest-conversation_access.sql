CREATE TABLE guest_conversation_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID NOT NULL
        REFERENCES guests(id)
        ON DELETE CASCADE,
    conversation_id UUID NOT NULL
        REFERENCES conversations(id)
        ON DELETE CASCADE,
    access_token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guest_conversation_access_conversation
ON guest_conversation_access(conversation_id);