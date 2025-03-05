const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const ReportGenerator = require('./utils/report-generator');
const app = express();
const port = 3000;

// Middleware
app.use(cors());  // Add this line
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

// MySQL Connection without database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'arora'  // your MySQL password
});

// First, create database and tables
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL successfully');

    // Create database
    connection.query('CREATE DATABASE IF NOT EXISTS signup_db', (err) => {
        if (err) {
            console.error('Error creating database:', err);
            return;
        }
        console.log('Database created or already exists');

        // Switch to the database
        connection.query('USE signup_db', (err) => {
            if (err) {
                console.error('Error selecting database:', err);
                return;
            }
            console.log('Using signup_db database');

            // Create users table
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    full_name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`;

            connection.query(createTableQuery, (err) => {
                if (err) {
                    console.error('Error creating table:', err);
                    return;
                }
                console.log('Users table created or already exists');
            });
        });
    });
});

// After creating users table, add this code to create diabetes_predictions table
connection.query('USE signup_db', (err) => {
    if (err) {
        console.error('Error selecting database:', err);
        return;
    }
    
    // Create diabetes_predictions table
    const createDiabetesTableQuery = `
        CREATE TABLE IF NOT EXISTS diabetes_predictions (
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
        )`;

    connection.query(createDiabetesTableQuery, (err) => {
        if (err) {
            console.error('Error creating diabetes predictions table:', err);
            return;
        }
        console.log('Diabetes predictions table created or already exists');
    });
});

// After creating users table, update the heart_predictions table creation
connection.query('USE signup_db', (err) => {
    if (err) {
        console.error('Error selecting database:', err);
        return;
    }
    
    // Create heart_predictions table with updated fields
    const createHeartTableQuery = `
        CREATE TABLE IF NOT EXISTS heart_predictions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            age INT,
            sex TINYINT,
            chest_pain_type INT,
            resting_bp INT,
            cholesterol INT,
            fasting_blood_sugar TINYINT,
            resting_ecg INT,
            max_heart_rate INT,
            exercise_angina TINYINT,
            st_depression FLOAT,
            st_slope INT,
            num_vessels INT,
            thal INT,
            prediction_result BOOLEAN,
            risk_percentage FLOAT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`;

    connection.query(createHeartTableQuery, (err) => {
        if (err) {
            console.error('Error creating heart predictions table:', err);
            return;
        }
        console.log('Heart predictions table created or already exists');
    });
});

// After other table creations, update the parkinsons_predictions table
connection.query('USE signup_db', (err) => {
    if (err) {
        console.error('Error selecting database:', err);
        return;
    }
    
    const createParkinsonsTableQuery = `
        CREATE TABLE IF NOT EXISTS parkinsons_predictions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            mdvp_fo FLOAT,
            mdvp_fhi FLOAT,
            mdvp_flo FLOAT,
            mdvp_jitter_percent FLOAT,
            mdvp_jitter_abs FLOAT,
            mdvp_rap FLOAT,
            mdvp_ppq FLOAT,
            jitter_ddp FLOAT,
            mdvp_shimmer FLOAT,
            mdvp_shimmer_db FLOAT,
            shimmer_apq3 FLOAT,
            shimmer_apq5 FLOAT,
            mdvp_apq FLOAT,
            shimmer_dda FLOAT,
            nhr FLOAT,
            hnr FLOAT,
            rpde FLOAT,
            dfa FLOAT,
            spread1 FLOAT,
            spread2 FLOAT,
            d2 FLOAT,
            ppe FLOAT,
            prediction_result BOOLEAN,
            risk_percentage FLOAT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`;

    connection.query(createParkinsonsTableQuery, (err) => {
        if (err) {
            console.error('Error creating parkinsons predictions table:', err);
            return;
        }
        console.log('Parkinsons predictions table created or already exists');
    });
});

// Serve static files
app.use(express.static(__dirname));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// Add homepage route at the beginning of routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Serve the landing page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

// Update the dashboard route to serve the file directly
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/predictions/diabetes', (req, res) => {
    res.sendFile(__dirname + '/views/predictions/diabetes.html');
});

app.get('/predictions/heart', (req, res) => {
    res.sendFile(__dirname + '/views/predictions/heart.html');
});

app.get('/predictions/parkinsons', (req, res) => {
    res.sendFile(__dirname + '/views/predictions/parkinsons.html');
});

// Add the about page route
app.get('/about', (req, res) => {
    res.sendFile(__dirname + '/views/about.html');
});

// Add signup page route - place near other page routes
app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/views/signup.html');
});

// Signup endpoint
app.post('/signup', async (req, res) => {
    const { fullName, email, password } = req.body;

    // Input validation
    if (!fullName || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)';

        connection.query(query, [fullName, email, hashedPassword], (error, results) => {
            if (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Email already exists' });
                }
                return res.status(500).json({ error: 'Error saving to database' });
            }

            // Return user data similar to login endpoint
            const userData = {
                id: results.insertId,
                fullName: fullName,
                email: email,
                token: 'dummy-token-' + results.insertId // In production, use proper JWT token
            };
            
            res.status(201).json(userData);
        });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [users] = await connection.promise().query(query, [email]);

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Send user data (excluding password)
        const userData = {
            id: user.id,
            fullName: user.full_name,
            email: user.email,
            token: 'dummy-token-' + user.id // In production, use proper JWT token
        };

        res.json(userData);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Add login page route
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
});

// Replace the existing diabetes prediction endpoint with this updated version
app.post('/api/predict/diabetes', async (req, res) => {
    try {
        const { 
            pregnancies,
            glucose,
            bloodPressure,
            skinThickness,
            insulin,
            bmi,
            diabetesPedigree,
            age,
            userId
        } = req.body;

        // Input validation
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Convert all inputs to numbers and validate
        const inputs = {
            pregnancies: Number(pregnancies) || 0,
            glucose: Number(glucose),
            bloodPressure: Number(bloodPressure),
            skinThickness: Number(skinThickness) || 0,
            insulin: Number(insulin) || 0,
            bmi: Number(bmi),
            diabetesPedigree: Number(diabetesPedigree) || 0,
            age: Number(age)
        };

        // Validate required fields
        if (!inputs.glucose || !inputs.bloodPressure || !inputs.bmi || !inputs.age) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Calculate prediction
        const prediction = calculateDiabetesRisk(
            inputs.glucose,
            inputs.bmi,
            inputs.age,
            inputs.diabetesPedigree
        );

        // Save prediction to database
        const query = `
            INSERT INTO diabetes_predictions 
            (user_id, pregnancies, glucose, blood_pressure, skin_thickness, 
             insulin, bmi, diabetes_pedigree, age, prediction_result, risk_percentage)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            userId,
            inputs.pregnancies,
            inputs.glucose,
            inputs.bloodPressure,
            inputs.skinThickness,
            inputs.insulin,
            inputs.bmi,
            inputs.diabetesPedigree,
            inputs.age,
            prediction.result,
            prediction.risk
        ];

        connection.query(query, values, (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Error saving prediction' });
            }

            // Return prediction results
            res.json({
                prediction_id: results.insertId,
                risk_percentage: prediction.risk,
                result: prediction.result,
                details: {
                    glucose_impact: prediction.glucoseImpact,
                    bmi_impact: prediction.bmiImpact,
                    age_impact: prediction.ageImpact,
                    pedigree_impact: prediction.pedigreeImpact
                }
            });
        });
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ error: 'Error processing prediction' });
    }
});

