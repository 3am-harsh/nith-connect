# 🔒 Authentication and Roles

NITH Connect secures student data using Google Sign-In and controls feature access using a role-based permission system.

---

## 🔑 Login Methods
1. **Google Login**: Students sign in using their official college email (`@nith.ac.in`). On mobile, it uses the `@capacitor-firebase/authentication` plugin to trigger native Google Sign-in dialogs.
2. **Guest Login**: Anyone can access the app without signing in to read announcements, calculate CGPA, or check hostel mess menus.

---

## 🎖️ User Roles & Permissions
Every signed-in user is assigned a role. Here is what they can do:

| Role | Access | Permissions |
| :--- | :--- | :--- |
| **Guest** | Restricted | Read-only. Cannot chat, buy/sell, or report items. |
| **Student** | Standard | Can participate in chatrooms, post on Breadit, list marketplace items, and report lost items. |
| **CR** (Class Rep) | Moderator | Student permissions + can delete community posts and comments. |
| **Developer** | Admin | Full control. Can approve timetables, edit announcements, delete any post/message, and ban/unban users. |

---

## 🛡️ Session Verification
To verify who you are, the server actions read a secure Cookie/JWT token. This makes sure that even if someone modifies the client code, they cannot write to the database without proper authorization.

---

## 🔗 Connections
* Back to: **[[App Architecture Index]]**
* Next: Learn how real-time sync works in **[[Real-Time Data Sync]]**
