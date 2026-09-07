CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL
        REFERENCES reservations(id)
        ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    payment_provider VARCHAR(50) NOT NULL DEFAULT 'stripe',
    provider_payment_id VARCHAR(255),
    provider_customer_id VARCHAR(255),
    provider_checkout_session_id VARCHAR(255),
    paid_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (amount >= 0)
);

CREATE INDEX idx_payments_reservation
ON payments(reservation_id);

CREATE INDEX idx_payments_provider_payment
ON payments(provider_payment_id);