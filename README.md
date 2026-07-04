#  Fixit – Smart Hostel Complaint Management System

A production-ready **Full-Stack Complaint Management Platform** built using the **MERN Stack** to streamline hostel complaint resolution through secure authentication,
role-based access control, image-supported complaints, and a transparent verification workflow.
Designed to eliminate communication gaps between students and hostel administration while ensuring accountability throughout the complaint lifecycle.

---

## ✨ Features

### 👨‍🎓 Student Portal

- 🔐 Secure Registration & Login with JWT Authentication
- 📧 Email OTP Verification using Nodemailer
- 📝 Create complaints with title, description and image attachment
- 🖼 Upload complaint images securely using Multer (Cloudinary supported)
- 🌍 Submit Public or 🔒 Private complaints
-  👍 **Community Complaint Voting** — Upvote important public complaints to highlight high-priority issues and help administrators prioritize resolutions.
- 📊 Track complaint status in real time
- ✏ Edit/Delete complaints before resolution
- 👤 Manage personal profile
- 📈 Personal dashboard with complaint statistics

---

### 👨‍💼 Admin Portal

- Secure Admin Authentication
- View all complaints from a centralized dashboard
- Advanced filtering by
  - Status
  - Complaint Type
  - Priority
- Update complaint status
  - Pending
  - In Progress
  - Resolved
- Student verification after resolution
- Dashboard analytics
- Complete complaint management system

---

## 🔐 Security

- JWT Authentication
- Role-Based Access Control (RBAC)
- Password Hashing using bcrypt
- Protected REST APIs
- Environment Variable based configuration
- Secure MongoDB Atlas Connection
- OTP-based Email Verification
- Server-side Validation
- CORS Protection

---

## ⚙ Tech Stack

### Frontend

- React.js
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- Responsive UI

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- Multer
- Nodemailer
- bcrypt
- REST API

### Deployment

- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas

---

# 📂 Project Structure

```
Fixit
│
├── client
│   ├── src
│   ├── public
│   └── package.json
│
├── server
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── config
│   ├── utils
│   └── package.json
│
└── README.md
```

---

## 📌 Important Note

> **Production Configuration**
>
> This project includes a **production-ready institutional email validation** system that restricts student registration to **IIIT Allahabad** email addresses (`@iiita.ac.in`).
>
> For demonstration and testing purposes, this validation is **temporarily disabled (commented out)**, allowing any valid email address to register and explore the application without requiring a college email.
>
> To switch to **production mode**, simply uncomment the email validation logic in the following files:
>
> **`server/models/User.js`**
> ```javascript
> // match: [
> //   /^[a-zA-Z0-9._%+-]+@iiita\.ac\.in$/,
> //   'Please use a valid IIIT Allahabad email address',
> // ],
> ```
>
> **`server/controllers/authControllers.js`**
> ```javascript
> // if (!email.endsWith('@iiita.ac.in')) {
> //   return res.status(400).json({
> //     message: 'Only @iiita.ac.in emails are allowed'
> //   });
> // }
> ```
>
> This approach allows the application to be seamlessly deployed in **Production Mode** (college-only access) or **Demo Mode** (open registration) by simply enabling or disabling the above validation logic, without modifying the overall authentication workflow.

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/ravindraChoudhary056/Fixit.git

cd Fixit
```
## Backend Setup

```bash
cd server

npm install

npm run dev

```
## Frontend Setup

```bash
cd client

npm install

npm run dev
```
# 🔑 Environment Variables

Create a `.env` file inside the **server** folder.

```env
# Server
PORT=5000

# MongoDB
MONGO_URI=your_mongodb_atlas_connection_string

# JWT
JWT_SECRET=your_super_secret_key

# Admin Email
ADMIN_EMAIL=admin@example.com

# Email Configuration (Nodemailer)

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_digit_google_app_password

# Cloudinary (Optional)

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=
```

---


---

# 📈 Future Improvements

- Real-time Notifications (Socket.IO)
- AI-based Complaint Categorization
- Email Notifications
- Push Notifications
- Complaint Analytics Dashboard

---

# 👨‍💻 Author

## Ravindra Choudhary

Full Stack Developer

GitHub

https://github.com/ravindraChoudhary056

LinkedIn

(https://www.linkedin.com/in/ravindra-choudhary-250597326/)


# ⭐ Support

If you found this project useful,

⭐ Star this repository.
