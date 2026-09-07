CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID
        REFERENCES properties(id)
        ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email CITEXT NOT NULL,
    phone VARCHAR(30),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    check_in DATE,
    check_out DATE,
    guests_count INTEGER,
    status VARCHAR(30) NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
        guests_count IS NULL
        OR guests_count > 0
    )
);

CREATE INDEX idx_inquiries_property
ON inquiries(property_id);

CREATE INDEX idx_inquiries_status
ON inquiries(status);

CREATE INDEX idx_inquiries_created
ON inquiries(created_at DESC);