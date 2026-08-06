import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  limit,
  serverTimestamp,
  addDoc,
  orderBy,
  updateDoc,
  deleteDoc,
  increment,
  arrayUnion
} from 'firebase/firestore';

export interface FirestoreUser {
  id: string;
  email: string;
  name: string;
  roll_number?: string;
  department?: string;
  hostel?: string;
  blood_group?: string;
  role: string;
  created_at?: unknown;
  banned_until?: string | null;
  ban_reason?: string | null;
  phone_number?: string;
  whatsapp_link?: string;
  instagram_link?: string;
  bio?: string;
}

export interface FirestoreMessMenu {
  hostel_name: string;
  day_of_week: string;
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
}

// User Queries
export async function getFirestoreUser(userId: string): Promise<FirestoreUser | null> {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      let serializableCreatedAt = null;
      if (data.created_at) {
        const ts = data.created_at as { toDate?: () => { toISOString: () => string }; seconds?: number };
        if (ts.toDate) {
          serializableCreatedAt = ts.toDate().toISOString();
        } else if (ts.seconds) {
          serializableCreatedAt = new Date(ts.seconds * 1000).toISOString();
        }
      }
      return {
        ...data,
        created_at: serializableCreatedAt
      } as FirestoreUser;
    }
  } catch (error) {
    console.error('Error fetching user from Firestore:', error);
  }
  return null;
}

export async function createFirestoreUser(user: FirestoreUser): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', user.id);
    await setDoc(docRef, {
      ...user,
      created_at: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error creating user in Firestore:', error);
    return false;
  }
}

// Mess Menu Queries
export async function getFirestoreMessMenu(hostelName: string, dayOfWeek: string): Promise<FirestoreMessMenu | null> {
  try {
    const q = query(
      collection(db, 'mess_menus'), 
      where('hostel_name', '==', hostelName),
      where('day_of_week', '==', dayOfWeek)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as FirestoreMessMenu;
    }
  } catch (error) {
    console.error('Error fetching mess menu from Firestore:', error);
  }
  return null;
}

