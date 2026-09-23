CREATE TABLE reservations (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    /*
        RELATIONSHIPS
    */

    inquiry_id UUID UNIQUE

        REFERENCES inquiries(id)

        ON DELETE SET NULL,

    property_id UUID NOT NULL

        REFERENCES properties(id)

        ON DELETE RESTRICT,

    guest_id UUID NOT NULL

        REFERENCES guests(id)

        ON DELETE RESTRICT,

    /*
        RESERVATION INFORMATION
    */

    confirmation_code VARCHAR(20) NOT NULL UNIQUE,

    check_in DATE NOT NULL,

    check_out DATE NOT NULL,

    guests_count INTEGER NOT NULL DEFAULT 1,

    nights INTEGER NOT NULL,

    /*
        PRICING
    */

    nightly_subtotal NUMERIC(10, 2) NOT NULL,

    cleaning_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,

    service_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,

    taxes NUMERIC(10, 2) NOT NULL DEFAULT 0,

    discount NUMERIC(10, 2) NOT NULL DEFAULT 0,

    total_price NUMERIC(10, 2) NOT NULL,

    currency CHAR(3) NOT NULL DEFAULT 'USD',

    /*
        RESERVATION STATUS
    */

    status VARCHAR(30) NOT NULL DEFAULT 'pending',

    /*
        ADDITIONAL INFORMATION
    */

    special_requests TEXT,

    cancellation_reason TEXT,

    cancelled_at TIMESTAMPTZ,

    /*
        TIMESTAMPS
    */

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    /*
        CONSTRAINTS
    */

    CHECK (check_out > check_in),

    CHECK (guests_count > 0),

    CHECK (nights > 0),

    CHECK (nightly_subtotal >= 0),

    CHECK (cleaning_fee >= 0),

    CHECK (service_fee >= 0),

    CHECK (taxes >= 0),

    CHECK (discount >= 0),

    CHECK (total_price >= 0),

    CONSTRAINT reservations_status_check

        CHECK (

            status IN (

                'pending',

                'confirmed',

                'cancelled',

                'completed',

                'expired'

            )

        )

);


/*
    INDEXES
*/

CREATE INDEX idx_reservations_property

ON reservations(property_id);


CREATE INDEX idx_reservations_guest

ON reservations(guest_id);


CREATE INDEX idx_reservations_dates

ON reservations(check_in, check_out);


CREATE INDEX idx_reservations_status

ON reservations(status);


CREATE INDEX idx_reservations_inquiry

ON reservations(inquiry_id);