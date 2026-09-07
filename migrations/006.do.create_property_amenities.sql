CREATE TABLE property_amenities (
    property_id UUID NOT NULL
        REFERENCES properties(id)
        ON DELETE CASCADE,
    amenity_id UUID NOT NULL
        REFERENCES amenities(id)
        ON DELETE CASCADE,
    PRIMARY KEY (property_id, amenity_id)
);

CREATE INDEX idx_property_amenities_amenity
ON property_amenities(amenity_id);