// Seeding function to populate Firestore if empty
export async function seedFirestore() {
  try {
    // 1. Ensure chatrooms are populated
    const chatrooms = [
      { id: 'chat-gen', name: 'General Discussion', description: 'Talk about anything NITH campus life', category: 'General' },
      { id: 'chat-acad', name: 'Academics & Tech', description: 'Discuss courses, coding and projects', category: 'Academics' },
      { id: 'chat-place', name: 'Placements & Internships', description: 'Preparation strategies and interview updates', category: 'Placements' },
      { id: 'chat-hostel', name: 'Hostel Life', description: 'Discuss mess food and hostel updates', category: 'Hostels' },
      { id: 'chat-sports', name: 'Sports & Cultural', description: 'Festivals, sports events, and clubs', category: 'Clubs' },
      { id: 'chat-buysell', name: 'Buy & Sell Exchange', description: 'Buy/sell used items and cycles or ask queries', category: 'Services' },
      { id: 'chat-freshers', name: 'Freshers Welcome', description: 'Help 1st-year students with NITH onboarding', category: 'Guidance' },
      { id: 'chat-fun', name: 'Campus Fun & Memes', description: 'Lighthearted campus jokes, memes, and casual talks', category: 'Casual' }
    ];
    
    for (const room of chatrooms) {
      await setDoc(doc(db, 'chatrooms', room.id), room, { merge: true });
    }

    // 2. Check if mess_menus collection is populated
    const menusSnap = await getDocs(query(collection(db, 'mess_menus'), limit(1)));
    if (menusSnap.empty) {
      console.log('Seeding default mess menus to Firestore...');
      const hostels = ['Kailash Hostel', 'Himadri Hostel', 'Shivalik Hostel', 'Dhauladhar Hostel', 'Mani Mahesh Hostel'];
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

      const sampleMeals: Record<string, Omit<FirestoreMessMenu, 'hostel_name' | 'day_of_week'>> = {
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
          const docId = `${hostel.replace(/\s+/g, '-').toLowerCase()}-${day.toLowerCase()}`;
          await setDoc(doc(db, 'mess_menus', docId), {
            hostel_name: hostel,
            day_of_week: day,
            ...sampleMeals[day]
          });
        }
      }
    }

    // 3. Check if announcements collection is populated
    const announcementsSnap = await getDocs(query(collection(db, 'announcements'), limit(1)));
    if (announcementsSnap.empty) {
      console.log('Seeding default announcements to Firestore...');
      const announcements: Omit<FirestoreAnnouncement, 'id'>[] = [
        {
          title: 'Sleep & Digital Wellbeing',
          description: 'Understand digital distractions, improve focus & productivity, learn the science of sleep, and build healthier daily habits.',
          target_audience: 'Only for Boys',
          event_date: 'Saturday, 4 July 2026',
          event_time: '5:30 PM - 6:15 PM',
          location: 'TV Room, Hostel 15',
          status: 'Upcoming',
          publisher: 'Flourishing Hub',
          gradient_theme: 'sunset',
          likes: [],
          comments: []
        },
        {
          title: 'Understanding Emotions',
          description: 'Every emotion has something to tell you. Learn to listen, identify and understand your emotions, with practical strategies to manage stress effectively.',
          target_audience: 'Only for Girls',
          event_date: 'Saturday, 4 July 2026',
          event_time: '5:30 PM - 6:15 PM',
          location: 'TV Room, Hostel 10',
          status: 'Upcoming',
          publisher: 'Flourishing Hub',
          gradient_theme: 'lavender',
          likes: [],
          comments: []
        },
        {
          title: 'Team ChemEca | Third year UG Recruitment',
          description: 'Greetings everyone! Institute Technical Council is recruiting third-year UG students for the core development team. Register now using the form.',
          target_audience: 'All Students',
          event_date: '26 Jun - 7 Jul 2026',
          event_time: 'All Day',
          location: 'Online Registration Portal',
          status: 'Ongoing',
          publisher: 'Tech@NITH',
          gradient_theme: 'ocean',
          likes: [],
          comments: []
        }
      ];

      for (const ann of announcements) {
        await addDoc(collection(db, 'announcements'), {
          ...ann,
          approved: true,
          created_at: serverTimestamp()
        });
      }
    }

    // 4. Check if lost_found collection is populated
    const lostFoundSnap = await getDocs(query(collection(db, 'lost_found'), limit(1)));
    if (lostFoundSnap.empty) {
      console.log('Seeding default lost & found items to Firestore...');
      const sampleItems = [
        {
          title: 'Adidas Black Backpack',
          description: 'Left a black Adidas school bag with a blue water bottle and notebook inside. Please contact if found.',
          type: 'lost',
          location: 'Auditorium Hall, 2nd Row',
          date: '28 Jun 2026',
          contact: '94597-07009',
          user_id: 'sample-user-1',
          user_name: 'Rahul Verma'
        },
        {
          title: 'Bunch of Keys with NITH Keychain',
          description: 'Found a keyring containing 3 keys and a wooden NIT Hamirpur logo keychain near the sports ground.',
          type: 'found',
          location: 'Basketball Court benches',
          date: '30 Jun 2026',
          contact: '98822-12345',
          user_id: 'sample-user-2',
          user_name: 'Ananya Sharma'
        },
        {
          title: 'HP Laptop Charger (65W)',
          description: 'Lost my HP blue pin laptop charger while studying in the library reading room. Please return if spotted.',
          type: 'lost',
          location: 'Central Library, 1st floor reading room',
          date: '29 Jun 2026',
          contact: '90123-45678',
          user_id: 'sample-user-3',
          user_name: 'Sameer Sen'
        }
      ];

      for (const item of sampleItems) {
        await addDoc(collection(db, 'lost_found'), {
          ...item,
          created_at: serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.error('Error seeding Firestore:', error);
  }
}

// Announcements helper functions
export interface FirestoreComment {
  id: string;
  user_id: string;
  user_name: string;
  text: string;
  created_at: string;
}

export interface FirestoreAnnouncement {
  id?: string;
  title: string;
  description: string;
  target_audience: string;
  event_date: string;
  event_time: string;
  location: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  publisher: string;
  publisher_logo?: string;
  gradient_theme: string;
  likes: string[]; // user ids
  comments: FirestoreComment[];
  created_at?: unknown;
  approved?: boolean;
  author_id?: string;
}

export async function getFirestoreAnnouncements(): Promise<FirestoreAnnouncement[]> {
  try {
    const q = query(collection(db, 'announcements'), orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.created_at;
      let serializableCreatedAt = null;
      if (createdAt && typeof createdAt === 'object') {
        const ts = createdAt as { toDate?: () => { toISOString: () => string }; seconds?: number };
        if (typeof ts.toDate === 'function') {
          serializableCreatedAt = ts.toDate().toISOString();
        } else if (typeof ts.seconds === 'number') {
          serializableCreatedAt = new Date(ts.seconds * 1000).toISOString();
        }
      } else if (createdAt) {
        serializableCreatedAt = String(createdAt);
      }
      return {
        id: doc.id,
        ...data,
        approved: data.approved !== false, // Backward compatibility defaults to true
        created_at: serializableCreatedAt
      };
    }) as FirestoreAnnouncement[];
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
}

export async function createFirestoreAnnouncement(
  announcement: Omit<FirestoreAnnouncement, 'id' | 'likes' | 'comments'> & { approved?: boolean }
): Promise<boolean> {
  try {
    await addDoc(collection(db, 'announcements'), {
      ...announcement,
      likes: [],
      comments: [],
      approved: announcement.approved ?? false,
      created_at: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error creating announcement:', error);
    return false;
  }
}

export async function updateAnnouncementApprovalStatus(id: string, approved: boolean): Promise<boolean> {
  try {
    const ref = doc(db, 'announcements', id);
    await updateDoc(ref, { approved });
    return true;
  } catch (error) {
    console.error('Error updating announcement approval status:', error);
    return false;
  }
}

export async function deleteFirestoreAnnouncement(id: string): Promise<boolean> {
  try {
    const ref = doc(db, 'announcements', id);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return false;
  }
}

export async function updateAnnouncementLikes(announcementId: string, likes: string[]): Promise<boolean> {
  try {
    await setDoc(doc(db, 'announcements', announcementId), { likes }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating likes:', error);
    return false;
  }
}

export async function addCommentToAnnouncement(announcementId: string, comments: FirestoreComment[]): Promise<boolean> {
  try {
    await setDoc(doc(db, 'announcements', announcementId), { comments }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error adding comment:', error);
    return false;
  }
}

// Lost & Found helpers
export interface FirestoreLostFoundItem {
  id?: string;
  title: string;
  description: string;
  type: 'lost' | 'found';
  location: string;
  date: string;
  contact: string;
  image?: string;
  images?: string[];
  user_id: string;
  user_name: string;
  created_at?: unknown;
}

export async function getFirestoreLostFoundItems(): Promise<FirestoreLostFoundItem[]> {
  try {
    const q = query(collection(db, 'lost_found'), orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.created_at;
      let serializableCreatedAt = null;
      if (createdAt && typeof createdAt === 'object') {
        const ts = createdAt as { toDate?: () => { toISOString: () => string }; seconds?: number };
        if (typeof ts.toDate === 'function') {
          serializableCreatedAt = ts.toDate().toISOString();
        } else if (typeof ts.seconds === 'number') {
          serializableCreatedAt = new Date(ts.seconds * 1000).toISOString();
        }
      } else if (createdAt) {
        serializableCreatedAt = String(createdAt);
      }
      return {
        id: doc.id,
        ...data,
        created_at: serializableCreatedAt
      };
    }) as FirestoreLostFoundItem[];
  } catch (error) {
    console.error('Error fetching lost & found items:', error);
    return [];
  }
}

export async function createFirestoreLostFoundItem(item: Omit<FirestoreLostFoundItem, 'id'>): Promise<boolean> {
  try {
    const cleanItem = Object.fromEntries(
      Object.entries(item).filter(([, v]) => v !== undefined)
    );
    await addDoc(collection(db, 'lost_found'), {
      ...cleanItem,
      created_at: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error creating lost & found item:', error);
    return false;
  }
}

export interface FirestoreChatroom {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface FirestoreMessage {
  id?: string;
  chatroom_id: string;
  chatroom_name?: string;
  user_id: string;
  user_name: string;
  text: string;
  created_at: string | null;
  reported_by?: string[];
  reports_count?: number;
}

export async function getFirestoreChatrooms(): Promise<FirestoreChatroom[]> {
  try {
    const q = query(collection(db, 'chatrooms'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirestoreChatroom[];
  } catch (error) {
    console.error('Error fetching chatrooms:', error);
    return [];
  }
}

export async function getFirestoreMessages(chatroomId: string): Promise<FirestoreMessage[]> {
  try {
    const q = query(
      collection(db, 'messages'),
      where('chatroom_id', '==', chatroomId)
    );
    const snap = await getDocs(q);
    const msgs = snap.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.created_at;
      let serializableCreatedAt = null;
      if (createdAt && typeof createdAt === 'object') {
        const ts = createdAt as { toDate?: () => { toISOString: () => string }; seconds?: number };
        if (typeof ts.toDate === 'function') {
          serializableCreatedAt = ts.toDate().toISOString();
        } else if (typeof ts.seconds === 'number') {
          serializableCreatedAt = new Date(ts.seconds * 1000).toISOString();
        }
      } else if (createdAt) {
        serializableCreatedAt = String(createdAt);
      }
      return {
        id: doc.id,
        ...data,
        created_at: serializableCreatedAt
      };
    }) as FirestoreMessage[];

    // Sort client-side to avoid requiring composite indexes in Firestore
    msgs.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeA - timeB;
    });

    return msgs.slice(-100);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

export async function createFirestoreMessage(message: Omit<FirestoreMessage, 'id' | 'created_at'>): Promise<boolean> {
  try {
    await addDoc(collection(db, 'messages'), {
      ...message,
      created_at: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error creating message:', error);
    return false;
  }
}

export interface FirestoreMarketplaceItem {
  id?: string;
  title: string;
  description: string;
  original_price: number;
  selling_price: number;
  contact_number: string;
  image?: string; // base64 string
  user_id: string;
  user_name: string;
  created_at: string | null;
  category?: string; // e.g. Books, Electronics, Cycle, Hostel Gear, Others
  status: 'active' | 'sold';
}

export async function getFirestoreMarketplaceItems(): Promise<FirestoreMarketplaceItem[]> {
  try {
    const q = query(
      collection(db, 'marketplace'),
      orderBy('created_at', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.created_at;
      let serializableCreatedAt = null;
      if (createdAt && typeof createdAt === 'object') {
        const ts = createdAt as { toDate?: () => { toISOString: () => string }; seconds?: number };
        if (typeof ts.toDate === 'function') {
          serializableCreatedAt = ts.toDate().toISOString();
        } else if (typeof ts.seconds === 'number') {
          serializableCreatedAt = new Date(ts.seconds * 1000).toISOString();
        }
      } else if (createdAt) {
        serializableCreatedAt = String(createdAt);
      }
      return {
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        original_price: Number(data.original_price || 0),
        selling_price: Number(data.selling_price || 0),
        contact_number: data.contact_number || '',
        image: data.image || '',
        user_id: data.user_id || '',
        user_name: data.user_name || '',
        category: data.category || 'Others',
        status: data.status || 'active',
        created_at: serializableCreatedAt
      };
    });
  } catch (error) {
    console.error('Error fetching marketplace items:', error);
    return [];
  }
}

export async function createFirestoreMarketplaceItem(item: Omit<FirestoreMarketplaceItem, 'id' | 'created_at'>): Promise<boolean> {
  try {
    await addDoc(collection(db, 'marketplace'), {
      ...item,
      created_at: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error creating marketplace item:', error);
    return false;
  }
}

export async function updateMarketplaceItemStatus(id: string, status: 'active' | 'sold'): Promise<boolean> {
  try {
    const ref = doc(db, 'marketplace', id);
    await updateDoc(ref, { status });
    return true;
  } catch (error) {
    console.error('Error updating marketplace item status:', error);
    return false;
  }
}

export interface TimetableSubmission {
  id?: string;
  year: string;
  section?: string;
  branch?: string;
  file_data: string;
  file_name: string;
  uploaded_by: string;
  uploaded_by_email: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string | null;
}

export interface ApprovedTimetable {
  id?: string;
  year: string;
  section?: string;
  branch?: string;
  file_data: string;
  created_at?: string | null;
}

export async function createTimetableSubmission(submission: Omit<TimetableSubmission, 'id' | 'status' | 'created_at'>): Promise<boolean> {
  try {
    await addDoc(collection(db, 'timetable_submissions'), {
      ...submission,
      status: 'pending',
      created_at: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error creating timetable submission:', error);
    return false;
  }
}

export async function getTimetableSubmissions(): Promise<TimetableSubmission[]> {
  try {
    const q = query(collection(db, 'timetable_submissions'), orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.created_at;
      let serializableCreatedAt = null;
      if (createdAt && typeof createdAt === 'object') {
        const ts = createdAt as { toDate?: () => { toISOString: () => string }; seconds?: number };
        if (typeof ts.toDate === 'function') {
          serializableCreatedAt = ts.toDate().toISOString();
        } else if (typeof ts.seconds === 'number') {
          serializableCreatedAt = new Date(ts.seconds * 1000).toISOString();
        }
      } else if (createdAt) {
        serializableCreatedAt = String(createdAt);
      }
      return {
        id: doc.id,
        year: data.year || '',
        section: data.section || '',
        branch: data.branch || '',
        file_data: data.file_data || '',
        file_name: data.file_name || '',
        uploaded_by: data.uploaded_by || '',
        uploaded_by_email: data.uploaded_by_email || '',
        status: data.status || 'pending',
        created_at: serializableCreatedAt
      };
    });
  } catch (error) {
    console.error('Error fetching timetable submissions:', error);
    return [];
  }
}

export async function getApprovedTimetables(): Promise<ApprovedTimetable[]> {
  try {
    const q = query(collection(db, 'approved_timetables'), orderBy('year', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        year: data.year || '',
        section: data.section || '',
        branch: data.branch || '',
        file_data: data.file_data || ''
      };
    });
  } catch (error) {
    console.error('Error fetching approved timetables:', error);
    return [];
  }
}

export async function approveTimetableSubmission(
  submissionId: string, 
  year: string, 
  section: string, 
  branch: string, 
  fileData: string
): Promise<boolean> {
  try {
    const subRef = doc(db, 'timetable_submissions', submissionId);
    await updateDoc(subRef, { status: 'approved' });

    const customIdKey = branch 
      ? `Branch_${branch.replace(/\s+/g, '_')}`
      : `Section_${section}`;
    const customId = `${year.replace(/\s+/g, '_')}_${customIdKey}`;

    const timetableRef = doc(db, 'approved_timetables', customId);
    await setDoc(timetableRef, {
      year,
      section: section || '',
      branch: branch || '',
      file_data: fileData,
      created_at: serverTimestamp()
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('Error approving timetable:', error);
    return false;
  }
}

export async function rejectTimetableSubmission(submissionId: string): Promise<boolean> {
  try {
    const subRef = doc(db, 'timetable_submissions', submissionId);
    await updateDoc(subRef, { status: 'rejected' });
    return true;
  } catch (error) {
    console.error('Error rejecting timetable:', error);
    return false;
  }
}

export interface FeedbackSubmission {
  id?: string;
  suggestion: string;
  submitted_by: string;
  submitted_by_email: string;
  awarded_visionary: boolean;
  created_at?: string | null;
}

export async function submitFeedback(suggestion: string, userName: string, userEmail: string): Promise<boolean> {
  try {
    await addDoc(collection(db, 'feedback_submissions'), {
      suggestion,
      submitted_by: userName,
      submitted_by_email: userEmail,
      awarded_visionary: false,
      created_at: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return false;
  }
}

export async function getFeedbackSubmissions(): Promise<FeedbackSubmission[]> {
  try {
    const q = query(collection(db, 'feedback_submissions'), orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.created_at;
      let serializableCreatedAt = null;
      if (createdAt && typeof createdAt === 'object') {
        const ts = createdAt as { toDate?: () => { toISOString: () => string }; seconds?: number };
        if (typeof ts.toDate === 'function') {
          serializableCreatedAt = ts.toDate().toISOString();
        } else if (typeof ts.seconds === 'number') {
          serializableCreatedAt = new Date(ts.seconds * 1000).toISOString();
        }
      } else if (createdAt) {
        serializableCreatedAt = String(createdAt);
      }
      return {
        id: doc.id,
        suggestion: data.suggestion || '',
        submitted_by: data.submitted_by || '',
        submitted_by_email: data.submitted_by_email || '',
        awarded_visionary: !!data.awarded_visionary,
        created_at: serializableCreatedAt
      };
    });
  } catch (error) {
    console.error('Error getting feedback submissions:', error);
    return [];
  }
}

export async function awardVisionaryBadge(submissionId: string, award: boolean): Promise<boolean> {
  try {
    const docRef = doc(db, 'feedback_submissions', submissionId);
    await updateDoc(docRef, { awarded_visionary: award });
    return true;
  } catch (error) {
    console.error('Error awarding visionary badge:', error);
    return false;
  }
}

export async function getUserAchievements(userEmail: string): Promise<{
  pathfinderTier: number;
  isVisionary: boolean;
}> {
  try {
    const q = query(collection(db, 'feedback_submissions'), where('submitted_by_email', '==', userEmail));
    const snap = await getDocs(q);
    const submissions = snap.docs.map(doc => doc.data());
    
    const count = submissions.length;
    let pathfinderTier = 0;
    if (count >= 5) {
      pathfinderTier = 3;
    } else if (count >= 3) {
      pathfinderTier = 2;
    } else if (count >= 1) {
      pathfinderTier = 1;
    }
    
    const isVisionary = submissions.some(s => s.awarded_visionary === true);
    
    return {
      pathfinderTier,
      isVisionary
    };
  } catch (error) {
    console.error('Error getting user achievements:', error);
    return { pathfinderTier: 0, isVisionary: false };
  }
}

export interface Club {
  id?: string;
  name: string;
  desc: string;
  category: string;
  contact: string;
  president_name: string;
  president_email: string;
  president_designation: string;
  domains: string;
  approved_by: string;
  created_at?: string | null;
}

export interface ClubSubmission {
  id?: string;
  name: string;
  desc: string;
  category: string;
  contact: string;
  president_name: string;
  president_email: string;
  president_designation: string;
  domains: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_by: string;
  submitted_by_email: string;
  created_at?: string | null;
}

export async function submitClubRequest(
  name: string,
  desc: string,
  category: string,
  contact: string,
  presidentName: string,
  presidentEmail: string,
  presidentDesignation: string,
  domains: string,
  userName: string,
  userEmail: string
): Promise<boolean> {
  try {
    await addDoc(collection(db, 'club_submissions'), {
      name,
      desc,
      category,
      contact,
      president_name: presidentName,
      president_email: presidentEmail,
      president_designation: presidentDesignation,
      domains,
      status: 'pending',
      submitted_by: userName,
      submitted_by_email: userEmail,
      created_at: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error submitting club request:', error);
    return false;
  }
}

export async function getClubSubmissions(): Promise<ClubSubmission[]> {
  try {
    const q = query(collection(db, 'club_submissions'), orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.created_at;
      let serializableCreatedAt = null;
      if (createdAt && typeof createdAt === 'object') {
        const ts = createdAt as { toDate?: () => { toISOString: () => string }; seconds?: number };
        if (typeof ts.toDate === 'function') {
          serializableCreatedAt = ts.toDate().toISOString();
        } else if (typeof ts.seconds === 'number') {
          serializableCreatedAt = new Date(ts.seconds * 1000).toISOString();
        }
      } else if (createdAt) {
        serializableCreatedAt = String(createdAt);
      }
      return {
        id: doc.id,
        name: data.name || '',
        desc: data.desc || '',
        category: data.category || 'cultural',
        contact: data.contact || '',
        president_name: data.president_name || '',
        president_email: data.president_email || '',
        president_designation: data.president_designation || '',
        domains: data.domains || '',
        status: data.status || 'pending',
        submitted_by: data.submitted_by || '',
        submitted_by_email: data.submitted_by_email || '',
        created_at: serializableCreatedAt
      };
    });
  } catch (error) {
    console.error('Error getting club submissions:', error);
    return [];
  }
}

export async function getApprovedClubs(): Promise<Club[]> {
  try {
    const q = query(collection(db, 'clubs'), orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.created_at;
      let serializableCreatedAt = null;
      if (createdAt && typeof createdAt === 'object') {
        const ts = createdAt as { toDate?: () => { toISOString: () => string }; seconds?: number };
        if (typeof ts.toDate === 'function') {
          serializableCreatedAt = ts.toDate().toISOString();
        } else if (typeof ts.seconds === 'number') {
          serializableCreatedAt = new Date(ts.seconds * 1000).toISOString();
        }
      } else if (createdAt) {
        serializableCreatedAt = String(createdAt);
      }
      return {
        id: doc.id,
        name: data.name || '',
        desc: data.desc || '',
        category: data.category || 'cultural',
        contact: data.contact || '',
        president_name: data.president_name || '',
        president_email: data.president_email || '',
        president_designation: data.president_designation || '',
        domains: data.domains || '',
        approved_by: data.approved_by || '',
        created_at: serializableCreatedAt
      };
    });
  } catch (error) {
    console.error('Error getting approved clubs:', error);
    return [];
  }
}

export async function approveClubSubmission(submissionId: string, devEmail: string): Promise<boolean> {
  try {
    const subRef = doc(db, 'club_submissions', submissionId);
    const snap = await getDoc(subRef);
    if (!snap.exists()) return false;
    
    const subData = snap.data();
    
    await addDoc(collection(db, 'clubs'), {
      name: subData.name,
      desc: subData.desc,
      category: subData.category,
      contact: subData.contact,
      president_name: subData.president_name || '',
      president_email: subData.president_email || '',
      president_designation: subData.president_designation || '',
      domains: subData.domains || '',
      approved_by: devEmail,
      created_at: serverTimestamp()
    });
    
    await updateDoc(subRef, { status: 'approved' });
    return true;
  } catch (error) {
    console.error('Error approving club submission:', error);
    return false;
  }
}

export async function rejectClubSubmission(submissionId: string): Promise<boolean> {
  try {
    const subRef = doc(db, 'club_submissions', submissionId);
    await updateDoc(subRef, { status: 'rejected' });
    return true;
  } catch (error) {
    console.error('Error rejecting club submission:', error);
    return false;
  }
}

// ─── Academic Files ───────────────────────────────────────────────────────────

export type AcademicTab = 'syllabus' | 'calendar' | 'notes' | 'practical' | 'pyq';

export interface AcademicFile {
  id: string;
  tab: AcademicTab;
  title: string;
  description: string;
  subject: string;
  year: string;         // '1st Year' | '2nd Year' | '3rd Year' | '4th Year'
  branch: string;       // 'All' for 1st year, full branch name for others
  drive_link: string;   // Google Drive direct download URL
  uploaded_by: string;
  uploaded_by_email: string;
  uploaded_at: unknown;
}

export async function addAcademicFile(data: Omit<AcademicFile, 'id' | 'uploaded_at'>): Promise<boolean> {
  try {
    await addDoc(collection(db, 'academic_files'), {
      ...data,
      uploaded_at: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error adding academic file:', error);
    return false;
  }
}

export async function fetchAcademicFiles(tab: AcademicTab): Promise<AcademicFile[]> {
  try {
    const q = query(
      collection(db, 'academic_files'),
      where('tab', '==', tab)
    );
    const snap = await getDocs(q);
    const files = snap.docs.map(doc => {
      const data = doc.data();
      const uploadedAt = data.uploaded_at;
      let serializableUploadedAt = null;
      if (uploadedAt && typeof uploadedAt === 'object') {
        const ts = uploadedAt as { toDate?: () => { toISOString: () => string }; seconds?: number };
        if (typeof ts.toDate === 'function') {
          serializableUploadedAt = ts.toDate().toISOString();
        } else if (typeof ts.seconds === 'number') {
          serializableUploadedAt = new Date(ts.seconds * 1000).toISOString();
        }
      } else if (uploadedAt) {
        serializableUploadedAt = String(uploadedAt);
      }
      return {
        id: doc.id,
        ...data,
        uploaded_at: serializableUploadedAt
      } as AcademicFile;
    });

    files.sort((a, b) => {
      const timeA = a.uploaded_at ? new Date(a.uploaded_at as string).getTime() : 0;
      const timeB = b.uploaded_at ? new Date(b.uploaded_at as string).getTime() : 0;
      return timeB - timeA;
    });

    return files;
  } catch (error) {
    console.error('Error fetching academic files:', error);
    return [];
  }
}

export async function fetchAllAcademicFiles(): Promise<AcademicFile[]> {
  try {
    const q = query(collection(db, 'academic_files'), orderBy('uploaded_at', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => {
      const data = doc.data();
      const uploadedAt = data.uploaded_at;
      let serializableUploadedAt = null;
      if (uploadedAt && typeof uploadedAt === 'object') {
        const ts = uploadedAt as { toDate?: () => { toISOString: () => string }; seconds?: number };
        if (typeof ts.toDate === 'function') {
          serializableUploadedAt = ts.toDate().toISOString();
        } else if (typeof ts.seconds === 'number') {
          serializableUploadedAt = new Date(ts.seconds * 1000).toISOString();
        }
      } else if (uploadedAt) {
        serializableUploadedAt = String(uploadedAt);
      }
      return {
        id: doc.id,
        ...data,
        uploaded_at: serializableUploadedAt
      } as AcademicFile;
    });
  } catch (error) {
    console.error('Error fetching all academic files:', error);
    return [];
  }
}

export async function deleteAcademicFile(fileId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'academic_files', fileId));
    return true;
  } catch (error) {
    console.error('Error deleting academic file:', error);
    return false;
  }
}

export async function reportFirestoreMessage(messageId: string, userId: string): Promise<{ success: boolean; reportsCount: number }> {
  try {
    const docRef = doc(db, 'messages', messageId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return { success: false, reportsCount: 0 };
    
    const data = docSnap.data();
    const reportedBy = data.reported_by || [];
    
    if (reportedBy.includes(userId)) {
      return { success: true, reportsCount: reportedBy.length };
    }
    
    const nextReportedBy = [...reportedBy, userId];
    await updateDoc(docRef, {
      reported_by: nextReportedBy,
      reports_count: nextReportedBy.length
    });
    
    return { success: true, reportsCount: nextReportedBy.length };
  } catch (error) {
    console.error('Error reporting message:', error);
    return { success: false, reportsCount: 0 };
  }
}

export async function getReportedFirestoreMessages(): Promise<FirestoreMessage[]> {
  try {
    const q = query(
      collection(db, 'messages'),
      where('reports_count', '>=', 3)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.created_at;
      let serializableCreatedAt = null;
      if (createdAt && typeof createdAt === 'object') {
        const ts = createdAt as { toDate?: () => { toISOString: () => string }; seconds?: number };
        if (typeof ts.toDate === 'function') {
          serializableCreatedAt = ts.toDate().toISOString();
        } else if (typeof ts.seconds === 'number') {
          serializableCreatedAt = new Date(ts.seconds * 1000).toISOString();
        }
      } else if (createdAt) {
        serializableCreatedAt = String(createdAt);
      }
      return {
        id: doc.id,
        ...data,
        created_at: serializableCreatedAt
      } as FirestoreMessage;
    });
  } catch (error) {
    console.error('Error fetching reported messages:', error);
    return [];
  }
}

export async function dismissFirestoreMessageReports(messageId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'messages', messageId);
    await updateDoc(docRef, {
      reported_by: [],
      reports_count: 0
    });
    return true;
  } catch (error) {
    console.error('Error dismissing reports:', error);
    return false;
  }
}

export async function deleteFirestoreMessage(messageId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'messages', messageId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    return false;
  }
}

export async function banFirestoreUser(userId: string, bannedUntil: string, reason?: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      banned_until: bannedUntil,
      ban_reason: reason || 'Violation of chatroom policies'
    });
    return true;
  } catch (error) {
    console.error('Error banning user:', error);
    return false;
  }
}

export async function unbanFirestoreUser(userId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      banned_until: null,
      ban_reason: null
    });
    return true;
  } catch (error) {
    console.error('Error unbanning user:', error);
    return false;
  }
}

export async function isFirestoreUserBanned(userId: string): Promise<{ banned: boolean; bannedUntil?: string | null; reason?: string | null }> {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return { banned: false };
    
    const data = docSnap.data();
    const bannedUntil = data.banned_until;
    if (bannedUntil) {
      const expiry = new Date(bannedUntil).getTime();
      const now = new Date().getTime();
      if (expiry > now) {
        return { banned: true, bannedUntil, reason: data.ban_reason };
      }
      await updateDoc(docRef, {
        banned_until: null,
        ban_reason: null
      });
    }
  } catch (error) {
    console.error('Error checking user ban status:', error);
  }
  return { banned: false };
}

const DEFAULT_BAD_WORDS = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'pussy', 'whore', 'slut'
];

export async function getBlockedWords(): Promise<string[]> {
  try {
    const docRef = doc(db, 'settings', 'chatroom_moderation');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (Array.isArray(data.blocked_words)) {
        return data.blocked_words;
      }
    }
  } catch (error) {
    console.error('Error fetching blocked words:', error);
  }
  return DEFAULT_BAD_WORDS;
}

export async function addBlockedWord(word: string): Promise<boolean> {
  try {
    const cleanWord = word.trim().toLowerCase();
    if (!cleanWord) return false;
    
    const docRef = doc(db, 'settings', 'chatroom_moderation');
    const docSnap = await getDoc(docRef);
    
    let currentWords = [...DEFAULT_BAD_WORDS];
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (Array.isArray(data.blocked_words)) {
        currentWords = data.blocked_words;
      }
    }
    
    if (currentWords.includes(cleanWord)) return true;
    
    const nextWords = [...currentWords, cleanWord];
    await setDoc(docRef, { blocked_words: nextWords }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error adding blocked word:', error);
    return false;
  }
}

export async function removeBlockedWord(word: string): Promise<boolean> {
  try {
    const cleanWord = word.trim().toLowerCase();
    if (!cleanWord) return false;
    
    const docRef = doc(db, 'settings', 'chatroom_moderation');
    const docSnap = await getDoc(docRef);
    
    let currentWords = [...DEFAULT_BAD_WORDS];
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (Array.isArray(data.blocked_words)) {
        currentWords = data.blocked_words;
      }
    }
    
    const nextWords = currentWords.filter(w => w !== cleanWord);
    await setDoc(docRef, { blocked_words: nextWords }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error removing blocked word:', error);
    return false;
  }
}

export async function updateFirestoreUser(userId: string, data: Partial<FirestoreUser>): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, data);
    return true;
  } catch (error) {
    console.error('Error updating user in Firestore:', error);
    return false;
  }
}

export interface DirectoryContact {
  id: string;
  name: string;
  category: string;
  subtext: string;
  phone: string;
}

export async function getFirestoreDirectoryContacts(): Promise<DirectoryContact[]> {
  try {
    const snap = await getDocs(collection(db, 'directory_contacts'));
    const list = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DirectoryContact[];
    
    // Seed actual Hamirpur contacts if database is empty
    if (list.length === 0) {
      const initial = [
        { name: "All-in-one Emergency (India)", category: "🚨 Emergency & Security", subtext: "National Helpline", phone: "112" },
        { name: "Ambulance", category: "🚨 Emergency & Security", subtext: "Emergency Medical Services", phone: "108" },
        { name: "Police", category: "🚨 Emergency & Security", subtext: "Local Police Helpline", phone: "100" },
        { name: "Fire", category: "🚨 Emergency & Security", subtext: "Local Fire Department", phone: "101" },
        { name: "SP Office, Hamirpur", category: "🚨 Emergency & Security", subtext: "Superintendent of Police", phone: "+911972292175" },
        { name: "Hamirpur Police", category: "🚨 Emergency & Security", subtext: "General Helpline", phone: "+911972222053" },
        { name: "Bus Stand Enquiry, Hamirpur", category: "💬 Other Contacts", subtext: "HRTC Enquiry Desk", phone: "01972222893" }
      ];
      
      for (const item of initial) {
        await addDoc(collection(db, 'directory_contacts'), item);
      }
      
      const freshSnap = await getDocs(collection(db, 'directory_contacts'));
      return freshSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DirectoryContact[];
    }
    
    return list;
  } catch (error) {
    console.error('Error fetching directory contacts:', error);
    return [];
  }
}

export async function createFirestoreDirectoryContact(contact: Omit<DirectoryContact, 'id'>): Promise<boolean> {
  try {
    await addDoc(collection(db, 'directory_contacts'), contact);
    return true;
  } catch (error) {
    console.error('Error adding directory contact:', error);
    return false;
  }
}

export async function deleteFirestoreDirectoryContact(contactId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'directory_contacts', contactId));
    return true;
  } catch (error) {
    console.error('Error deleting directory contact:', error);
    return false;
  }
}

