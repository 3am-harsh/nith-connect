# 🗄️ Database and Seeding

NITH Connect stores its data in **Google Firebase Firestore**, a cloud-based NoSQL database. 

---

## 📂 Firestore Database Collections
Data is organized into collections of documents. The main collections are:
1. **`users`**: Contains student profiles (emails, names, hostels, bio).
2. **`lost_found`**: Tracks lost/found items, dates, locations, images, and contact numbers.
3. **`marketplace`**: Tracks buy/sell gear (Hero cycles, study lamps, math books), prices, and listing status.
4. **`chatrooms` & `messages`**: Stores message logs for channels like General Discussion, Placements, and Sports.
5. **`breadit_posts` & `breadit_comments`**: Stores discussion posts, vote/report counts, and comment threads.
6. **`announcements`**: Stores events, locations, and time info published by clubs and hubs.

---

## 🌱 Automatic Database Seeding
To make local development easy, the file [`src/lib/firestore.ts`](file:///c:/Users/harsh/Desktop/NIT%20HAMIRPUR%20APP/src/lib/firestore.ts) has a built-in function called `seedFirestore()`.

When the app launches, if these collections are empty:
1. **Chatrooms**: Seeds general, academics, placement, and casual rooms.
2. **Mess Menus**: Seeds breakfast, lunch, snacks, and dinner lists for hostels (Kailash, Himadri, Shivalik, etc.).
3. **Announcements**: Seeds upcoming event posters (like Digital Wellbeing, ChemEca recruitments).
4. **Lost & Found / Marketplace**: Injects 4 fake items in each category with clean stock photos from Unsplash and mock contact numbers like `XXXX1213489`.

---

## 🔗 Connections
* Back to: **[[App Architecture Index]]**
* Next: Learn how security rules and roles work in **[[Authentication and Roles]]**
