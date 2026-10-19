CREATE SCHEMA IF NOT EXISTS vault;
CREATE TABLE vault.secrets (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text UNIQUE, secret text, description text);
CREATE VIEW vault.decrypted_secrets AS SELECT id, name, secret AS decrypted_secret, description FROM vault.secrets;
CREATE FUNCTION vault.create_secret(new_secret text, new_name text DEFAULT NULL, new_description text DEFAULT '') RETURNS uuid LANGUAGE sql AS
$$ INSERT INTO vault.secrets(secret, name, description) VALUES (new_secret, new_name, new_description) RETURNING id $$;
CREATE FUNCTION vault.update_secret(secret_id uuid, new_secret text DEFAULT NULL, new_name text DEFAULT NULL, new_description text DEFAULT NULL) RETURNS void LANGUAGE sql AS
$$ UPDATE vault.secrets SET secret = coalesce(new_secret, secret) WHERE id = secret_id $$;
