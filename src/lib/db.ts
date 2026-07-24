import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initDb() {
  // Users Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      roll_number TEXT,
      department TEXT,
      hostel TEXT,
      blood_group TEXT,
      profile_picture TEXT,
      role TEXT DEFAULT 'student',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Mess Menus Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS mess_menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hostel_name TEXT NOT NULL,
      day_of_week TEXT NOT NULL,
      breakfast TEXT,
      lunch TEXT,
      snacks TEXT,
      dinner TEXT,
      UNIQUE(hostel_name, day_of_week)
    )
  `).run();

  // Feed Posts Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      category TEXT DEFAULT 'General',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `).run();

  // Comments Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `).run();

  // Likes Table (Many-to-Many for Posts)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS likes (
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      PRIMARY KEY (post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `).run();

  // Marketplace Table (Buy/Sell & Lost/Found combined or distinct)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS marketplace (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL, -- 'buy_sell' or 'lost_found'
      subtype TEXT NOT NULL, -- 'buy', 'sell', 'lost', 'found'
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL, -- NULL for lost/found
      location TEXT, -- relevant for lost/found
      image_url TEXT,
      contact TEXT NOT NULL,
      status TEXT DEFAULT 'active', -- 'active', 'sold', 'resolved'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `).run();

  // Blogs Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS blogs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      content TEXT NOT NULL,
      image_url TEXT,
      read_time INTEGER DEFAULT 3,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `).run();

  // Blog Comments Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS blog_comments (
      id TEXT PRIMARY KEY,
      blog_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `).run();

  // Chatrooms Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS chatrooms (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      category TEXT NOT NULL
    )
  `).run();

  // Chat Messages Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      chatroom_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chatroom_id) REFERENCES chatrooms(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `).run();

  // Seed default data if database is empty
  seedData();
}

function seedData() {
  // 1. Seed Chatrooms
  const chatroomCount = db.prepare('SELECT COUNT(*) as count FROM chatrooms').get() as { count: number };
  if (chatroomCount.count === 0) {
    const insertChatroom = db.prepare('INSERT INTO chatrooms (id, name, description, category) VALUES (?, ?, ?, ?)');
    insertChatroom.run('chat-gen', 'General Discussion', 'Talk about anything related to NITH campus life', 'General');
    insertChatroom.run('chat-acad', 'Academics & Tech', 'Discuss courses, exams, coding, projects and study material', 'Academics');
    insertChatroom.run('chat-place', 'Placements & Internships', 'Preparation strategies, interview questions, and placement news', 'Placements');
    insertChatroom.run('chat-hostel', 'Hostel Life', 'Discuss mess complaints, hostel events, and facilities', 'Hostels');
    insertChatroom.run('chat-sports', 'Sports & Cultural', 'Hill\'ffair, Nimbus, sports events, and club activities', 'Clubs');
  }

  // 2. Seed Mess Menus for some Hostels
  const menuCount = db.prepare('SELECT COUNT(*) as count FROM mess_menus').get() as { count: number };
  if (menuCount.count === 0) {
    const insertMenu = db.prepare(`
      INSERT OR IGNORE INTO mess_menus (hostel_name, day_of_week, breakfast, lunch, snacks, dinner)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const hostels = ['Kailash Hostel', 'Himadri Hostel', 'Shivalik Hostel', 'Dhauladhar Hostel', 'Mani Mahesh Hostel'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const sampleMeals: Record<string, { breakfast: string, lunch: string, snacks: string, dinner: string }> = {
      'Monday': {
        breakfast: 'Aloo Paratha, Curd, Butter, Tea, Coffee',
        lunch: 'Dal Makhani, Mix Veg, Roti, Rice, Salad, Boondi Raita',
        snacks: 'Samosa, Mint Chutney, Tea',
        dinner: 'Paneer Butter Masala, Jeera Rice, Tandoori Roti, Gulab Jamun'
      },
      'Tuesday': {
        breakfast: 'Idli Sambar, Coconut Chutney, Banana, Tea, Coffee',
        lunch: 'Rajma Masala, Aloo Gobi, Roti, Rice, Curd, Green Salad',
        snacks: 'Veg Cutlet, Tomato Ketchup, Tea',
        dinner: 'Chicken Curry / Kadai Paneer, Butter Roti, Peas Pulao, Ice Cream'
      },
      'Wednesday': {
        breakfast: 'Bread Toast, Jam, Omelette / Sprouts, Milk, Tea',
        lunch: 'Kadhi Pakoda, Aloo Jeera, Roti, Rice, Papad, Pickle',
        snacks: 'Kachori, Sweet Chutney, Tea',
        dinner: 'Matar Paneer, Plain Rice, Roti, Dal Fry, Kheer'
      },
      'Thursday': {
        breakfast: 'Poha, Sev, Jalebi, Milk, Tea, Coffee',
        lunch: 'Chana Masala, Veg Pulao, Bhatura, Roti, Salad, Raita',
        snacks: 'Bread Pakoda, Tea',
        dinner: 'Egg Curry / Dum Aloo, Jeera Rice, Roti, Custard'
      },
      'Friday': {
        breakfast: 'Puri Sabji, Halwa, Tea, Coffee',
        lunch: 'Moong Dal, Bhindi Bhurji, Roti, Rice, Curd, Salad',
        snacks: 'Aloo Tikki, Tea',
        dinner: 'Mushroom Do Pyaza / Shahi Paneer, Garlic Naan, Pulao, Rasgulla'
      },
      'Saturday': {
        breakfast: 'Uttapam, Tomato Chutney, Banana, Tea',
        lunch: 'Veg Biryani, Salan, Roti, Raita, Salad',
        snacks: 'Chowmein, Tea',
        dinner: 'Kashmiri Dum Aloo, Dal Tadka, Rice, Roti, Sewaiyan'
      },
      'Sunday': {
        breakfast: 'Chole Bhature, Pickle, Lassi / Tea',
        lunch: 'Yellow Dal, Aloo Shimla Mirch, Roti, Rice, Papad',
        snacks: 'Mathri, Tea',
        dinner: 'Special Paneer, Veg Korma, Butter Naan, Rice, Special Sweet'
      }
    };

    for (const hostel of hostels) {
      for (const day of days) {
        insertMenu.run(
          hostel,
          day,
          sampleMeals[day].breakfast,
          sampleMeals[day].lunch,
          sampleMeals[day].snacks,
          sampleMeals[day].dinner
        );
      }
    }
  }
}

// Helper methods to interact with DB
export const query = (sql: string, params: unknown[] = []) => {
  return db.prepare(sql).all(params);
};

export const get = (sql: string, params: unknown[] = []) => {
  return db.prepare(sql).get(params);
};

export const run = (sql: string, params: unknown[] = []) => {
  return db.prepare(sql).run(params);
};

// Initialize on load
initDb();

export default db;