// ==========================================
// Breadit Reddit Clone Firestore Operations
// ==========================================

export interface FirestoreBreaditPost {
  id?: string;
  title: string;
  content: string;
  user_id: string;
  user_name: string;
  created_at: string;
  reports_count?: number;
  reported_by?: string[];
  comments_count?: number;
}

export interface FirestoreBreaditComment {
  id?: string;
  post_id: string;
  content: string;
  user_id: string;
  user_name: string;
  created_at: string;
  reports_count?: number;
  reported_by?: string[];
}

export async function getFirestoreBreaditPosts(): Promise<FirestoreBreaditPost[]> {
  try {
    const q = query(collection(db, 'breadit_posts'));
    const snap = await getDocs(q);
    const posts = snap.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.created_at;
      let serializableCreatedAt = null;
      if (createdAt && typeof createdAt === 'object') {
        const ts = createdAt as { toDate?: () => { toISOString: () => string }; seconds?: number };
        if (typeof ts.toDate === 'function') {
          serializableCreatedAt = ts.toDate().toISOString();
        } else if (typeof ts.seconds === 'number') {
          serializableCreatedAt = new Date(ts.seconds * 1000).toISOString();
        }
      } else if (createdAt) {
        serializableCreatedAt = String(createdAt);
      }
      return {
        id: doc.id,
        ...data,
        created_at: serializableCreatedAt
      };
    }) as FirestoreBreaditPost[];
    
    // Sort descending
    posts.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });
    return posts;
  } catch (error) {
    console.error('Error fetching Breadit posts:', error);
    return [];
  }
}

