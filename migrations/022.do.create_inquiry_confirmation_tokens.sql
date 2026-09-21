
CREATE TABLE inquiry_confirmation_tokens (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    inquiry_id UUID NOT NULL

        REFERENCES inquiries(id)

        ON DELETE CASCADE,

    token_hash TEXT NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,

    used_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT inquiry_confirmation_tokens_expiration_check

    CHECK (

        expires_at > created_at

    )

);


CREATE INDEX idx_inquiry_confirmation_tokens_inquiry

ON inquiry_confirmation_tokens(inquiry_id);


CREATE INDEX idx_inquiry_confirmation_tokens_expires

ON inquiry_confirmation_tokens(expires_at);