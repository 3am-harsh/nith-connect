# NITH Connect 🌲🎒
> **A Premium Campus Companion Application for NIT Hamirpur Students**

## 📱 Download the Android App (APK)

Try NITH Connect directly on your Android device:
*   🚀 **[Download Release APK (Recommended)](https://github.com/3am-harsh/nith-connect/raw/main/NITH_Connect_Release.apk)** — *Optimized, clean production build.*
*   🛠️ **[Download Debug APK](https://github.com/3am-harsh/nith-connect/raw/main/NITH_Connect_Debug.apk)** — *Debug build with developer logs enabled.*

---

NITH Connect is a responsive, feature-rich web application designed to simplify campus life at the **National Institute of Technology Hamirpur (NITH)**. It integrates core student services—such as weekly mess menus, campus announcements, live chatrooms, and a lost-and-found bulletin—into a single glassmorphic dashboard connected to a serverless backend.

Yes this app is Built using AI but not even a single penny is spent on any AI tool. Building it isn't going too smooth. Coming across lots of problems especially database related.

I built this app solo not actually solo My AI agents helped me.

But i think this app might be pretty useful to me and to other students.

But is have lot of bugs if you find one please report me.

You can reach me personally through djfgh7033@gmail.com

That's it 


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

## 🔒 Security & Optimization Note
*   **Environmental Exclusions:** Secret credential configurations are isolated in `.env.local` and excluded from git tracking via `.gitignore`.
*   **Database Seeding:** On the first launch, if the Firestore database is empty, the application automatically triggers self-healing seeding methods to populate mess timetables, tech club announcements, and default bulletin cards.