export async function createFirestoreBreaditPost(post: Omit<FirestoreBreaditPost, 'id' | 'created_at'>): Promise<string> {
  const newPost = {
    ...post,
    created_at: new Date().toISOString(),
    reports_count: 0,
    reported_by: [],
    comments_count: 0
  };
  const docRef = await addDoc(collection(db, 'breadit_posts'), newPost);
  return docRef.id;
}

export async function getFirestoreBreaditComments(postId: string): Promise<FirestoreBreaditComment[]> {
  try {
    const q = query(
      collection(db, 'breadit_comments'),
      where('post_id', '==', postId)
    );
    const snap = await getDocs(q);
    const comments = snap.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.created_at;
      let serializableCreatedAt = null;
      if (createdAt && typeof createdAt === 'object') {
        const ts = createdAt as { toDate?: () => { toISOString: () => string }; seconds?: number };
        if (typeof ts.toDate === 'function') {
          serializableCreatedAt = ts.toDate().toISOString();
        } else if (typeof ts.seconds === 'number') {
          serializableCreatedAt = new Date(ts.seconds * 1000).toISOString();
        }
      } else if (createdAt) {
        serializableCreatedAt = String(createdAt);
      }
      return {
        id: doc.id,
        ...data,
        created_at: serializableCreatedAt
      };
    }) as FirestoreBreaditComment[];

    // Sort ascending
    comments.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeA - timeB;
    });
    return comments;
  } catch (error) {
    console.error('Error fetching Breadit comments:', error);
    return [];
  }
}

