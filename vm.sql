CREATE DATABASE vehicle_management;
USE vehicle_management;

-- Table for Vehicles
CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Accessories
CREATE TABLE accessories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT,
    name VARCHAR(50) NOT NULL,
    quantity INT DEFAULT 1,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Table for Insurance
CREATE TABLE insurance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT,
    provider VARCHAR(100) NOT NULL,
    policy_number VARCHAR(50) NOT NULL,
    expiry_date DATE NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Table for Registration
CREATE TABLE registration (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT,
    registration_number VARCHAR(50) NOT NULL,
    expiry_date DATE NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Table for Maintenance
CREATE TABLE maintenance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT,
    service_type VARCHAR(100) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    date_serviced DATE NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Table for Fuel Monitoring
CREATE TABLE fuel_monitoring (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT,
    odometer_reading INT NOT NULL,
    fuel_budget DECIMAL(10,2) NOT NULL,
    date_logged DATE NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);
