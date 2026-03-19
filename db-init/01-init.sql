CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Таблиця користувачів: зберігає всіх осіб у системі (клієнтів, майстрів, адміністраторів, гостей)
CREATE TABLE users (
    id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(), -- Унікальний ідентифікатор користувача
    first_name           VARCHAR(100) NOT NULL,                              -- Ім'я
    last_name            VARCHAR(100) NOT NULL,                              -- Прізвище
    phone                VARCHAR(20)  UNIQUE,                                -- Номер телефону (унікальний)
    email                VARCHAR(255) UNIQUE,                                -- Електронна пошта (унікальна)
    photo_url            VARCHAR(500),                                       -- Посилання на аватарку
    password_hash        VARCHAR(512),                                       -- Хеш пароля
    role                 VARCHAR(50)  NOT NULL DEFAULT 'Guest',              -- Роль користувача (напр., Guest, Client, Master, Admin)
    refresh_token        VARCHAR(512),                                       -- Секретний токен для оновлення сесії
    refresh_token_expiry TIMESTAMPTZ,                                        -- Час дії refresh-токена
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),                -- Дата та час створення профілю
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()                 -- Дата та час останнього оновлення
);

-- Таблиця майстрів: розширює таблицю users додатковими даними для персоналу
CREATE TABLE masters (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),            -- Унікальний ідентифікатор профілю майстра
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- Зв'язок із таблицею users (якщо користувача видалено, профіль майстра теж видаляється)
    bio        TEXT,                                                         -- Біографія або опис майстра
    is_active  BOOLEAN     NOT NULL DEFAULT TRUE,                            -- Статус активності (чи працює майстер зараз)
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()                            -- Дата оновлення профілю
);

-- Таблиця категорій: групування послуг (напр., "Масаж", "Стрижка")
CREATE TABLE categories (
    id        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),            -- Ідентифікатор категорії
    slug      VARCHAR(150) NOT NULL UNIQUE,                                  -- URL-ідентифікатор (напр., 'massage') (потрібне для можливого перекладу)
    title     VARCHAR(150) NOT NULL UNIQUE,                                  -- Назва категорії
    is_active BOOLEAN      NOT NULL DEFAULT TRUE                             -- Чи активна категорія
);

CREATE TABLE services (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),         -- Ідентифікатор послуги
    category_id UUID          NOT NULL REFERENCES categories(id) ON DELETE RESTRICT, -- Зв'язок з категорією (заборона видаляти категорію, якщо є прив'язані послуги)
    slug        VARCHAR(150)  NOT NULL UNIQUE,                               -- URL-ідентифікатор послуги
    title       VARCHAR(200)  NOT NULL,                                      -- Назва послуги
    description TEXT,                                                        -- Детальний опис
    duration    INT           NOT NULL,                                      -- Тривалість у хвилинах
    price       DECIMAL(10,2) NOT NULL,                                      -- Вартість послуги
    is_active   BOOLEAN       NOT NULL DEFAULT TRUE,                         -- Чи активна послуги
    badge       VARCHAR(50)   DEFAULT NULL,                                  -- Бейдж (напр., "Хіт", "Новинка")
    benefits    TEXT[]        NOT NULL DEFAULT '{}'                          -- Масив переваг або особливостей послуги
);

-- Таблиця зв'язку: які саме послуги може надавати конкретний майстер (Many-to-Many)
CREATE TABLE master_services (
    master_id  UUID NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (master_id, service_id)
);

-- Таблиця базового розкладу: стандартні робочі години майстра по днях тижня
CREATE TABLE schedules (
    id          UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
    master_id   UUID     NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL,                                           -- День тижня (0-6, де 0 зазвичай неділя)
    start_time  TIME     NOT NULL,                                           -- Час початку зміни
    end_time    TIME     NOT NULL,                                           -- Час завершення зміни
    CONSTRAINT chk_schedule_time CHECK (end_time > start_time),              -- Перевірка: кінець зміни має бути пізніше початку
    CONSTRAINT chk_schedule_day CHECK (day_of_week >= 0 AND day_of_week <= 6) -- Перевірка: валідний день тижня
);

-- Таблиця відпусток/відгулів майстрів
CREATE TABLE time_offs (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    master_id  UUID NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,                                                -- Дата початку відпустки
    end_date   DATE NOT NULL,                                                -- Дата завершення відпустки
    reason     TEXT,                                                         -- Причина (опціонально)
    CONSTRAINT chk_timeoff_dates CHECK (end_date >= start_date)              -- Перевірка: кінець відпустки не може бути раніше початку
);

CREATE INDEX idx_time_offs_master ON time_offs(master_id, start_date, end_date);

-- Таблиця бронювань (записів клієнтів до майстрів)
CREATE TABLE appointments (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id    UUID          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,   -- Клієнт (заборона видалення юзера, якщо є записи)
    master_id    UUID          NOT NULL REFERENCES masters(id) ON DELETE RESTRICT, -- Майстер
    service_id   UUID          NOT NULL REFERENCES services(id) ON DELETE RESTRICT, -- Послуга
    start_time   TIMESTAMPTZ   NOT NULL,                                           -- Час початку сеансу (з часовим поясом)
    end_time     TIMESTAMPTZ   NOT NULL,                                           -- Час завершення сеансу
    status       VARCHAR(50)   NOT NULL DEFAULT 'Confirmed',                       -- Статус (Підтверджено, Скасовано тощо)
    actual_price DECIMAL(10,2) NOT NULL,                                           -- Фактична ціна на момент запису (на випадок зміни базової ціни)
    client_notes TEXT,                                                             -- Коментарі або побажання клієнта
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),                             -- Коли було створено запис
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),                             -- Коли запис було оновлено
    CONSTRAINT chk_appointment_time CHECK (end_time > start_time),                 -- Сеанс не може закінчитись раніше, ніж почався

    -- Супер-обмеження: унеможливлює створення двох записів на один і той самий час до одного майстра
    CONSTRAINT no_overlapping_appointments
        EXCLUDE USING gist (
            master_id  WITH =,                                                     -- Для одного майстра...
            tstzrange(start_time, end_time, '[)') WITH &&                          -- ...діапазони часу не повинні перетинатися (&&)
        )
        WHERE (status NOT IN ('Cancelled', 'NoShow'))                              -- Ігноруємо скасовані записи та неявки
);

CREATE INDEX idx_appointments_master_time ON appointments(master_id, start_time);
CREATE INDEX idx_appointments_client      ON appointments(client_id);
CREATE INDEX idx_appointments_status      ON appointments(status);
