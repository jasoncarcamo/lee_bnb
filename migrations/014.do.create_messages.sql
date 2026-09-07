CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL
        REFERENCES conversations(id)
        ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL,
    guest_id UUID
        REFERENCES guests(id)
        ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (sender_type IN ('guest', 'admin'))
);
CREATE INDEX idx_messages_conversation
ON messages(conversation_id, created_at);

CREATE INDEX idx_messages_guest
ON messages(guest_id);

CREATE INDEX idx_messages_unread
ON messages(is_read)
WHERE is_read = FALSE;