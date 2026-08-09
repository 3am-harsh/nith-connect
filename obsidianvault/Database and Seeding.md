# 🗄️ Database and Seeding

NITH Connect stores all persistent data inside **Google Firebase Firestore**. This note defines the exact database schemas and the automated seeding process.

---

## 📋 Collection Schemas

### 1. `users` (Student Profile Documents)
*Matches interface `FirestoreUser`*
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | The Firebase Auth UID. |
| `email` | `string` | Student institutional email (`@nith.ac.in`). |
| `name` | `string` | Full name of the student. |
| `role` | `string` | Access level: `'student' \| 'cr' \| 'developer' \| 'guest'`. |
| `roll_number` | `string` (opt) | College Roll Number. |
| `department`| `string` (opt) | Branch/Department of engineering. |
| `hostel` | `string` (opt) | Hostel allotment (e.g., Kailash, Himadri). |
| `blood_group`| `string` (opt) | Student blood group. |
| `bio` | `string` (opt) | Short self-description. |

### 2. `lost_found` (Lost & Found Item Logs)
*Matches interface `FirestoreLostFoundItem`*
| Field | Type | Description |
| :--- | :--- | :--- |
| `title` | `string` | Title of the lost or found item. |
| `description`| `string` | Detailed description of the item. |
| `type` | `'lost' \| 'found'`| Category of the report. |
| `location` | `string` | Campus location where lost/found (e.g., Library). |
| `date` | `string` | Date description (e.g., "Yesterday"). |
| `contact` | `string` | Reporter phone number (supports `XXXX1213489`). |
| `image` | `string` (opt) | Main image URL or base64 data. |
| `images` | `string[]` (opt) | List of additional images for carousel lightbox. |
| `user_id` | `string` | UID of the reporter. |
| `user_name` | `string` | Name of the reporter. |
| `created_at` | `serverTimestamp` | Database timestamp for sorting. |

### 3. `marketplace` (Campus Buy & Sell Items)
*Matches interface `FirestoreMarketplaceItem`*
| Field | Type | Description |
| :--- | :--- | :--- |
| `title` | `string` | Product name. |
| `description`| `string` | Condition of the item, duration used. |
| `original_price`| `number` | Original purchase price (for discount display). |
| `selling_price`| `number` | Selling price. |
| `contact_number`| `string` | WhatsApp number for direct messaging. |
| `category` | `string` | `'Cycle' \| 'Books' \| 'Electronics' \| 'Hostel Gear' \| 'Others'`. |
| `status` | `'active' \| 'sold'`| Listing status. |
| `image` | `string` | Product image URL or base64 string. |
| `user_id` | `string` | Seller's UID. |
| `user_name` | `string` | Seller's Name. |
| `created_at` | `serverTimestamp` | Creation timestamp. |

### 4. `breadit_posts` (Community Forum Threads)
*Matches interface `FirestoreBreaditPost`*
| Field | Type | Description |
| :--- | :--- | :--- |
| `title` | `string` | Discussion header. |
| `content` | `string` | Main post text. |
| `user_id` | `string` | Author's UID. |
| `user_name` | `string` | Author's name. |
| `comments_count`| `number` | Total comments attached (updated atomically). |
| `reports_count` | `number` | Flag counts. |
| `reported_by` | `string[]` | UIDs of users who reported this post. |
| `created_at` | `string` | ISO string format. |

---

## 🌱 Automated Database Seeding Logic
Seeding is executed on mount in the main dashboard using `seedFirestore()` in `src/lib/firestore.ts`.

It runs checks before writing to prevent duplicate documents:
1. **Chatrooms**: Always merged using `setDoc` with static IDs (e.g., `chat-gen`, `chat-acad`).
2. **Mess Menus**: Iterates through 5 hostels for all 7 days of the week, generating menu items (breakfast, lunch, tea, dinner) and saves them with doc ID format `${hostel_name}-${day}`.
3. **Announcements**: If collection is empty, adds 3 initial events with gradient themes.
4. **Marketplace & Lost Found**: Wipes out old text-only default items (with contacts like `98822-12345`) and uses `setDoc` to insert 4 clean items in each category with Unsplash pictures and the contact `XXXX1213489`.

---

## 🔗 Connections
* Back to: **[[App Architecture Index]]**
* Next: Learn how authentication and access levels are enforced in **[[Authentication and Roles]]**
