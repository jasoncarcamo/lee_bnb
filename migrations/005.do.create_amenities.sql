CREATE TABLE amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100),
    icon VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);