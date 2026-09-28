CREATE DATABASE IF NOT EXISTS study_group_db;
USE study_group_db;

-- Spring Boot will create/update the tables automatically.
-- Optional sample data:
INSERT INTO subjects(name) VALUES ('Java') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO subjects(name) VALUES ('DBMS') ON DUPLICATE KEY UPDATE name=name;
