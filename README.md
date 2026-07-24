# NITH Connect 🌲🎒
> **A Premium Campus Companion Web Application for NIT Hamirpur Students**

NITH Connect is a responsive, feature-rich web application designed to simplify campus life at the **National Institute of Technology Hamirpur (NITH)**. It integrates core student services—such as weekly mess menus, campus announcements, live chatrooms, and a lost-and-found bulletin—into a single glassmorphic dashboard connected to a serverless backend.

---



## 🛠️ Tech Stack & Architecture

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Frontend** | React 19, Next.js 15 (App Router) | Server-side rendering (SSR), Client components, React hooks, Server Actions. |
| **Styling** | Vanilla CSS (Global variables) | Custom glassmorphism, responsive navigation bars (Desktop Sidebar & Mobile Bottom Nav), Pine Green & Misty Aqua theme. |
| **Icons** | Lucide React | High-resolution SVG icons. |
| **Backend & Auth**| Firebase Authentication | Google Cloud Sign-In and local session state. |
| **Database** | Cloud Firestore | Serverless real-time document database storing users, announcements, mess menus, and lost & found items. |

---

## 🚀 Setup & Local Running

Follow these steps to run the application locally on your machine:

### 1. Prerequisites
Ensure you have **Node.js** (v18.x or higher) and **git** installed.

### 2. Clone the Repository
```bash
git clone https://github.com/3am-harsh/nith-connect.git
cd nith-connect
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Environment Variables
Create a file named `.env.local` in the root folder and add your Firebase configuration credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 5. Run the Local Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the application.

---

## 🔒 Security & Optimization Note
*   **Environmental Exclusions:** Secret credential configurations are isolated in `.env.local` and excluded from git tracking via `.gitignore`.
*   **Database Seeding:** On the first launch, if the Firestore database is empty, the application automatically triggers self-healing seeding methods to populate mess timetables, tech club announcements, and default bulletin cards.
