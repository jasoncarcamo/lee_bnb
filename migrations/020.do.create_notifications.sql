CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    property_id UUID
        REFERENCES properties(id)
        ON DELETE SET NULL,
    reservation_id UUID
        REFERENCES reservations(id)
        ON DELETE SET NULL,
    conversation_id UUID
        REFERENCES conversations(id)
        ON DELETE SET NULL,
    inquiry_id UUID
        REFERENCES inquiries(id)
        ON DELETE SET NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_unread
ON notifications(is_read, created_at DESC);