// Update the heart disease prediction endpoint
app.post('/api/predict/heart', async (req, res) => {
    const { 
        userId, age, sex, chestPainType, restingBP, 
        cholesterol, fastingBS, restingECG, maxHR, 
        exerciseAngina, stDepression, stSlope,
        numVessels, thal
    } = req.body;

    // Input validation
    if (!userId || !age || !restingBP || !cholesterol || !maxHR) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Calculate heart disease risk based on multiple factors
        const prediction = calculateHeartRisk(
            age, restingBP, cholesterol, maxHR,
            sex, chestPainType, fastingBS, exerciseAngina,
            stDepression, stSlope, numVessels, thal
        );

        const query = `
            INSERT INTO heart_predictions 
            (user_id, age, sex, chest_pain_type, resting_bp, 
             cholesterol, fasting_blood_sugar, resting_ecg, 
             max_heart_rate, exercise_angina, st_depression, 
             st_slope, num_vessels, thal, prediction_result, 
             risk_percentage)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        connection.query(
            query, 
            [userId, age, sex, chestPainType, restingBP, 
             cholesterol, fastingBS, restingECG, maxHR, 
             exerciseAngina, stDepression, stSlope, 
             numVessels, thal, prediction.result, 
             prediction.risk],
            (error, results) => {
                if (error) {
                    console.error('Database error:', error);
                    return res.status(500).json({ error: 'Error saving prediction' });
                }
                res.json({
                    prediction_id: results.insertId,
                    risk_percentage: prediction.risk,
                    result: prediction.result,
                    details: prediction.details
                });
            }
        );
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ error: 'Error making prediction' });
    }
});

// Update the Parkinson's prediction endpoint
app.post('/api/predict/parkinsons', async (req, res) => {
    const { 
        userId,
        mdvp_fo,
        mdvp_fhi,
        mdvp_flo,
        mdvp_jitter_percent,
        mdvp_jitter_abs,
        mdvp_rap,
        mdvp_ppq,
        jitter_ddp,
        mdvp_shimmer,
        mdvp_shimmer_db,
        shimmer_apq3,
        shimmer_apq5,
        mdvp_apq,
        shimmer_dda,
        nhr,
        hnr,
        rpde,
        dfa,
        spread1,
        spread2,
        d2,
        ppe
    } = req.body;

    // Input validation
    if (!userId || !mdvp_fo || !mdvp_fhi || !mdvp_flo) {
        return res.status(400).json({ error: 'Required fields are missing' });
    }

    try {
        const prediction = calculateParkinsonsRisk({
            mdvp_jitter_percent,
            mdvp_shimmer,
            hnr,
            rpde,
            dfa,
            spread1,
            spread2,
            d2,
            ppe
        });

        const query = `
            INSERT INTO parkinsons_predictions (
                user_id, mdvp_fo, mdvp_fhi, mdvp_flo, mdvp_jitter_percent,
                mdvp_jitter_abs, mdvp_rap, mdvp_ppq, jitter_ddp,
                mdvp_shimmer, mdvp_shimmer_db, shimmer_apq3, shimmer_apq5,
                mdvp_apq, shimmer_dda, nhr, hnr, rpde, dfa,
                spread1, spread2, d2, ppe, prediction_result, risk_percentage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        connection.query(
            query,
            [userId, mdvp_fo, mdvp_fhi, mdvp_flo, mdvp_jitter_percent,
             mdvp_jitter_abs, mdvp_rap, mdvp_ppq, jitter_ddp,
             mdvp_shimmer, mdvp_shimmer_db, shimmer_apq3, shimmer_apq5,
             mdvp_apq, shimmer_dda, nhr, hnr, rpde, dfa,
             spread1, spread2, d2, ppe, prediction.result, prediction.risk],
            (error, results) => {
                if (error) {
                    console.error('Database error:', error);
                    return res.status(500).json({ error: 'Error saving prediction' });
                }
                res.json({
                    prediction_id: results.insertId,
                    risk_percentage: prediction.risk,
                    result: prediction.result,
                    details: prediction.details
                });
            }
        );
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ error: 'Error making prediction' });
    }
});

