CREATE TABLE property_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL
        REFERENCES properties(id)
        ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    nightly_price NUMERIC(10, 2),
    minimum_nights INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (property_id, date),
    CHECK (
        nightly_price IS NULL
        OR nightly_price >= 0
    ),
    CHECK (
        minimum_nights IS NULL
        OR minimum_nights > 0
    )
);

CREATE INDEX idx_property_availability
ON property_availability(property_id, date);