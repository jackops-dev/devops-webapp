CREATE TABLE IF NOT EXISTS kunden (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL
);


CREATE TABLE IF NOT EXISTS mitarbeiter (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);


CREATE TABLE IF NOT EXISTS wachbuch_eintraege (
    id SERIAL PRIMARY KEY,

    mitarbeiter_id INTEGER NOT NULL
        REFERENCES mitarbeiter(id),

    zeitpunkt TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    kategorie VARCHAR(50) NOT NULL,

    text TEXT NOT NULL
);


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


CREATE TABLE IF NOT EXISTS arbeitszeiten (
    id SERIAL PRIMARY KEY,

    schicht_id INTEGER NOT NULL
        REFERENCES schichten(id),

    mitarbeiter_id INTEGER NOT NULL
        REFERENCES mitarbeiter(id),

    dienstbeginn TIMESTAMP NOT NULL,

    dienstende TIMESTAMP,

    CHECK (
        dienstende IS NULL
        OR dienstende > dienstbeginn
    )
);