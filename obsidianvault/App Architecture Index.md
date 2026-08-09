# 🗺️ NITH Connect Architecture Map

Welcome to your Obsidian Architecture Vault for **NITH Connect**! This vault explains how the app works in simple terms using linked notes. Click on any of the double-bracketed links (e.g., `[[Link]]`) to jump directly to that topic.

---

## 🏗️ Core Architecture Overview

NITH Connect is a hybrid mobile app built for NIT Hamirpur. It is structured into three main layers:

1. **[[Frontend Layout]]**: The visual part of the app that you see and interact with. It runs in Next.js and is packaged for mobile devices using Capacitor.
2. **[[Backend Actions]]**: The brain of the app that runs on the server. It handles logic, checks permissions, and performs operations.
3. **[[Database and Seeding]]**: The memory of the app. It stores data using Google Firebase Firestore and initializes sample data automatically.

---

## 🔒 Security & Live Sync

- **[[Authentication and Roles]]**: How users log in (via Google or guest) and how the app controls access for different roles like `student`, `cr` (Class Representative), and `developer`.
- **[[Real-Time Data Sync]]**: How the app keeps things like chats and lost & found lists up-to-date instantly without reloading the page.

---

## 🛠️ Main Features Map
- **Marketplace (Buy & Sell)**: Sell or purchase hostel gear, books, and cycles.
- **Lost & Found**: Post lost belongings and contact reporters via WhatsApp/Call.
- **Breadit (Reddit Clone)**: Share campus problems, updates, and chat in threads.
- **Timetable & Mess Menu**: Keep track of daily schedules and food menus.
