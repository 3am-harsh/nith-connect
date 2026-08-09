# 🗺️ NITH Connect Architecture Map

Welcome to your interactive Obsidian Architecture Vault for **NITH Connect**! This documentation explains the system architecture, file organization, and security model in a simple, connection-driven format.

---

## 🏗️ Core System Layers
Explore the foundational layers of the application:

1. **[[Frontend Layout]]**
   * *What it covers*: Next.js structure, vanilla styling system, Capacitor plugins, mobile back-button handling, keyboard display listeners, and mobile navigation layouts.
2. **[[Backend Actions]]**
   * *What it covers*: Next.js Server Actions execution sequence, JWT session token validation, permission checks, and server code modules for chat, lost & found, and marketplace.
3. **[[Database and Seeding]]**
   * *What it covers*: Google Firestore Collections schema mappings (document tables for profiles, messages, marketplace, Breadit), and details on the automatic `seedFirestore()` logic.

---

## 🛡️ Security, Roles, & Synchronization
Explore user permissions and live features:

* **[[Authentication and Roles]]**
  * *What it covers*: Native Google login integration, role-based access rules (Guest, Student, CR, Developer) implemented on both client and server side, and the user ban/moderation mechanism.
* **[[Real-Time Data Sync]]**
  * *What it covers*: WebSocket-based live database listener operation, hybrid initial-render server-action flow, and details of the local offline cache guard fix.

---

## 🛠️ Feature Directory
NITH Connect packs several campus utilities:
* **Marketplace (Buy & Sell)**: Real-time listings for students to trade gear.
* **Lost & Found**: Visual board for posting and claiming lost items.
* **Breadit**: Student forum supporting threads, comments, and flags.
* **Timetables & Mess Menu**: Live schedule uploads and hostel menu sheets.

---

*💡 Tip: Click on any bracketed note link above to jump directly to its description. Open the **Graph View** (Ctrl+G) in Obsidian to see a visual map of these notes and their relationships!*
