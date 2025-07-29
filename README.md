# Heart Disease Prediction System

A comprehensive web application for heart disease prediction using machine learning, built with React (frontend) and Django (backend). The system allows patients to submit their medical data for heart disease risk assessment, doctors to review and provide feedback on predictions, and administrators to manage the system.

## Project Structure

The project is organized into two main parts:

### Frontend (React + Vite)
- Located in the project root directory
- Built with React, Vite, and Bootstrap
- Features modular components and responsive design
- Includes separate dashboards for administrators and doctors

### Backend (Django)
- Located in the `/backend` directory
- Built with Django and Django REST Framework
- Provides API endpoints for authentication and prediction functionality
- Includes user management with different roles (admin, doctor, patient)

## Features

- **User Authentication**: Secure login/registration for different user roles
- **Role-Based Access**: Different interfaces and permissions for admins, doctors, and patients
- **Heart Disease Prediction**: Machine learning model to predict heart disease risk
- **Doctor Reviews**: Doctors can review predictions and provide feedback
- **Admin Dashboard**: Statistics and system management for administrators
- **Doctor Dashboard**: Patient data review and management for doctors
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- npm or yarn
- pip

### Frontend Setup

1. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn
   ```

2. Start the development server:
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```

3. The frontend will be available at `http://localhost:5173`

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment (optional but recommended):
   ```
   python -m venv .venv
   .venv\Scripts\activate  # On Windows
   source .venv/bin/activate  # On macOS/Linux
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```
   python manage.py makemigrations
   python manage.py migrate
   ```

5. Create a superuser (admin):
   ```
   python manage.py createsuperuser
   ```

6. Start the development server:
   ```
   python manage.py runserver
   ```

7. The backend API will be available at `http://localhost:8000/api`

## API Endpoints

### Authentication
- `POST /api/users/token/`: Get JWT token
- `POST /api/users/token/refresh/`: Refresh JWT token
- `POST /api/users/register/`: Register a new user
- `POST /api/users/register/doctor/`: Register a new doctor

### User Management
- `GET /api/users/me/`: Get current user details
- `PUT /api/users/me/update/`: Update user profile
- `PUT /api/users/me/change-password/`: Change password
- `GET /api/users/doctors/`: List all doctors

### Predictions
- `POST /api/prediction/`: Submit a new prediction
- `GET /api/prediction/`: Get all predictions for current user
- `GET /api/prediction/{id}/`: Get a specific prediction
- `GET /api/prediction/doctor_predictions/`: Get predictions for doctor review
- `PATCH /api/prediction/{id}/`: Update prediction status and notes

## Technologies Used

### Frontend
- React
- Vite
- React Router
- Axios
- Bootstrap
- Context API for state management

### Backend
- Django
- Django REST Framework
- Simple JWT for authentication
- SQLite (development) / PostgreSQL (production)
- Scikit-learn for machine learning model

## Project Structure

### Frontend Structure
```
src/
├── components/       # Reusable UI components
│   ├── common/       # Shared components (Sidebar, StatsCard, etc.)
│   └── ...           # Other components
├── pages/            # Page components
├── context/          # Context providers for state management
├── services/         # API services
└── assets/           # Static assets
```

### Backend Structure
```
backend/
├── heart_disease_api/    # Django project settings
├── prediction/           # Prediction app
│   ├── models.py         # Data models
│   ├── serializers.py    # API serializers
│   ├── views.py          # API views
│   └── urls.py           # API endpoints
├── users/                # User management app
│   ├── models.py         # User models
│   ├── serializers.py    # User serializers
│   ├── views.py          # User views
│   └── urls.py           # User endpoints
└── manage.py             # Django management script
```
