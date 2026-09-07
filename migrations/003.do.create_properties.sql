CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    property_type VARCHAR(100) NOT NULL,
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL DEFAULT 'USA',
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    max_guests INTEGER NOT NULL DEFAULT 1,
    bedrooms INTEGER NOT NULL DEFAULT 1,
    beds INTEGER NOT NULL DEFAULT 1,
    bathrooms DECIMAL(4, 1) NOT NULL DEFAULT 1,
    check_in_time TIME NOT NULL,
    check_out_time TIME NOT NULL,
    minimum_nights INTEGER NOT NULL DEFAULT 1,
    base_price NUMERIC(10, 2) NOT NULL,
    cleaning_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    instant_booking BOOLEAN NOT NULL DEFAULT FALSE,
    cancellation_policy TEXT,
    house_rules TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (max_guests > 0),
    CHECK (bedrooms >= 0),
    CHECK (beds >= 0),
    CHECK (bathrooms > 0),
    CHECK (minimum_nights > 0),
    CHECK (base_price >= 0),
    CHECK (cleaning_fee >= 0)
);

CREATE INDEX idx_properties_status
ON properties(status);

CREATE INDEX idx_properties_city
ON properties(city);