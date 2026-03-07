CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Users & Identity
CREATE TABLE users (
    id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name            VARCHAR(100) NOT NULL,
    last_name             VARCHAR(100) NOT NULL,
    phone                 VARCHAR(20)  UNIQUE,
    email                 VARCHAR(255) UNIQUE NOT NULL,
    password_hash         VARCHAR(512) NOT NULL,
    role                  VARCHAR(50)  NOT NULL DEFAULT 'Client',
    refresh_token         VARCHAR(512),
    refresh_token_expiry  TIMESTAMPTZ,
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE masters (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio        TEXT,
    photo_url  VARCHAR(500),
    is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Catalog
CREATE TABLE categories (
    id        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    slug      VARCHAR(150) NOT NULL UNIQUE,
    title     VARCHAR(150) NOT NULL UNIQUE,
    is_active BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE services (
    id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID           NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title       VARCHAR(200)   NOT NULL,
    description TEXT,
    duration    INT            NOT NULL,
    price       DECIMAL(10,2)  NOT NULL,
    is_active   BOOLEAN        NOT NULL DEFAULT TRUE,
    badge       VARCHAR(50)    DEFAULT NULL,
    benefits    TEXT[]         NOT NULL DEFAULT '{}'
);

CREATE TABLE master_services (
    master_id  UUID NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (master_id, service_id)
);

-- Scheduling
CREATE TABLE schedules (
    id          UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
    master_id   UUID     NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL,
    start_time  TIME     NOT NULL,
    end_time    TIME     NOT NULL,
    CONSTRAINT chk_schedule_time CHECK (end_time > start_time),
    CONSTRAINT chk_schedule_day CHECK (day_of_week >= 0 AND day_of_week <= 6)
);

CREATE TABLE time_offs (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    master_id  UUID NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date   DATE NOT NULL,
    reason     TEXT,
    CONSTRAINT chk_timeoff_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_time_offs_master ON time_offs(master_id, start_date, end_date);

-- Appointments
CREATE TABLE appointments (
    id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id    UUID           NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    master_id    UUID           NOT NULL REFERENCES masters(id) ON DELETE RESTRICT,
    service_id   UUID           NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    start_time   TIMESTAMPTZ    NOT NULL,
    end_time     TIMESTAMPTZ    NOT NULL,
    status       VARCHAR(50)    NOT NULL DEFAULT 'Pending',
    actual_price DECIMAL(10,2)  NOT NULL,
    client_notes TEXT,
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_appointment_time CHECK (end_time > start_time),

    CONSTRAINT no_overlapping_appointments
        EXCLUDE USING gist (
            master_id   WITH =,
            tstzrange(start_time, end_time, '[)') WITH &&
        )
        WHERE (status NOT IN ('Cancelled', 'NoShow'))
);

CREATE INDEX idx_appointments_master_time ON appointments(master_id, start_time);
CREATE INDEX idx_appointments_client      ON appointments(client_id);
CREATE INDEX idx_appointments_status      ON appointments(status);
