CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    payment_id UUID NOT NULL
        REFERENCES payments(id)
        ON DELETE RESTRICT,

    amount NUMERIC(10, 2) NOT NULL,

    reason TEXT,

    provider_refund_id VARCHAR(255),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (amount > 0)
);

CREATE INDEX idx_refunds_payment
ON refunds(payment_id);