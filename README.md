# 🔍 Lost & Found Portal

A web-based platform built using **React**, **Firebase**, and **Framer Motion** where students and staff can report and track lost or found items on campus.

---

## 🚀 Features

- 🔐 Google Sign-In Authentication
- 📦 Upload and store item images using Firebase Storage
- 📝 Add Lost or Found items with description
- 📄 Real-time listing from Firestore database
- 🎨 Clean responsive UI with Tailwind CSS and Framer Motion animations

---

## 🧰 Tech Stack

- **Frontend**: React, Tailwind CSS, Framer Motion
- **Backend**: Firebase (Firestore, Storage, Auth)

---

## 🛠 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/lost-found-portal.git
cd lost-found-portal
# LOST_FOUND_PORTAL-

2. Install Dependencies
bash
Copy
Edit
npm install
3. Firebase Configuration
Go to Firebase Console

Create a project

Enable:

🔐 Authentication → Google Sign-In

🗃️ Firestore Database

🖼️ Storage

Copy your Firebase config and replace in App.js:

js
Copy
Edit
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
4. Run the App
bash
Copy
Edit
npm start
Visit http://localhost:3000 in your browser.

📁 Project Structure
pgsql
Copy
Edit
lost-found-portal/
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
🧪 Future Enhancements
🔍 Add search and filter options

📩 Email notification on item match

📱 Mobile-first UI refinement

📤 Deployment
You can deploy this app using:

Firebase Hosting

Vercel

Netlify

👨‍💻 Developed by
Shubham MahadiK
🌐 [LinkedIn](https://www.linkedin.com/in/shubham-mahadik-927770276) | Shubham-mahadik05





