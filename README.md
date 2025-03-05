# FemGenius
An AI-powered Multiple Disease Prediction System for early detection of Diabetes, Heart Disease, and Parkinson’s**. It enhances accessibility, reduces healthcare costs, and aids preventive care. Designed to assist individuals and doctors, it promotes quick, efficient, and cost-effective diagnosis, especially in remote areas.
## Features

- 🔍 Disease risk prediction based on symptoms
- 📊 Interactive dashboard with health insights
- 📈 Reports and analytics visualization
- 🔐 Secure user authentication
- 📱 Responsive design for all devices

## Tech Stack

- Frontend:
  - HTML5, CSS3, JavaScript
  - Chart.js for data visualization
  - Font Awesome icons
- Backend:
  - Node.js/Express.js
  - MongoDB for database
  - JWT for authentication
Prerequisites

- Node.js (v14.0 or higher)
- MongoDB
- Modern web browser

Installation
1. Clone the repository
```bash
git clone https://github.com/yourusername/disease-prediction-system.git
cd disease-prediction-system
```

2. Install dependencies
```bash
npm install3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the application
bashnpm start


Project Structure

```
frontend/
├── css/
├── js/
├── views/
└── assets/
```
 API Endpoints

- `/api/auth` - Authentication routes
- `/api/predictions` - Disease prediction endpoints
- `/api/reports` - Report generation and history

