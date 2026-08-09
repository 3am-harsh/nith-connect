# 🎨 Frontend Layout

The frontend is the visual interface that users see. It's designed to feel fast, modern, and work on both computers and mobile screens.

---

## 📱 Mobile App vs Web
NITH Connect is built using **Next.js** (React) and styled using custom **Vanilla CSS**.
* **For Web**: It runs directly in any browser (Google Chrome, Safari, etc.) at `http://localhost:3000`.
* **For Mobile**: It uses a tool called **Capacitor**. Capacitor wraps the web application in a "native container" (a webview) and allows it to run as a native Android app (producing an `.apk` file) or iOS app.

---

## 🗂️ Single-Page Dashboard Structure
Almost the entire application interface is powered by a single large component: [`dashboard-client.tsx`](file:///c:/Users/harsh/Desktop/NIT%20HAMIRPUR%20APP/src/app/dashboard-client.tsx).

It keeps track of the active view using a React state variable called `activeTab`. Depending on the tab, it renders different layouts:
1. **Home**: Dashboard showing quick stats, achievements, and announcements.
2. **Mess**: Hostel weekly meals menus.
3. **Timetable**: Uploaded and approved class schedules.
4. **Chat**: Community chatrooms and the **[[Real-Time Data Sync|Breadit Forum]]**.
5. **Marketplace**: Campus buy-and-sell listings.
6. **Lost & Found**: Lost/found items with search and image preview.

---

## 🔗 Connections
* Back to: **[[App Architecture Index]]**
* Next: Learn about the backend operations in **[[Backend Actions]]**
