-- Create the links table if it doesn't exist
CREATE TABLE IF NOT EXISTS links (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(8) NOT NULL UNIQUE,
    target TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    total_clicks BIGINT DEFAULT 0,
    last_clicked TIMESTAMP WITH TIME ZONE,
    deleted BOOLEAN DEFAULT FALSE
);

-- Create an index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_links_code ON links(code);

-- Ensure the target column exists (for safety in existing tables)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='links' AND column_name='target'
    ) THEN
        ALTER TABLE links ADD COLUMN target TEXT NOT NULL;
    END IF;
END
$$;
