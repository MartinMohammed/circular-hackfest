CREATE TABLE IF NOT EXISTS identifications (
  id SERIAL PRIMARY KEY,
  serial_number VARCHAR(255) NOT NULL,
  appliance_type VARCHAR(255) NOT NULL,
  timestamp BIGINT NOT NULL
);