export async function createFirestoreBreaditComment(comment: Omit<FirestoreBreaditComment, 'id' | 'created_at'>): Promise<boolean> {
  const newComment = {
    ...comment,
    created_at: new Date().toISOString(),
    reports_count: 0,
    reported_by: []
  };
  
  // Add comment document
  await addDoc(collection(db, 'breadit_comments'), newComment);
  
  // Increment comment count on the post
  const postRef = doc(db, 'breadit_posts', comment.post_id);
  await updateDoc(postRef, {
    comments_count: increment(1)
  });
  
  return true;
}

export async function reportFirestoreBreaditPost(postId: string, userId: string): Promise<boolean> {
  try {
    const postRef = doc(db, 'breadit_posts', postId);
    await updateDoc(postRef, {
      reported_by: arrayUnion(userId),
      reports_count: increment(1)
    });
    return true;
  } catch (error) {
    console.error('Error reporting Breadit post:', error);
    return false;
  }
}

export async function reportFirestoreBreaditComment(commentId: string, userId: string): Promise<boolean> {
  try {
    const commentRef = doc(db, 'breadit_comments', commentId);
    await updateDoc(commentRef, {
      reported_by: arrayUnion(userId),
      reports_count: increment(1)
    });
    return true;
  } catch (error) {
    console.error('Error reporting Breadit comment:', error);
    return false;
  }
}

export async function deleteFirestoreBreaditPost(postId: string): Promise<boolean> {
  try {
    // Delete the post document
    await deleteDoc(doc(db, 'breadit_posts', postId));
    
    // Delete associated comments
    const q = query(collection(db, 'breadit_comments'), where('post_id', '==', postId));
    const snap = await getDocs(q);
    const deletePromises = snap.docs.map(d => deleteDoc(doc(db, 'breadit_comments', d.id)));
    await Promise.all(deletePromises);
    
    return true;
  } catch (error) {
    console.error('Error deleting Breadit post:', error);
    return false;
  }
}

export async function deleteFirestoreBreaditComment(commentId: string, postId: string): Promise<boolean> {
  try {
    // Delete the comment document
    await deleteDoc(doc(db, 'breadit_comments', commentId));
    
    // Decrement post comments count
    const postRef = doc(db, 'breadit_posts', postId);
    await updateDoc(postRef, {
      comments_count: increment(-1)
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting Breadit comment:', error);
    return false;
  }
}
