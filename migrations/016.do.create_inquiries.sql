CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE inquiries (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    property_id UUID
        REFERENCES properties(id)
        ON DELETE SET NULL,

    first_name TEXT NOT NULL,

    last_name TEXT,

    email CITEXT NOT NULL,

    phone TEXT,

    subject TEXT,

    message TEXT NOT NULL,

    check_in DATE,

    check_out DATE,

    guests_count INTEGER,

    quote JSONB,

    status TEXT NOT NULL DEFAULT 'new',

    CONSTRAINT inquiries_status_check
    CHECK (
        status IN (
            'new',
            'pending_confirmation',
            'confirmed',
            'declined',
            'canceled'
        )
    ),

    created_by TEXT NOT NULL DEFAULT 'guest'
        CHECK (
            created_by IN (
                'guest',
                'admin'
            )
        ),

    sent_at TIMESTAMPTZ,

    responded_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT inquiries_valid_dates
        CHECK (
            check_in IS NULL
            OR check_out IS NULL
            OR check_out > check_in
        ),

    CONSTRAINT inquiries_valid_guests
        CHECK (
            guests_count IS NULL
            OR guests_count > 0
        )

);