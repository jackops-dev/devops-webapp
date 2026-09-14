CREATE TABLE IF NOT EXISTS schichten (
    id SERIAL PRIMARY KEY,

    schichtart VARCHAR(20) NOT NULL
        CHECK (
            schichtart IN ('Tag', 'Nacht')
        ),

    beginn TIMESTAMP NOT NULL,

    ende TIMESTAMP NOT NULL,

    CHECK (
        ende > beginn
    ),

    CHECK (
        ende - beginn = INTERVAL '12 hours'
    ),

    UNIQUE (beginn)
);


ALTER TABLE arbeitszeiten
ADD COLUMN IF NOT EXISTS schicht_id INTEGER
REFERENCES schichten(id);