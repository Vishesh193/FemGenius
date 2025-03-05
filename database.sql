CREATE DATABASE IF NOT EXISTS signup_db;
USE signup_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id INT PRIMARY KEY,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    avatar_url VARCHAR(255),
    email_notifications BOOLEAN DEFAULT true,
    sms_alerts BOOLEAN DEFAULT false,
    language VARCHAR(5) DEFAULT 'en',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Drop and recreate the diabetes_predictions table
DROP TABLE IF EXISTS diabetes_predictions;
CREATE TABLE diabetes_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    pregnancies FLOAT,
    glucose FLOAT,
    blood_pressure FLOAT,
    skin_thickness FLOAT,
    insulin FLOAT,
    bmi FLOAT,
    diabetes_pedigree FLOAT,
    age FLOAT,
    prediction_result BOOLEAN,
    risk_percentage FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Heart disease predictions table
CREATE TABLE IF NOT EXISTS heart_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    age INT,
    sex TINYINT,
    chest_pain_type INT,
    resting_bp INT,
    cholesterol INT,
    fasting_blood_sugar BOOLEAN,
    rest_ecg INT,
    max_heart_rate INT,
    exercise_angina BOOLEAN,
    prediction_result BOOLEAN,
    risk_percentage FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Parkinson's predictions table
CREATE TABLE IF NOT EXISTS parkinsons_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mdvp_fo FLOAT,
    mdvp_fhi FLOAT,
    mdvp_flo FLOAT,
    mdvp_jitter FLOAT,
    mdvp_shimmer FLOAT,
    nhr FLOAT,
    hnr FLOAT,
    prediction_result BOOLEAN,
    risk_percentage FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User reports table
CREATE TABLE IF NOT EXISTS user_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    report_type ENUM('diabetes', 'heart', 'parkinsons'),
    prediction_id INT,
    report_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS user_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    report_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
