CREATE TABLE property_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL
        REFERENCES properties(id)
        ON DELETE CASCADE,
    name VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    nightly_price NUMERIC(10, 2) NOT NULL,
    minimum_nights INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_date >= start_date),
    CHECK (nightly_price >= 0),
    CHECK (
        minimum_nights IS NULL
        OR minimum_nights > 0
    )
);

CREATE INDEX idx_property_pricing_dates
ON property_pricing(property_id, start_date, end_date);