# ⚙️ Backend Actions

The backend represents the logic and operations of the app that run on the server. NITH Connect uses Next.js **Server Actions** to process requests.

---

## 🛡️ What are Server Actions?
Server Actions are Javascript functions marked with `'use server'` at the top of the file. 

Instead of building a traditional API (like GET/POST endpoints), the client can call these server-side functions directly from React components. They are secure because:
1. **Hidden Logic**: The database keys and backend logic are hidden from the user's browser.
2. **Session Verification**: They verify who the user is before performing tasks.
3. **Privileged Access**: They read and write to Firestore directly from the server.

---

## 📂 Server Action Files
You can find all backend logic in the [`src/app/actions`](file:///c:/Users/harsh/Desktop/NIT%20HAMIRPUR%20APP/src/app/actions) folder:
* **[`lostfound.ts`](file:///c:/Users/harsh/Desktop/NIT%20HAMIRPUR%20APP/src/app/actions/lostfound.ts)**: Handles database records for lost & found items.
* **[`marketplace.ts`](file:///c:/Users/harsh/Desktop/NIT%20HAMIRPUR%20APP/src/app/actions/marketplace.ts)**: Adds listings, manages item prices, and marks items as sold.
* **[`breadit.ts`](file:///c:/Users/harsh/Desktop/NIT%20HAMIRPUR%20APP/src/app/actions/breadit.ts)**: Creates posts and comments in the student forum.
* **[`chat.ts`](file:///c:/Users/harsh/Desktop/NIT%20HAMIRPUR%20APP/src/app/actions/chat.ts)**: Stores chatroom messages and manages word blocklists.
* **[`timetable.ts`](file:///c:/Users/harsh/Desktop/NIT%20HAMIRPUR%20APP/src/app/actions/timetable.ts)**: Allows CRs to upload schedules and developers to approve them.
* **[`mess.ts`](file:///c:/Users/harsh/Desktop/NIT%20HAMIRPUR%20APP/src/app/actions/mess.ts)**: Fetches food menus for hostels.

---

## 🔗 Connections
* Back to: **[[App Architecture Index]]**
* Next: Learn how data is stored in **[[Database and Seeding]]**
