CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID NOT NULL
        REFERENCES guests(id)
        ON DELETE CASCADE,
    property_id UUID
        REFERENCES properties(id)
        ON DELETE SET NULL,
    reservation_id UUID
        REFERENCES reservations(id)
        ON DELETE SET NULL,
    subject VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'open',
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_guest
ON conversations(guest_id);

CREATE INDEX idx_conversations_property
ON conversations(property_id);

CREATE INDEX idx_conversations_reservation
ON conversations(reservation_id);

CREATE INDEX idx_conversations_last_message
ON conversations(last_message_at DESC);