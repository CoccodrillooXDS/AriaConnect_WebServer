CREATE DATABASE defaultdb;
USE defaultdb;

CREATE TABLE json_values (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    data DATETIME NOT NULL,
    value JSON NOT NULL,
    INDEX idx_data (data)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

