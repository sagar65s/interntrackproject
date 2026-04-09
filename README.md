# 🎓 InternTrack – Internship Management System

A production-ready full-stack web application for managing internship students with role-based access control.

---

## 📋 Tech Stack

| Layer      | Technology                     |
|------------|-------------------------------|
| Frontend   | React 18, React Router v6, CSS |
| Backend    | Node.js, Express.js            |
| Database   | MongoDB (Mongoose ODM)         |
| Auth       | JWT + bcryptjs                 |
| File Upload| Multer (local storage)         |

---

## 🏗️ Project Structure

```
interntrack/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js         # JWT protect + authorize
│   │   └── upload.js       # Multer resume upload
│   ├── models/
│   │   ├── User.js
│   │   ├── Student.js
│   │   └── Project.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── students.js
│   │   ├── projects.js
│   │   └── admin.js
│   ├── uploads/resumes/    # Resume files stored here
│   ├── server.js
│   ├── seed.js             # Creates initial super admin
│   └── .env.example
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── context/
        │   └── AuthContext.js
        ├── components/
        │   ├── Layout.js
        │   └── Sidebar.js
        ├── pages/
        │   ├── Login.js
        │   ├── Register.js
        │   ├── student/
        │   │   ├── Dashboard.js
        │   │   ├── Profile.js
        │   │   └── Projects.js
        │   ├── admin/
        │   │   ├── Dashboard.js
        │   │   ├── Students.js
        │   │   └── StudentDetail.js
        │   └── superadmin/
        │       ├── Dashboard.js
        │       ├── Students.js
        │       └── Admins.js
        ├── styles/
        │   └── global.css
        ├── App.js
        └── index.js
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js >= 18
- MongoDB running locally OR MongoDB Atlas URI
- npm or yarn

---

### 1️⃣ Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy env file
cp .env.example .env

# Edit .env — set your MongoDB URI and JWT secret
nano .env
```

**`.env` file:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/interntrack
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

```bash
# Create the initial Super Admin account
node seed.js

# Start backend (development with auto-reload)
npm run dev

# OR for production
npm start
```

Backend runs at: `http://localhost:5000`

---

### 2️⃣ Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🔐 Default Credentials

After running `node seed.js`:

| Role        | Email                          | Password        |
|-------------|--------------------------------|-----------------|
| Sagar       |    sagar12345@gmail.com        | Sagarmail@123  |

> ⚠️ **Change the super admin password after first login!**

---

## 👥 Role Permissions

| Feature                     | Student | Admin | Super Admin |
|-----------------------------|---------|-------|-------------|
| Register / Login            | ✅      | ✅    | ✅          |
| Complete Profile            | ✅      | —     | —           |
| Upload Resume               | ✅      | —     | —           |
| Submit Projects             | ✅      | —     | —           |
| View Own Projects           | ✅      | —     | —           |
| View All Students           | ❌      | ✅    | ✅          |
| View / Download Resumes     | ❌      | ✅    | ✅          |
| Edit Project Status         | ❌      | ✅    | ✅          |
| Edit Student Profiles       | ❌      | ❌    | ✅          |
| Delete Students             | ❌      | ❌    | ✅          |
| Create Admin Accounts       | ❌      | ❌    | ✅          |
| Delete Admin Accounts       | ❌      | ❌    | ✅          |
| View Analytics              | ❌      | ✅    | ✅          |

---

## 🌐 Ubuntu Server Deployment

### Install Prerequisites
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### Deploy Backend
```bash
cd /var/www/interntrack/backend
npm install --production

# Set production env
cp .env.example .env
nano .env  # fill in production values

# Run seed if first deploy
node seed.js

# Start with PM2
pm2 start server.js --name interntrack-api
pm2 save
pm2 startup
```

### Build & Deploy Frontend
```bash
cd /var/www/interntrack/frontend
npm install

# Set the API URL for production
echo "REACT_APP_API_URL=https://yourdomain.com" > .env.production

npm run build
# Build output is in ./build/
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/interntrack
server {
    listen 80;
    server_name yourdomain.com;

    # Serve React frontend
    location / {
        root /var/www/interntrack/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Express
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Serve uploaded files
    location /uploads {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
    }

    # File upload size limit
    client_max_body_size 10M;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/interntrack /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 Security Notes

- All passwords hashed with bcrypt (salt rounds: 12)
- JWT tokens expire in 7 days (configurable)
- File uploads restricted to PDF/DOC/DOCX, max 5MB
- CORS configured for specific frontend origin
- Role-based middleware on every protected route
- Input validation on all API endpoints

---

## 📡 API Endpoints

### Auth
```
POST   /api/auth/register          # Register student
POST   /api/auth/login             # Login
GET    /api/auth/me                # Get current user
POST   /api/auth/create-admin      # Create admin (superadmin only)
```

### Student (requires student JWT)
```
GET    /api/students/profile       # Get own profile
PUT    /api/students/profile       # Update profile
POST   /api/students/upload-resume # Upload resume
GET    /api/students/projects      # Get own projects
POST   /api/students/projects      # Submit project
PUT    /api/students/projects/:id  # Update own project
```

### Admin (requires admin/superadmin JWT)
```
GET    /api/admin/students         # List all students (search/filter)
GET    /api/admin/students/:id     # Get student detail
PUT    /api/admin/projects/:id     # Update project
GET    /api/admin/analytics        # Get analytics
```

### Super Admin only
```
PUT    /api/admin/students/:id     # Edit student profile
DELETE /api/admin/students/:id     # Delete student
GET    /api/admin/admins           # List admins
DELETE /api/admin/admins/:id       # Delete admin
```
