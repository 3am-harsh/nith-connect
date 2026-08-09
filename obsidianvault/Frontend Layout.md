# 🎨 Frontend Layout

The frontend is the visual and user-interactive layer of NITH Connect. It is designed as a hybrid application that bridges modern web technologies with native mobile functionality.

---

## 🛠️ Technology Stack
* **Framework**: **Next.js 15.5** (React 19) for routing, server actions, and layout rendering.
* **Language**: **TypeScript 5** ensuring strict compile-time types for components and database objects.
* **Styling**: **Vanilla CSS** + custom global variables defined in `src/app/globals.css`, integrated with Tailwind CSS 4 & PostCSS for styling compilation.
* **Native wrapper**: **Capacitor 8.4** wrapping the Next.js static output into a native webview container for Android and iOS.

---

## 📲 Capacitor Mobile Integration
Capacitor links the webview with native mobile devices using plugins:
1. **`@capacitor/keyboard`**: Listens to keyboard open/close events (`setIsKeyboardOpen(true/false)`) to adjust UI layout dynamically so input fields are not hidden behind the mobile keyboard.
2. **`@capacitor/app`**: Manages native hardware events (like Android physical back-button navigation).
3. **`@capacitor-firebase/authentication`**: Calls native Google sign-in dialogs instead of web redirects, creating a smoother user experience.

---

## 🗂️ The Dashboard Architecture (`dashboard-client.tsx`)
Almost the entire user interface of the app resides in a single, comprehensive React component: [`dashboard-client.tsx`](file:///c:/Users/harsh/Desktop/NIT%20HAMIRPUR%20APP/src/app/dashboard-client.tsx). It controls the user flow via state hooks:

### 1. View Controllers (Active Tabs)
The interface switches pages using the `activeTab` state:
- `'home'`: General dashboard cards, quick links, daily achievements, and campus announcement sliders.
- `'chat'`: Renders the community directory and handles navigation between chatrooms or the Breadit forum.
- `'marketplace'`: Displays categorized active listings (Bicycles, Books, Hostel Gear, Electronics).
- `'lostfound'`: Shows lost and found item grids, categories, search, and a photo zoom lightbox.
- `'calculator'`: A built-in GPA/CGPA calculator for NIT Hamirpur students.

### 2. Modals and Drawers
Interactive popups are controlled by independent boolean states:
- `isProfileOpen`: Controls the sliding profile drawer.
- `isAddListingOpen`: The form modal for listing items on the marketplace.
- `isReportLostFoundOpen`: The form modal for reporting lost or found items.
- `isCreatePostOpen`: The editor window for posting on the Breadit forum.

### 3. Touch Swipes & Navigation Fixes
- **Gesture Listeners**: Tracks `onTouchStart` and `onTouchEnd` on mobile to let users swipe open the side drawer menu.
- **Optimistic Rendering**: When a user sends a chat message, it is immediately pushed to the client state (`setChatMessages`) with a temporary ID so it renders instantly, before the server finishes saving it.

---

## 🔗 Connections
* Back to: **[[App Architecture Index]]**
* Next: Learn about Server Actions in **[[Backend Actions]]**
