# 🔒 Authentication and Roles

NITH Connect secures data access using institutional logins and restricts features on both the frontend and backend using Role-Based Access Control (RBAC).

---

## 🔑 Login Methods & Mobile Sync
1. **Google Auth for NITH**: Next.js auth utilizes Firebase Auth. Users must sign in with a verified `@nith.ac.in` domain.
2. **Capacitor Mobile Native Bridging**:
   - Web browsers run Firebase client SDK authentication.
   - Android mobile devices run native authentication via the `@capacitor-firebase/authentication` plugin.
   - When Google login succeeds on native mobile, the plugin obtains an ID Token, which is exchanged with Firebase Auth via `signInWithCredential` to synchronize the client-side session inside the webview.
3. **Session Cookies**:
   - When logged in, a secure, HTTP-only cookie `nith_connect_session` containing a JWT is set.
   - This cookie is parsed on the server to authenticate Next.js Server Actions.

---

## 🛡️ Role-Based Access Control (RBAC)
User permissions are locked down on two levels:

### 1. Backend Security Guards (Server Actions)
Every administrative action (like deleting a post, approving a timetable, or banning a user) verifies roles on the server before database execution.
*Example code guard:*
```typescript
const session = await getSession();
if (!session || (session.role !== 'developer' && session.role !== 'cr')) {
  throw new Error('Unauthorized action attempt');
}
```

### 2. Frontend Interface Restrictions
The UI hides or disables options depending on your role:
* **Guest Limitations**:
  - Guest users are restricted from entering the chat, marketplace, or lostfound tabs:
    `const isRestricted = user.role === 'guest' && ['chat', 'marketplace', 'lostfound'].includes(item.id);`
  - Submitting buttons (like "Report Item" or "Create Post") are completely hidden for guests.
* **Developer Controls**:
  - The "Dev Tools" tab in the sidebar is only visible if `user.role === 'developer'`.
  - Delete icons (trash cans) are rendered on chat messages and Breadit comments only for `cr` and `developer` users.

---

## 🚫 User Bans & Moderation
The Developer Console allows banning users who violate campus guidelines:
* **Database fields**: Adds `banned_until` (ISO timestamp) and `ban_reason` (string) to the user's `users` document.
* **Frontend Guard**: On app initialization, if `user.banned_until` is in the future, the app renders a lock screen displaying the ban reason and the date when access will be restored, preventing them from accessing the dashboard.

---

## 🔗 Connections
* Back to: **[[App Architecture Index]]**
* Next: Learn how real-time sync works in **[[Real-Time Data Sync]]**