// Get prediction history
app.get('/api/predictions/history', (req, res) => {
    // TODO: Get user ID from token
    const userId = 1; // Temporary hardcoded value

    const query = `
        SELECT * FROM (
            SELECT id, 'diabetes' as test_type, risk_percentage, created_at FROM diabetes_predictions WHERE user_id = ?
            UNION ALL
            SELECT id, 'heart' as test_type, risk_percentage, created_at FROM heart_predictions WHERE user_id = ?
            UNION ALL
            SELECT id, 'parkinsons' as test_type, risk_percentage, created_at FROM parkinsons_predictions WHERE user_id = ?
        ) AS predictions
        ORDER BY created_at DESC
        LIMIT 10
    `;

    connection.query(query, [userId, userId, userId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error fetching prediction history' });
        }
        res.json({ predictions: results });
    });
});

// Get prediction summary
app.get('/api/predictions/summary', (req, res) => {
    // TODO: Get user ID from token
    const userId = 1; // Temporary hardcoded value

    const query = `
        SELECT 
            COUNT(*) as totalTests,
            AVG(risk_percentage) as averageRisk,
            MAX(created_at) as lastCheck
        FROM (
            SELECT risk_percentage, created_at FROM diabetes_predictions WHERE user_id = ?
            UNION ALL
            SELECT risk_percentage, created_at FROM heart_predictions WHERE user_id = ?
            UNION ALL
            SELECT risk_percentage, created_at FROM parkinsons_predictions WHERE user_id = ?
        ) AS all_predictions
    `;

    connection.query(query, [userId, userId, userId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error fetching summary statistics' });
        }
        res.json(results[0]);
    });
});

// Get user profile
app.get('/api/user/profile', (req, res) => {
    const userId = 1; // TODO: Get from JWT token
    const query = `
        SELECT u.full_name, u.email, p.*
        FROM users u
        LEFT JOIN user_profiles p ON u.id = p.user_id
        WHERE u.id = ?
    `;

    connection.query(query, [userId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error fetching profile' });
        }
        res.json(results[0] || {});
    });
});

