CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL
        REFERENCES properties(id)
        ON DELETE RESTRICT,
    guest_id UUID NOT NULL
        REFERENCES guests(id)
        ON DELETE RESTRICT,
    confirmation_code VARCHAR(20) NOT NULL UNIQUE,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests_count INTEGER NOT NULL DEFAULT 1,
    nights INTEGER NOT NULL,
    nightly_subtotal NUMERIC(10, 2) NOT NULL,
    cleaning_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    service_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    taxes NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_price NUMERIC(10, 2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    special_requests TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (check_out > check_in),
    CHECK (guests_count > 0),
    CHECK (nights > 0),
    CHECK (nightly_subtotal >= 0),
    CHECK (cleaning_fee >= 0),
    CHECK (service_fee >= 0),
    CHECK (taxes >= 0),
    CHECK (discount >= 0),
    CHECK (total_price >= 0)
);

CREATE INDEX idx_reservations_property
ON reservations(property_id);

CREATE INDEX idx_reservations_guest
ON reservations(guest_id);

CREATE INDEX idx_reservations_dates
ON reservations(check_in, check_out);

CREATE INDEX idx_reservations_status
ON reservations(status);
