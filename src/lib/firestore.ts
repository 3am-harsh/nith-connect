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
  deleteDoc
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
      return docSnap.data() as FirestoreUser;
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
  user_id: string;
  user_name: string;
  text: string;
  created_at: string | null;
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

    return msgs;
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