// Update user profile
app.put('/api/user/profile', (req, res) => {
    const userId = 1; // TODO: Get from JWT token
    const { fullName, email, phone, dateOfBirth, gender } = req.body;

    connection.query('START TRANSACTION', async (err) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        try {
            // Update users table
            await connection.promise().query(
                'UPDATE users SET full_name = ?, email = ? WHERE id = ?',
                [fullName, email, userId]
            );

            // Update or insert profile
            await connection.promise().query(`
                INSERT INTO user_profiles (user_id, phone, date_of_birth, gender)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                phone = VALUES(phone),
                date_of_birth = VALUES(date_of_birth),
                gender = VALUES(gender)
            `, [userId, phone, dateOfBirth, gender]);

            await connection.promise().query('COMMIT');
            res.json({ message: 'Profile updated successfully' });
        } catch (error) {
            await connection.promise().query('ROLLBACK');
            res.status(500).json({ error: 'Error updating profile' });
        }
    });
});

// Update user password
app.put('/api/user/password', async (req, res) => {
    const userId = 1; // TODO: Get from JWT token
    const { currentPassword, newPassword } = req.body;

    try {
        const [user] = await connection.promise().query(
            'SELECT password FROM users WHERE id = ?',
            [userId]
        );

        if (!user.length || !await bcrypt.compare(currentPassword, user[0].password)) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await connection.promise().query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedNewPassword, userId]
        );

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating password' });
    }
});

// Update user preferences
app.put('/api/user/preferences', (req, res) => {
    const userId = 1; // TODO: Get from JWT token
    const { emailNotifications, smsAlerts, language } = req.body;

    const query = `
        INSERT INTO user_profiles (user_id, email_notifications, sms_alerts, language)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        email_notifications = VALUES(email_notifications),
        sms_alerts = VALUES(sms_alerts),
        language = VALUES(language)
    `;

    connection.query(query, [userId, emailNotifications, smsAlerts, language], (error) => {
        if (error) {
            return res.status(500).json({ error: 'Error updating preferences' });
        }
        res.json({ message: 'Preferences updated successfully' });
    });
});

function calculateMockRisk(glucose, bmi, age) {
    // Mock risk calculation - replace with actual ML model
    let risk = 0;
    if (glucose > 140) risk += 30;
    if (bmi > 30) risk += 30;
    if (age > 50) risk += 20;
    
    return {
        risk: Math.min(risk, 100),
        result: risk > 50
    };
}

function calculateHeartRisk(age, bp, cholesterol, maxHR, sex, 
    chestPainType, fastingBS, exerciseAngina, stDepression, 
    stSlope, numVessels, thal) {
    
    let risk = 0;
    let details = {};

    // Age impact (0-15 points)
    details.ageImpact = age > 50 ? 15 : (age > 40 ? 10 : 5);
    risk += details.ageImpact;

    // Blood Pressure impact (0-15 points)
    details.bpImpact = bp > 140 ? 15 : (bp > 120 ? 10 : 5);
    risk += details.bpImpact;

    // Cholesterol impact (0-15 points)
    details.cholesterolImpact = cholesterol > 240 ? 15 : (cholesterol > 200 ? 10 : 5);
    risk += details.cholesterolImpact;

    // Heart Rate impact (0-10 points)
    details.hrImpact = maxHR > 170 ? 10 : (maxHR > 150 ? 7 : 5);
    risk += details.hrImpact;

    // ST Depression impact (0-15 points)
    details.stImpact = stDepression > 2 ? 15 : (stDepression > 1 ? 10 : 5);
    risk += details.stImpact;

    // Number of vessels impact (0-15 points)
    details.vesselsImpact = numVessels > 2 ? 15 : (numVessels > 0 ? 10 : 5);
    risk += details.vesselsImpact;

    // Additional factors impact (0-15 points)
    let additionalRisk = 0;
    if (exerciseAngina) additionalRisk += 5;
    if (fastingBS) additionalRisk += 5;
    if (thal > 0) additionalRisk += 5;
    details.additionalImpact = additionalRisk;
    risk += additionalRisk;

    return {
        risk: Math.min(risk, 100),
        result: risk > 50,
        details
    };
}

