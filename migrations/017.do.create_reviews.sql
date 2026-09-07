CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL
        REFERENCES properties(id)
        ON DELETE CASCADE,
    reservation_id UUID
        REFERENCES reservations(id)
        ON DELETE SET NULL,
    guest_id UUID
        REFERENCES guests(id)
        ON DELETE SET NULL,
    rating INTEGER NOT NULL,
    title VARCHAR(255),
    comment TEXT NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (rating BETWEEN 1 AND 5)
);

CREATE INDEX idx_reviews_property
ON reviews(property_id);

CREATE INDEX idx_reviews_created
ON reviews(created_at DESC);