function calculateParkinsonsRisk(params) {
    let risk = 0;
    let details = {};

    // MDVP Jitter impact (0-15 points)
    details.jitterImpact = params.mdvp_jitter_percent > 1.0 ? 15 : 
                         (params.mdvp_jitter_percent > 0.5 ? 10 : 5);
    risk += details.jitterImpact;

    // Shimmer impact (0-15 points)
    details.shimmerImpact = params.mdvp_shimmer > 0.1 ? 15 :
                          (params.mdvp_shimmer > 0.05 ? 10 : 5);
    risk += details.shimmerImpact;

    // HNR impact (0-15 points)
    details.hnrImpact = params.hnr < 20 ? 15 :
                      (params.hnr < 25 ? 10 : 5);
    risk += details.hnrImpact;

    // RPDE impact (0-10 points)
    details.rpdeImpact = params.rpde > 0.5 ? 10 : 5;
    risk += details.rpdeImpact;

    // DFA impact (0-10 points)
    details.dfaImpact = params.dfa > 0.7 ? 10 : 5;
    risk += details.dfaImpact;

    // Spread measures impact (0-15 points)
    details.spreadImpact = (params.spread1 > 0.2 || params.spread2 > 0.2) ? 15 : 
                         ((params.spread1 > 0.1 || params.spread2 > 0.1) ? 10 : 5);
    risk += details.spreadImpact;

    // D2 and PPE combined impact (0-20 points)
    details.complexityImpact = (params.d2 > 2.5 || params.ppe > 0.2) ? 20 :
                             ((params.d2 > 2.0 || params.ppe > 0.1) ? 15 : 10);
    risk += details.complexityImpact;

    return {
        risk: Math.min(risk, 100),
        result: risk > 50,
        details
    };
}

// Update the diabetes risk calculation function
function calculateDiabetesRisk(glucose, bmi, age, diabetesPedigree) {
    let risk = 0;
    let glucoseImpact = 0;
    let bmiImpact = 0;
    let ageImpact = 0;
    let pedigreeImpact = 0;
    
    // Glucose contribution (0-30 points)
    if (glucose < 100) glucoseImpact = 0;
    else if (glucose < 140) glucoseImpact = 15;
    else glucoseImpact = 30;
    risk += glucoseImpact;
    
    // BMI contribution (0-25 points)
    if (bmi < 25) bmiImpact = 0;
    else if (bmi < 30) bmiImpact = 15;
    else bmiImpact = 25;
    risk += bmiImpact;
    
    // Age contribution (0-25 points)
    if (age < 40) ageImpact = 0;
    else if (age < 60) ageImpact = 15;
    else ageImpact = 25;
    risk += ageImpact;
    
    // Diabetes Pedigree contribution (0-20 points)
    if (diabetesPedigree < 0.5) pedigreeImpact = 0;
    else if (diabetesPedigree < 1) pedigreeImpact = 10;
    else pedigreeImpact = 20;
    risk += pedigreeImpact;
    
    return {
        risk: Math.min(risk, 100),
        result: risk > 50,
        glucoseImpact,
        bmiImpact,
        ageImpact,
        pedigreeImpact
    };
}

// Add new report endpoints
app.post('/api/reports/generate', async (req, res) => {
    const userId = req.body.userId; // In production, get from JWT
    
    try {
        // Get user's prediction history
        const predictions = await connection.promise().query(`
            SELECT * FROM (
                SELECT 'diabetes' as test_type, risk_percentage, created_at 
                FROM diabetes_predictions WHERE user_id = ?
                UNION ALL
                SELECT 'heart' as test_type, risk_percentage, created_at 
                FROM heart_predictions WHERE user_id = ?
                UNION ALL
                SELECT 'parkinsons' as test_type, risk_percentage, created_at 
                FROM parkinsons_predictions WHERE user_id = ?
            ) AS predictions
            ORDER BY created_at DESC
        `, [userId, userId, userId]);

        // Get user info
        const [userInfo] = await connection.promise().query(
            'SELECT full_name, email FROM users WHERE id = ?',
            [userId]
        );

        // Generate and upload report
        const reportContent = ReportGenerator.generateReportContent(
            predictions[0],
            userInfo[0]
        );
        
        const reportUrl = await ReportGenerator.uploadReport(reportContent, userId);

        // Save report URL to database
        await connection.promise().query(
            'INSERT INTO user_reports (user_id, report_url) VALUES (?, ?)',
            [userId, reportUrl]
        );

        res.json({ reportUrl });
    } catch (error) {
        console.error('Report generation error:', error);
        res.status(500).json({ error: 'Error generating report' });
    }
});

// Get user's report history
app.get('/api/reports/history', async (req, res) => {
    const userId = 1; // In production, get from JWT
    
    try {
        const [reports] = await connection.promise().query(
            'SELECT * FROM user_reports WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        
        res.json({ reports });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching reports' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
