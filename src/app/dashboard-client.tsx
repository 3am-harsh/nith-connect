'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useTransition } from 'react';
import { UserSession } from '@/lib/auth';
import { logout } from './login/actions';
import { fetchMessMenu, MessMenuData } from './actions/mess';
import { 
  fetchAnnouncements, 
  toggleLikeAnnouncement, 
  commentAnnouncement, 
  createAnnouncementAction,
  approveAnnouncementAction,
  rejectAnnouncementAction
} from './actions/announcements';
import { fetchLostFoundItems, createLostFoundItemAction, runSeedingAction } from './actions/lostfound';
import { 
  fetchChatrooms, 
  fetchMessages, 
  sendChatMessage,
  reportMessageAction,
  fetchReportedMessagesAction,
  dismissReportsAction,
  deleteMessageAction,
  banUserAction,
  unbanUserAction,
  fetchBlockedWordsAction,
  addBlockedWordAction,
  removeBlockedWordAction
} from './actions/chat';
import { 
  getMarketplaceItemsAction, 
  createMarketplaceItemAction, 
  updateMarketplaceItemStatusAction 
} from './actions/marketplace';
import {
  submitTimetableAction,
  fetchTimetableSubmissions,
  fetchApprovedTimetables,
  approveTimetableAction,
  rejectTimetableAction
} from './actions/timetable';
import {
  submitFeedbackAction,
  fetchFeedbackSubmissionsAction,
  awardVisionaryBadgeAction,
  fetchUserAchievementsAction
} from './actions/feedback';
import {
  submitClubRequestAction,
  fetchClubSubmissionsAction,
  fetchApprovedClubsAction,
  approveClubSubmissionAction,
  rejectClubSubmissionAction
} from './actions/clubs';
import {
  addAcademicFileAction,
  fetchAllAcademicFilesAction,
  deleteAcademicFileAction
} from './actions/academics';
import { 
  type FirestoreAnnouncement, 
  type FirestoreComment, 
  type FirestoreLostFoundItem,
  type FirestoreChatroom,
  type FirestoreMessage,
  type FirestoreMarketplaceItem,
  type TimetableSubmission,
  type ApprovedTimetable,
  type FeedbackSubmission,
  type Club,
  type ClubSubmission,
  type AcademicFile,
  type AcademicTab
} from '@/lib/firestore';
import { 
  Mountain, 
  Home, 
  Contact, 
  User,
  Rss, 
  ShoppingBag, 
  BookOpen, 
  MessageSquare, 
  LogOut, 
  X, 
  Sparkles,
  Bell,
  ExternalLink,
  Download,
  Search,
  Heart,
  Calendar,
  MapPin,
  Plus,
  ArrowRight,
  Upload,
  CheckCircle2,
  Info,
  GraduationCap,
  FileText,
  Link2,
  Calculator,
  Clock,
  Globe,
  Phone,
  ShieldAlert
} from 'lucide-react';

interface ClassSlot {
  time: string;
  subject: string;
  code: string;
  room: string;
  isLunch?: boolean;
}

const weeklyTimetable: Record<string, ClassSlot[]> = {
  Monday: [
    { time: '9-10', subject: 'Analog Electronics', code: 'EC-201', room: 'LH-101' },
    { time: '10-11', subject: 'Data Structures', code: 'CS-202', room: 'LH-102' },
    { time: '11-12', subject: 'Signals & Systems', code: 'EC-203', room: 'LH-103' },
    { time: '12-1', subject: 'Mathematics III', code: 'MA-201', room: 'LH-104' },
    { time: '1-2', subject: 'Lunch Break', code: 'LUNCH', room: 'Mess', isLunch: true },
    { time: '2-3', subject: 'Analog Electronics Lab', code: 'EC-211', room: 'Lab-1' },
    { time: '3-4', subject: 'Analog Electronics Lab', code: 'EC-211', room: 'Lab-1' },
    { time: '4-5', subject: 'Technical Seminar', code: 'CS-205', room: 'LH-102' },
    { time: '5-6', subject: 'Club Activities', code: 'CLUBS', room: 'OAT' }
  ],
  Tuesday: [
    { time: '9-10', subject: 'Mathematics III', code: 'MA-201', room: 'LH-104' },
    { time: '10-11', subject: 'Digital Design', code: 'EC-202', room: 'LH-201' },
    { time: '11-12', subject: 'Data Structures', code: 'CS-202', room: 'LH-102' },
    { time: '12-1', subject: 'Humanities & Social Sci', code: 'HS-201', room: 'LH-202' },
    { time: '1-2', subject: 'Lunch Break', code: 'LUNCH', room: 'Mess', isLunch: true },
    { time: '2-3', subject: 'Signals & Systems', code: 'EC-203', room: 'LH-103' },
    { time: '3-4', subject: 'Technical Seminar', code: 'CS-205', room: 'LH-102' },
    { time: '4-5', subject: 'Sports / Leisure', code: 'FITNESS', room: 'Grounds' },
    { time: '5-6', subject: 'Club Activities', code: 'CLUBS', room: 'OAT' }
  ],
  Wednesday: [
    { time: '9-10', subject: 'Signals & Systems', code: 'EC-203', room: 'LH-103' },
    { time: '10-11', subject: 'Data Structures', code: 'CS-202', room: 'LH-102' },
    { time: '11-12', subject: 'Analog Electronics', code: 'EC-201', room: 'LH-101' },
    { time: '12-1', subject: 'Digital Design', code: 'EC-202', room: 'LH-201' },
    { time: '1-2', subject: 'Lunch Break', code: 'LUNCH', room: 'Mess', isLunch: true },
    { time: '2-3', subject: 'Data Structures Lab', code: 'CS-212', room: 'Lab-2' },
    { time: '3-4', subject: 'Data Structures Lab', code: 'CS-212', room: 'Lab-2' },
    { time: '4-5', subject: 'Aptitude & Placement Prep', code: 'PLACE', room: 'LH-101' },
    { time: '5-6', subject: 'Club Activities', code: 'CLUBS', room: 'OAT' }
  ],
  Thursday: [
    { time: '9-10', subject: 'Mathematics III', code: 'MA-201', room: 'LH-104' },
    { time: '10-11', subject: 'Digital Design', code: 'EC-202', room: 'LH-201' },
    { time: '11-12', subject: 'Analog Electronics', code: 'EC-201', room: 'LH-101' },
    { time: '12-1', subject: 'Humanities & Social Sci', code: 'HS-201', room: 'LH-202' },
    { time: '1-2', subject: 'Lunch Break', code: 'LUNCH', room: 'Mess', isLunch: true },
    { time: '2-3', subject: 'Digital Design Lab', code: 'EC-212', room: 'Lab-3' },
    { time: '3-4', subject: 'Digital Design Lab', code: 'EC-212', room: 'Lab-3' },
    { time: '4-5', subject: 'Technical Seminar', code: 'CS-205', room: 'LH-102' },
    { time: '5-6', subject: 'Club Activities', code: 'CLUBS', room: 'OAT' }
  ],
  Friday: [
    { time: '9-10', subject: 'Signals & Systems', code: 'EC-203', room: 'LH-103' },
    { time: '10-11', subject: 'Digital Design', code: 'EC-202', room: 'LH-201' },
    { time: '11-12', subject: 'Humanities & Social Sci', code: 'HS-201', room: 'LH-202' },
    { time: '12-1', subject: 'Analog Electronics', code: 'EC-201', room: 'LH-101' },
    { time: '1-2', subject: 'Lunch Break', code: 'LUNCH', room: 'Mess', isLunch: true },
    { time: '2-3', subject: 'Professional Comm', code: 'HS-202', room: 'LH-104' },
    { time: '3-4', subject: 'Tutorial Class', code: 'TUT', room: 'LH-101' },
    { time: '4-5', subject: 'Sports / Leisure', code: 'FITNESS', room: 'Grounds' },
    { time: '5-6', subject: 'Club Activities', code: 'CLUBS', room: 'OAT' }
  ],
  Saturday: [],
  Sunday: []
};

const parseSlotHours = (slotTime: string): { start: number; end: number } => {
  switch (slotTime) {
    case '9-10': return { start: 9, end: 10 };
    case '10-11': return { start: 10, end: 11 };
    case '11-12': return { start: 11, end: 12 };
    case '12-1': return { start: 12, end: 13 };
    case '1-2': return { start: 13, end: 14 };
    case '2-3': return { start: 14, end: 15 };
    case '3-4': return { start: 15, end: 16 };
    case '4-5': return { start: 16, end: 17 };
    case '5-6': return { start: 17, end: 18 };
    default: return { start: 0, end: 0 };
  }
};

const getSlotFillPercentage = (slotTime: string): number => {
  const { start, end } = parseSlotHours(slotTime);
  if (start === 0) return 0;

  const now = new Date();
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = weekdays[now.getDay()];
  if (currentDayName === 'Saturday' || currentDayName === 'Sunday') return 0;

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const totalMinutesNow = currentHour * 60 + currentMinute;

  const startMinutes = start * 60;
  const endMinutes = end * 60;

  if (totalMinutesNow >= endMinutes) return 100;
  if (totalMinutesNow < startMinutes) return 0;

  return Math.min(100, Math.max(0, Math.floor(((totalMinutesNow - startMinutes) / (endMinutes - startMinutes)) * 100)));
};

const isCurrentSlot = (slotTime: string): boolean => {
  const { start, end } = parseSlotHours(slotTime);
  if (start === 0) return false;

  const now = new Date();
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = weekdays[now.getDay()];
  if (currentDayName === 'Saturday' || currentDayName === 'Sunday') return false;

  const currentHour = now.getHours();
  return currentHour >= start && currentHour < end;
};

interface DashboardClientProps {
  user: UserSession;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isPending, startTransition] = useTransition();

  // Profile Drawer state
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Quick Links modal state
  const [isQuickLinksOpen, setIsQuickLinksOpen] = useState(false);

  // Announcements Feed States
  const [announcements, setAnnouncements] = useState<FirestoreAnnouncement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateAnnouncementOpen, setIsCreateAnnouncementOpen] = useState(false);
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  // Explore Tab State
  const [selectedExploreCategory, setSelectedExploreCategory] = useState<string | null>(null);

  // Create Announcement Form States
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostDesc, setNewPostDesc] = useState('');
  const [newPostTarget, setNewPostTarget] = useState('All Students');
  const [newPostDate, setNewPostDate] = useState('');
  const [newPostTime, setNewPostTime] = useState('');
  const [newPostLoc, setNewPostLoc] = useState('');
  const [newPostPub, setNewPostPub] = useState('');
  const [newPostTheme, setNewPostTheme] = useState('sunset'); // sunset, ocean, pine, lavender

  // Marketplace States
  const [marketplaceItems, setMarketplaceItems] = useState<FirestoreMarketplaceItem[]>([]);
  const [isAddListingOpen, setIsAddListingOpen] = useState(false);
  const [newListingTitle, setNewListingTitle] = useState('');
  const [newListingDesc, setNewListingDesc] = useState('');
  const [newListingOriginalPrice, setNewListingOriginalPrice] = useState('');
  const [newListingSellingPrice, setNewListingSellingPrice] = useState('');
  const [newListingContact, setNewListingContact] = useState('');
  const [newListingImage, setNewListingImage] = useState('');
  const [newListingCategory, setNewListingCategory] = useState('Others');
  const [marketplaceSearchQuery, setMarketplaceSearchQuery] = useState('');
  const [selectedMarketplaceCategory, setSelectedMarketplaceCategory] = useState('all');

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  // Timetable Year/Section/Branch selection and submission states
  const [selectedYear, setSelectedYear] = useState('1st Year');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedBranch, setSelectedBranch] = useState('Computer Science & Engineering');
  const [approvedTimetables, setApprovedTimetables] = useState<ApprovedTimetable[]>([]);
  const [timetableSubmissions, setTimetableSubmissions] = useState<TimetableSubmission[]>([]);
  const [isUploadTimetableOpen, setIsUploadTimetableOpen] = useState(false);
  const [uploadTimetableYear, setUploadTimetableYear] = useState('1st Year');
  const [uploadTimetableSec, setUploadTimetableSec] = useState('A');
  const [uploadTimetableBranch, setUploadTimetableBranch] = useState('Computer Science & Engineering');
  const [uploadTimetableFile, setUploadTimetableFile] = useState('');
  const [uploadTimetableFileName, setUploadTimetableFileName] = useState('');
  const [isSubmittingTimetable, setIsSubmittingTimetable] = useState(false);
  const [timetableModalViewMode, setTimetableModalViewMode] = useState<'grid' | 'image'>('grid');

  // Feedback Suggestions and Achievements states
  const [userAchievements, setUserAchievements] = useState<{ pathfinderTier: number; isVisionary: boolean }>({ pathfinderTier: 0, isVisionary: false });
  const [feedbackSubmissions, setFeedbackSubmissions] = useState<FeedbackSubmission[]>([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isSuggestFormOpen, setIsSuggestFormOpen] = useState(false);

  // Clubs & Societies states
  const [approvedClubs, setApprovedClubs] = useState<Club[]>([]);
  const [clubSubmissions, setClubSubmissions] = useState<ClubSubmission[]>([]);
  const [isRegisterClubOpen, setIsRegisterClubOpen] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [newClubDesc, setNewClubDesc] = useState('');
  const [newClubCategory, setNewClubCategory] = useState('cultural');
  const [newClubContact, setNewClubContact] = useState('');
  const [newClubPresidentName, setNewClubPresidentName] = useState('');
  const [newClubPresidentEmail, setNewClubPresidentEmail] = useState('');
  const [newClubPresidentDesignation, setNewClubPresidentDesignation] = useState('President/Coordinator');
  const [newClubDomains, setNewClubDomains] = useState('');
  const [isSubmittingClub, setIsSubmittingClub] = useState(false);

  // Academic Files states
  const [isDevModeActive, setIsDevModeActive] = useState(false);
  const [reportedMessages, setReportedMessages] = useState<FirestoreMessage[]>([]);
  const [blockedWords, setBlockedWords] = useState<string[]>([]);
  const [newBadWord, setNewBadWord] = useState('');
  const [isSubmittingBadWord, setIsSubmittingBadWord] = useState(false);
  const [academicFiles, setAcademicFiles] = useState<AcademicFile[]>([]);
  const [activeAcademicTab, setActiveAcademicTab] = useState<AcademicTab>('syllabus');
  const [acadFilterYear, setAcadFilterYear] = useState('1st Year');
  const [acadFilterBranch, setAcadFilterBranch] = useState('Computer Science & Engineering');
  // Dev upload form state
  const [newFileTab, setNewFileTab] = useState<AcademicTab>('syllabus');
  const [newFileTitle, setNewFileTitle] = useState('');
  const [newFileSubject, setNewFileSubject] = useState('');
  const [newFileDesc, setNewFileDesc] = useState('');
  const [newFileYear, setNewFileYear] = useState('1st Year');
  const [newFileBranch, setNewFileBranch] = useState('All');
  const [newFileDriveLink, setNewFileDriveLink] = useState('');
  const [isSubmittingAcadFile, setIsSubmittingAcadFile] = useState(false);

  // Lost & Found States
  const [lostFoundItems, setLostFoundItems] = useState<FirestoreLostFoundItem[]>([]);
  const [selectedLostFoundFilter, setSelectedLostFoundFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [isReportLostFoundOpen, setIsReportLostFoundOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState<'lost' | 'found'>('lost');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemLocation, setNewItemLocation] = useState('');
  const [newItemDate, setNewItemDate] = useState('');
  const [newItemContact, setNewItemContact] = useState('');
  const [newItemImage, setNewItemImage] = useState('');

  // Report to CR Wizard States
  const [lostFoundSubView, setLostFoundSubView] = useState<'bulletin' | 'report_cr'>('bulletin');
  const [crStep, setCrStep] = useState<number>(1);
  const [selectedCrYear, setSelectedCrYear] = useState<string>('');
  const [selectedCrBranch, setSelectedCrBranch] = useState<string>('');
  const [selectedCrGender, setSelectedCrGender] = useState<'Boys' | 'Girls' | null>(null);
  const [selectedCrName, setSelectedCrName] = useState<string>('');
  const [selectedCrPhone, setSelectedCrPhone] = useState<string>('');
  const [crItemTitle, setCrItemTitle] = useState<string>('');
  const [crItemType, setCrItemType] = useState<'lost' | 'found'>('lost');
  const [crItemLocation, setCrItemLocation] = useState<string>('');
  const [crItemDate, setCrItemDate] = useState<string>('');
  const [crItemDesc, setCrItemDesc] = useState<string>('');
  const [crContactDetails, setCrContactDetails] = useState<string>('');
  const [crCompiledMessage, setCrCompiledMessage] = useState<string>('');

  // Chat / Communities Tab States
  const [chatRoomsList, setChatRoomsList] = useState<FirestoreChatroom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('chat-gen');
  const [chatMessages, setChatMessages] = useState<FirestoreMessage[]>([]);
  const [newMsgText, setNewMsgText] = useState<string>('');
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState<boolean>(true);

  // Timetable States
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState<boolean>(false);
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = weekdays[new Date().getDay()];
  const [selectedTimetableDay, setSelectedTimetableDay] = useState<string>(
    currentDayName === 'Saturday' || currentDayName === 'Sunday' ? 'Monday' : currentDayName
  );
  
  // Hostel details modal state
  const [activeHostelMenu, setActiveHostelMenu] = useState<string | null>(null);

  // Live timetable refresh tick
  const [timeTick, setTimeTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTick(t => t + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Chat end scroll reference
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  // Fetch chatrooms helper
  const loadChatrooms = async () => {
    try {
      const rooms = await fetchChatrooms();
      setChatRoomsList(rooms);
    } catch (err) {
      console.error('Failed to load chatrooms:', err);
    }
  };

  // Fetch messages helper
  const loadMessages = async (roomId: string) => {
    try {
      const msgs = await fetchMessages(roomId);
      setChatMessages(msgs);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [chatMessages, activeTab]);

  // Collapse sidebar on mobile initial load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsChatSidebarOpen(false);
    }
  }, []);

  // Polling for new messages
  useEffect(() => {
    if (activeTab !== 'chat') return;

    loadChatrooms();
    loadMessages(selectedRoomId);

    const interval = setInterval(() => {
      loadMessages(selectedRoomId);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeTab, selectedRoomId]);

  // Fetch lost & found items helper
  const loadLostFoundItems = async () => {
    try {
      const data = await fetchLostFoundItems();
      setLostFoundItems(data);
    } catch (err) {
      console.error('Failed to load lost & found items:', err);
    }
  };

  // Fetch announcements helper
  const loadAnnouncements = async () => {
    try {
      const data = await fetchAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    }
  };

  const loadMarketplaceItems = async () => {
    try {
      const data = await getMarketplaceItemsAction();
      setMarketplaceItems(data);
    } catch (err) {
      console.error('Failed to load marketplace items:', err);
    }
  };

  const loadTimetablesData = async () => {
    try {
      const approved = await fetchApprovedTimetables();
      setApprovedTimetables(approved);
      if (user.role === 'developer') {
        const subs = await fetchTimetableSubmissions();
        setTimetableSubmissions(subs);
      }
    } catch (err) {
      console.error('Failed to load timetables:', err);
    }
  };

  const loadUserAchievements = async () => {
    try {
      const ach = await fetchUserAchievementsAction(user.email);
      setUserAchievements(ach);
    } catch (err) {
      console.error('Failed to load achievements:', err);
    }
  };

  const loadFeedbackData = async () => {
    try {
      if (user.role === 'developer') {
        const subs = await fetchFeedbackSubmissionsAction();
        setFeedbackSubmissions(subs);
      }
    } catch (err) {
      console.error('Failed to load feedback submissions:', err);
    }
  };

  const loadClubsData = async () => {
    try {
      const approved = await fetchApprovedClubsAction();
      setApprovedClubs(approved);
      if (user.role === 'developer') {
        const subs = await fetchClubSubmissionsAction();
        setClubSubmissions(subs);
      }
    } catch (err) {
      console.error('Failed to load clubs data:', err);
    }
  };

  const loadAcademicFiles = async () => {
    try {
      const files = await fetchAllAcademicFilesAction();
      setAcademicFiles(files);
    } catch (err) {
      console.error('Failed to load academic files:', err);
    }
  };

  const loadReportedMessages = async () => {
    try {
      if (user.role === 'developer') {
        const data = await fetchReportedMessagesAction();
        setReportedMessages(data);
      }
    } catch (err) {
      console.error('Failed to load reported messages:', err);
    }
  };

  const loadBlockedWords = async () => {
    try {
      if (user.role === 'developer') {
        const words = await fetchBlockedWordsAction();
        setBlockedWords(words);
      }
    } catch (err) {
      console.error('Failed to load blocked words:', err);
    }
  };

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        await runSeedingAction();
        const [announcementsData, lostFoundData, marketplaceData, approvedData] = await Promise.all([
          fetchAnnouncements(),
          fetchLostFoundItems(),
          getMarketplaceItemsAction(),
          fetchApprovedTimetables()
        ]);
        if (active) {
          setAnnouncements(announcementsData);
          setLostFoundItems(lostFoundData);
          setMarketplaceItems(marketplaceData);
          setApprovedTimetables(approvedData);
          loadUserAchievements();
          loadFeedbackData();
          loadClubsData();
          loadAcademicFiles();
          loadReportedMessages();
          loadBlockedWords();
          if (user.role === 'developer') {
            const subs = await fetchTimetableSubmissions();
            setTimetableSubmissions(subs);
          }
        }
      } catch (err) {
        console.error('Failed to fetch data in effect:', err);
      }
    };
    loadData();
    return () => {
      active = false;
    };
  }, []);






  // Mess Menu State
  const hostels = ['Kailash Hostel', 'Himadri Hostel', 'Shivalik Hostel', 'Dhauladhar Hostel', 'Mani Mahesh Hostel'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Default to today's day of week
  const getTodayDay = () => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek[new Date().getDay()];
  };

  const [selectedHostel, setSelectedHostel] = useState<string>(user.hostel || 'Kailash Hostel');
  const [selectedDay, setSelectedDay] = useState<string>(getTodayDay());
  const [messMenu, setMessMenu] = useState<MessMenuData | null>(null);

  // Fetch mess menu when day or hostel changes
  useEffect(() => {
    startTransition(async () => {
      const data = await fetchMessMenu(selectedHostel, selectedDay);
      setMessMenu(data);
    });
  }, [selectedHostel, selectedDay]);

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  const menuItems = isDevModeActive
    ? [
        { id: 'dev_tools', label: 'Console 🛠️', icon: Sparkles, color: '#e76f51' },
        { id: 'dev_timetables', label: 'Timetables 📅', icon: Calendar, color: '#f4a261' },
        { id: 'dev_clubs', label: 'Clubs 🏆', icon: Contact, color: '#9b5de5' },
        { id: 'dev_files', label: 'Files 📚', icon: GraduationCap, color: '#3d5a80' },
        { id: 'dev_moderation', label: 'Moderation ⚖️', icon: ShieldAlert, color: '#e76f51' },
      ]
    : [
        { id: 'home', label: 'Home', icon: Home, color: 'var(--pine-primary)' },
        { id: 'feed', label: 'Feed', icon: Rss, color: '#3d5a80' },
        { id: 'explore', label: 'Explore', icon: BookOpen, color: '#f4a261' },
        { id: 'chat', label: 'Communities', icon: MessageSquare, color: '#9b5de5' },
      ];

  const getMealTime = (meal: string) => {
    switch (meal) {
      case 'breakfast': return '7:30 AM - 9:00 AM';
      case 'lunch': return '12:30 PM - 2:00 PM';
      case 'snacks': return '4:30 PM - 5:30 PM';
      case 'dinner': return '7:30 PM - 9:00 PM';
      default: return '';
    }
  };



  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div style={styles.dashboardHome} className="animate-fade-in">
            {/* Timetable Card - Replicating premium 9-square grid with live filling */}
            <div 
              style={{
                ...styles.messCard, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '10px',
                cursor: 'pointer',
                height: 'auto',
                minHeight: '410px'
              }} 
              className="glass-panel glass-panel-hover"
              onClick={() => {
                const hasCustom = approvedTimetables.some(t => {
                  if (selectedYear === '1st Year') {
                    return t.year === selectedYear && t.section === selectedSection;
                  } else {
                    return t.year === selectedYear && t.branch === selectedBranch && t.section === selectedSection;
                  }
                });
                if (hasCustom) {
                  setTimetableModalViewMode('image');
                } else {
                  setTimetableModalViewMode('grid');
                }
                setIsTimetableModalOpen(true);
              }}
            >
              <div style={styles.messHeader}>
                <div>
                  <h3 style={styles.messTitle}>Today&apos;s Classes</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {currentDayName === 'Saturday' || currentDayName === 'Sunday' 
                      ? 'Weekend Preview (Monday)' 
                      : `${currentDayName}, ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const hasCustom = approvedTimetables.some(t => {
                      if (selectedYear === '1st Year') {
                        return t.year === selectedYear && t.section === selectedSection;
                      } else {
                        return t.year === selectedYear && t.branch === selectedBranch && t.section === selectedSection;
                      }
                    });
                    if (hasCustom) {
                      setTimetableModalViewMode('image');
                    } else {
                      setTimetableModalViewMode('grid');
                    }
                    setIsTimetableModalOpen(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--pine-primary)',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>View Full Week</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Year & Section Selector Row */}
              <div 
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '4px',
                  marginBottom: '8px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <label style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-placeholder)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: '#ffffff',
                      color: 'var(--text-main)',
                      fontSize: '12px',
                      fontWeight: '700',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                {selectedYear !== '1st Year' && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <label style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-placeholder)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Branch</label>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: '#ffffff',
                        color: 'var(--text-main)',
                        fontSize: '12px',
                        fontWeight: '700',
                        outline: 'none',
                        cursor: 'pointer',
                        maxWidth: '120px'
                      }}
                    >
                      <option value="Computer Science & Engineering">Computer Science</option>
                      <option value="Electronics & Communication Engineering">ECE</option>
                      <option value="Electrical Engineering">Electrical</option>
                      <option value="Mechanical Engineering">Mechanical</option>
                      <option value="Civil Engineering">Civil</option>
                      <option value="Chemical Engineering">Chemical</option>
                      <option value="Material Science & Engineering">Materials</option>
                    </select>
                  </div>
                )}

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <label style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-placeholder)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Section</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: '#ffffff',
                      color: 'var(--text-main)',
                      fontSize: '12px',
                      fontWeight: '700',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(sec => (
                      <option key={sec} value={sec}>Section {sec}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(() => {
                const customTimetable = approvedTimetables.find(t => {
                  if (selectedYear === '1st Year') {
                    return t.year === selectedYear && t.section === selectedSection;
                  } else {
                    return t.year === selectedYear && t.branch === selectedBranch && t.section === selectedSection;
                  }
                });

                if (customTimetable) {
                  return (
                    <div 
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '14px',
                        borderRadius: '12px',
                        border: '1px dashed var(--pine-primary)',
                        backgroundColor: 'rgba(18, 91, 68, 0.02)',
                        textAlign: 'center',
                        marginTop: '4px'
                      }}
                    >
                      <div style={{ position: 'relative', width: '100%', height: '150px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                        <img 
                          src={customTimetable.file_data} 
                          alt="Timetable Thumbnail" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--pine-deep)' }}>
                        Official Timetable Active
                      </span>
                    </div>
                  );
                }

                const isMockPrefilled = selectedYear === '1st Year' && selectedSection === 'A';
                
                if (isMockPrefilled) {
                  const timeSlots = ['9-10', '10-11', '11-12', '12-1', '1-2', '2-3', '3-4', '4-5', '5-6'];
                  const activeDayName = (currentDayName === 'Saturday' || currentDayName === 'Sunday') ? 'Monday' : currentDayName;
                  const dayClasses = weeklyTimetable[activeDayName] || [];

                  const gridSlots = timeSlots.map(slotTime => {
                    const found = dayClasses.find(c => c.time === slotTime);
                    if (found) return found;
                    if (slotTime === '1-2') {
                      return { time: '1-2', subject: 'Lunch Break', code: 'LUNCH', room: 'Mess', isLunch: true };
                    }
                    return { time: slotTime, subject: 'Free Period', code: 'FREE', room: '-' };
                  });

                  return (
                    <div 
                      data-tick={timeTick}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '10px',
                        marginTop: '4px'
                      }}
                    >
                      {gridSlots.map((slot, idx) => {
                        const percent = getSlotFillPercentage(slot.time);
                        const isActive = isCurrentSlot(slot.time);
                        const isFree = slot.code === 'FREE';

                        let bgFill = '';
                        if (isFree) {
                          bgFill = `linear-gradient(to top, rgba(140, 140, 140, 0.18) ${percent}%, rgba(255, 255, 255, 0.45) ${percent}%)`;
                        } else if (slot.isLunch) {
                          bgFill = `linear-gradient(to top, rgba(244, 162, 97, 0.35) ${percent}%, rgba(244, 162, 97, 0.08) ${percent}%)`;
                        } else {
                          bgFill = `linear-gradient(to top, rgba(42, 157, 143, 0.35) ${percent}%, rgba(42, 157, 143, 0.08) ${percent}%)`;
                        }

                        return (
                          <div
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setTimetableModalViewMode('grid');
                              setIsTimetableModalOpen(true);
                            }}
                            style={{
                              aspectRatio: '1',
                              borderRadius: '12px',
                              padding: '10px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              background: bgFill,
                              border: isActive 
                                ? '2.5px solid var(--pine-primary)' 
                                : '1px solid var(--border-subtle)',
                              boxShadow: isActive ? '0 0 12px rgba(42, 157, 143, 0.35)' : 'none',
                              position: 'relative',
                              overflow: 'hidden',
                              transition: 'all 0.2s ease',
                              cursor: 'pointer'
                            }}
                            className="glass-panel-hover"
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                              <span style={{ fontSize: '9px', fontWeight: '800', color: slot.isLunch ? '#e76f51' : 'var(--pine-deep)' }}>
                                {slot.time}
                              </span>
                              {isActive && (
                                <span style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: '#e76f51',
                                  boxShadow: '0 0 6px #e76f51'
                                }} title="Current class hour" />
                              )}
                            </div>

                            <div style={{ margin: 'auto 0' }}>
                              <h4 style={{
                                fontSize: '11px',
                                fontWeight: '800',
                                color: isFree ? 'var(--text-muted)' : 'var(--text-main)',
                                margin: 0,
                                lineHeight: '1.2',
                                textAlign: 'center',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {slot.subject}
                              </h4>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '8px', color: 'var(--text-muted)' }}>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '55%' }}>
                                {slot.code}
                              </span>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '45%' }}>
                                {slot.room}
                              </span>
                            </div>

                            {isActive && percent > 0 && percent < 100 && (
                              <div style={{
                                position: 'absolute',
                                bottom: '2px',
                                right: '4px',
                                fontSize: '8px',
                                color: 'var(--pine-deep)',
                                fontWeight: '900',
                                backgroundColor: 'rgba(255, 255, 255, 0.75)',
                                padding: '1px 3px',
                                borderRadius: '3px'
                              }}>
                                {percent}%
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                const selectionLabel = selectedYear === '1st Year' 
                  ? `Section ${selectedSection}` 
                  : selectedBranch;

                return (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '30px 16px',
                      borderRadius: '12px',
                      border: '1px dashed var(--border-subtle)',
                      backgroundColor: 'rgba(0,0,0,0.01)',
                      textAlign: 'center',
                      marginTop: '4px',
                      flex: 1,
                      justifyContent: 'center'
                    }}
                  >
                    <BookOpen size={32} style={{ color: 'var(--text-placeholder)', opacity: 0.7 }} />
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                        Timetable Not Available
                      </h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: '1.4' }}>
                        Timetable for {selectedYear} - {selectionLabel} has not been uploaded yet.
                      </p>
                    </div>
                    {user.role !== 'guest' && (
                      <button
                        onClick={() => {
                          setUploadTimetableYear(selectedYear);
                          setUploadTimetableSec(selectedSection);
                          setUploadTimetableBranch(selectedYear !== '1st Year' ? selectedBranch : '');
                          setUploadTimetableFile('');
                          setUploadTimetableFileName('');
                          setIsUploadTimetableOpen(true);
                        }}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '11px', fontWeight: '700' }}
                      >
                        Upload Timetable
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* My QR Banner - Replicating screenshot */}
            <div 
              style={styles.qrBanner} 
              onClick={() => setActiveTab('chat')}
              className="glass-panel-hover"
            >
              <div style={styles.qrBannerGlow} />
              <div style={styles.qrBannerText}>
                <h3 style={styles.qrBannerTitle}>Connect+</h3>
                <p style={styles.qrBannerSubtitle}>Connect, discuss and hang out</p>
              </div>
              <div style={styles.qrBannerIconBg}>
                <MessageSquare size={40} color="#ffffff" style={{ opacity: 0.95 }} />
              </div>
            </div>

            {/* Academics Banner */}
            <div 
              style={{
                background: 'linear-gradient(135deg, #3d5a80 0%, #5e60ce 100%)',
                borderRadius: 'var(--radius-md)',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                color: '#ffffff',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 6px 20px rgba(61, 90, 128, 0.2)',
              }}
              onClick={() => setActiveTab('academics')}
              className="glass-panel-hover"
            >
              <div style={styles.qrBannerGlow} />
              <div style={styles.qrBannerText}>
                <h3 style={styles.qrBannerTitle}>Academics</h3>
                <p style={styles.qrBannerSubtitle}>Timetables, syllabus & resources</p>
              </div>
              <div style={styles.qrBannerIconBg}>
                <BookOpen size={40} color="#ffffff" style={{ opacity: 0.95 }} />
              </div>
            </div>

            {/* Services Section - Replicating screenshot */}
            <div style={styles.servicesSection}>
              <h3 style={styles.servicesHeader}>Services</h3>
              <div style={styles.servicesGrid}>
                {/* Buy & Sell */}
                <div 
                  style={styles.serviceCard} 
                  className="glass-panel glass-panel-hover"
                  onClick={() => {
                    setActiveTab('marketplace');
                  }}
                >
                  <div style={styles.serviceCardText}>
                    <h4 style={styles.serviceCardTitle}>Buy & Sell</h4>
                    <p style={styles.serviceCardDesc}>Deals made easy</p>
                    <span style={styles.newBadge}>New!</span>
                  </div>
                  <div style={styles.serviceCardIllustration}>
                    <ShoppingBag size={42} color="var(--pine-primary)" />
                  </div>
                </div>

                {/* Lost & Found */}
                <div 
                  style={styles.serviceCard} 
                  className="glass-panel glass-panel-hover"
                  onClick={() => setActiveTab('lostfound')}
                >
                  <div style={styles.serviceCardText}>
                    <h4 style={styles.serviceCardTitle}>Lost & Found</h4>
                    <p style={styles.serviceCardDesc}>Recover belongings</p>
                  </div>
                  <div style={styles.serviceCardIllustration}>
                    <Search size={42} color="var(--aqua-primary)" />
                  </div>
                </div>

                {/* Blogs */}
                <div 
                  style={styles.serviceCard} 
                  className="glass-panel glass-panel-hover"
                  onClick={() => setActiveTab('explore')}
                >
                  <div style={styles.serviceCardText}>
                    <h4 style={styles.serviceCardTitle}>Student Blogs</h4>
                    <p style={styles.serviceCardDesc}>Campus updates</p>
                  </div>
                  <div style={styles.serviceCardIllustration}>
                    <BookOpen size={42} color="#f4a261" />
                  </div>
                </div>

                {/* Quick Links */}
                <div 
                  style={styles.serviceCard} 
                  className="glass-panel glass-panel-hover"
                  onClick={() => setIsQuickLinksOpen(true)}
                >
                  <div style={styles.serviceCardText}>
                    <h4 style={styles.serviceCardTitle}>Quick Links</h4>
                    <p style={styles.serviceCardDesc}>Useful campus portals</p>
                  </div>
                  <div style={styles.serviceCardIllustration}>
                    <ExternalLink size={42} color="var(--pine-primary)" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'feed': {
        const filteredAnnouncements = announcements.filter(ann => {
          if (!ann) return false;
          const isApproved = ann.approved !== false;
          const title = ann.title || '';
          const desc = ann.description || '';
          const pub = ann.publisher || '';
          const matchesQuery = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               pub.toLowerCase().includes(searchQuery.toLowerCase());
          return isApproved && matchesQuery;
        });

        const handleLike = async (id: string) => {
          const success = await toggleLikeAnnouncement(id, user.id);
          if (success) {
            loadAnnouncements();
          }
        };

        const handleCommentSubmit = async (postId: string) => {
          if (!newCommentText.trim()) return;
          const success = await commentAnnouncement(postId, user.id, user.name, newCommentText);
          if (success) {
            setNewCommentText('');
            loadAnnouncements();
          }
        };

        return (
          <div style={styles.feedTabContainer} className="animate-fade-in">
            {/* Feed Header */}
            <div style={styles.feedHeaderRow}>
              <div>
                <h2 style={styles.feedHeading}>Campus Announcements</h2>
                <p style={styles.feedSubheading}>Events, fests, and updates from official bodies</p>
              </div>
              <button 
                onClick={() => setIsCreateAnnouncementOpen(true)}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} />
                <span>Publish</span>
              </button>
            </div>

            {/* Search Bar */}
            <div style={styles.searchBarContainer} className="glass-panel">
              <Search size={18} color="var(--text-placeholder)" style={{ marginLeft: 12 }} />
              <input 
                type="text" 
                placeholder="Search announcements, publishers, events..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {/* Announcements Feed Stack */}
            <div style={styles.feedStack}>
              {filteredAnnouncements.length === 0 ? (
                <div style={styles.emptyFeedState} className="glass-panel">
                  <Sparkles size={36} color="var(--text-placeholder)" style={{ marginBottom: 12 }} />
                  <p>No events or announcements found matching your query.</p>
                </div>
              ) : (
                filteredAnnouncements.map((ann) => {
                  const hasLiked = ann.likes?.includes(user.id);
                  const isCommentsOpen = expandedCommentsPostId === ann.id;
                  
                  // Setup custom gradient for each style
                  let bannerStyle = styles.sunsetGradientBanner;
                  if (ann.gradient_theme === 'ocean') bannerStyle = styles.oceanGradientBanner;
                  if (ann.gradient_theme === 'pine') bannerStyle = styles.pineGradientBanner;
                  if (ann.gradient_theme === 'lavender') bannerStyle = styles.lavenderGradientBanner;

                  return (
                    <div key={ann.id} style={styles.feedCard} className="glass-panel">
                      {/* Banner Poster */}
                      <div style={{ ...styles.feedBanner, ...bannerStyle }}>
                        {/* Title overlay inside poster */}
                        <div style={styles.bannerLogoText}>
                          <Mountain size={16} style={{ marginRight: 6 }} />
                          <span>NIT HAMIRPUR</span>
                        </div>
                        <h3 style={styles.bannerEventTitle}>{ann.title}</h3>
                        <p style={styles.bannerEventMeta}>
                          {ann.event_date} • {ann.event_time}
                        </p>
                        
                        {/* Target Audience Badge */}
                        <div style={styles.bannerTargetBadge}>
                          {ann.target_audience}
                        </div>
                      </div>

                      {/* Header/Publisher details */}
                      <div style={styles.feedCardHeader}>
                        <div style={styles.publisherInfo}>
                          <div style={styles.publisherAvatar}>
                            {ann.publisher?.charAt(0)}
                          </div>
                          <div>
                            <div style={styles.publisherName}>{ann.publisher}</div>
                            <div style={styles.eventTimeBadge}>
                              <Calendar size={10} style={{ marginRight: 4 }} />
                              <span>{ann.event_date} | {ann.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Body Description */}
                      <div style={styles.feedCardBody}>
                        <h4 style={styles.feedCardEventTitle}>{ann.title}</h4>
                        <p style={styles.feedCardDescription}>{ann.description}</p>
                        
                        {/* Detail Info Block */}
                        <div style={styles.eventDetailInfoBlock}>
                          <div style={styles.eventDetailInfoItem}>
                            <MapPin size={12} color="var(--pine-primary)" />
                            <span><strong>Venue:</strong> {ann.location}</span>
                          </div>
                          <div style={styles.eventDetailInfoItem}>
                            <Calendar size={12} color="var(--pine-primary)" />
                            <span><strong>Time:</strong> {ann.event_time}</span>
                          </div>
                        </div>
                      </div>

                      {/* Interaction Bar */}
                      <div style={styles.feedCardFooter}>
                        <button 
                          onClick={() => handleLike(ann.id!)}
                          style={{
                            ...styles.interactionBtn,
                            color: hasLiked ? '#e76f51' : 'var(--text-muted)'
                          }}
                        >
                          <Heart size={16} fill={hasLiked ? '#e76f51' : 'transparent'} />
                          <span>{ann.likes?.length || 0} Likes</span>
                        </button>

                        <button 
                          onClick={() => setExpandedCommentsPostId(isCommentsOpen ? null : ann.id!)}
                          style={{
                            ...styles.interactionBtn,
                            color: isCommentsOpen ? 'var(--pine-primary)' : 'var(--text-muted)'
                          }}
                        >
                          <MessageSquare size={16} />
                          <span>{ann.comments?.length || 0} Comments</span>
                        </button>
                      </div>

                      {/* Comments Drawer Expansion */}
                      {isCommentsOpen && (
                        <div style={styles.commentsSection}>
                          {/* Comments List */}
                          <div style={styles.commentsList}>
                            {(!ann.comments || ann.comments.length === 0) ? (
                              <p style={styles.noCommentsText}>No comments yet. Be the first to share your thoughts!</p>
                            ) : (
                              ann.comments.map((comment: FirestoreComment) => (
                                <div key={comment.id} style={styles.commentItem}>
                                  <div style={styles.commentHeader}>
                                    <span style={styles.commentAuthor}>{comment.user_name}</span>
                                    <span style={styles.commentDate}>
                                      {new Date(comment.created_at).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                  <p style={styles.commentText}>{comment.text}</p>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Comment Input */}
                          <div style={styles.commentInputRow}>
                            <input 
                              type="text" 
                              placeholder="Write a comment..." 
                              value={newCommentText}
                              onChange={(e) => setNewCommentText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCommentSubmit(ann.id!);
                              }}
                              style={styles.commentInput}
                            />
                            <button 
                              onClick={() => handleCommentSubmit(ann.id!)}
                              className="btn-primary"
                              style={{ padding: '8px 16px', fontSize: '12px' }}
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      }
      case 'explore': {
        const exploreCategories = [
          { id: 'clubs_societies', title: 'Clubs & Societies', image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&q=80', subtitle: 'Cultural, Literary & Hobby Clubs' },
          { id: 'tech', title: 'Tech', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80', subtitle: 'Coding, Electronics & Robos' },
        ];

        const renderCategoryDetails = () => {
          switch (selectedExploreCategory) {
            case 'tech': {
              const filteredTechClubs = approvedClubs.filter(c => c.category === 'technical');
              return (
                <div style={styles.exploreSubpage}>
                  <div style={{ ...styles.subpageHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h3 style={styles.subpageTitle}>Technical Clubs & Societies</h3>
                      <p style={styles.subpageDesc}>Code, innovate, and build systems at NITH</p>
                    </div>
                    {user.role !== 'guest' && (
                      <button
                        onClick={() => {
                          setNewClubCategory('technical');
                          setIsRegisterClubOpen(true);
                        }}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '11px', fontWeight: '800' }}
                      >
                        Register a Tech Club
                      </button>
                    )}
                  </div>

                  {filteredTechClubs.length === 0 ? (
                    <div 
                      className="glass-panel animate-fade-in" 
                      style={{ 
                        padding: '40px 24px', 
                        textAlign: 'center', 
                        borderRadius: '12px', 
                        border: '2px dashed var(--border-subtle)', 
                        marginTop: '16px',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <Sparkles size={40} color="var(--pine-primary)" style={{ marginBottom: '12px', opacity: 0.8, marginLeft: 'auto', marginRight: 'auto' }} />
                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--pine-deep)', margin: '0 0 6px' }}>No Tech Clubs Registered</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
                        Be the first to list your technical or coding club on NITH Connect!
                      </p>
                      {user.role !== 'guest' && (
                        <button
                          onClick={() => {
                            setNewClubCategory('technical');
                            setIsRegisterClubOpen(true);
                          }}
                          className="btn-primary"
                          style={{ padding: '8px 16px', fontSize: '11px', fontWeight: '800' }}
                        >
                          Submit Registration Request
                        </button>
                      )}
                    </div>
                  ) : (
                    <div style={styles.subpageList}>
                      {filteredTechClubs.map((club) => (
                        <div key={club.id || club.name} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', borderRadius: '12px', border: '1px solid var(--border-subtle)', backgroundColor: '#ffffff' }}>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>{club.name}</h4>
                          <p style={{ margin: '4px 0', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{club.desc}</p>
                          
                          {club.domains && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '4px 0' }}>
                              {club.domains.split(',').map((d, idx) => (
                                <span key={idx} style={{ fontSize: '9px', backgroundColor: 'rgba(42,157,143,0.1)', color: 'var(--pine-primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                                  {d.trim()}
                                </span>
                              ))}
                            </div>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                            <div>
                              <strong>{club.president_designation || 'President'}:</strong> {club.president_name}
                            </div>
                            <a href={club.contact.startsWith('http') ? club.contact : `mailto:${club.contact}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pine-primary)', fontWeight: '800', textDecoration: 'none' }}>
                              Contact / Social
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            case 'clubs_societies': {
              const filteredClubs = approvedClubs.filter(c => c.category !== 'technical');
              return (
                <div style={styles.exploreSubpage}>
                  <div style={{ ...styles.subpageHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h3 style={styles.subpageTitle}>Clubs & Societies</h3>
                      <p style={styles.subpageDesc}>Explore cultural, literary, arts, and student groups at NITH</p>
                    </div>
                    {user.role !== 'guest' && (
                      <button
                        onClick={() => {
                          setNewClubCategory('cultural');
                          setIsRegisterClubOpen(true);
                        }}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '11px', fontWeight: '800' }}
                      >
                        Register a Club
                      </button>
                    )}
                  </div>
                  
                  {filteredClubs.length === 0 ? (
                    <div 
                      className="glass-panel animate-fade-in" 
                      style={{ 
                        padding: '40px 24px', 
                        textAlign: 'center', 
                        borderRadius: '12px', 
                        border: '2px dashed var(--border-subtle)', 
                        marginTop: '16px',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <Sparkles size={40} color="var(--pine-primary)" style={{ marginBottom: '12px', opacity: 0.8, marginLeft: 'auto', marginRight: 'auto' }} />
                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--pine-deep)', margin: '0 0 6px' }}>No Clubs Registered</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
                        Be the first to list your cultural, literary, or hobby society on NITH Connect!
                      </p>
                      {user.role !== 'guest' && (
                        <button
                          onClick={() => {
                            setNewClubCategory('cultural');
                            setIsRegisterClubOpen(true);
                          }}
                          className="btn-primary"
                          style={{ padding: '8px 16px', fontSize: '11px', fontWeight: '800' }}
                        >
                          Submit Registration Request
                        </button>
                      )}
                    </div>
                  ) : (
                    <div style={styles.subpageList}>
                      {filteredClubs.map((club) => (
                        <div key={club.id || club.name} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', borderRadius: '12px', border: '1px solid var(--border-subtle)', backgroundColor: '#ffffff' }}>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>{club.name}</h4>
                          <p style={{ margin: '4px 0', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{club.desc}</p>
                          
                          {club.domains && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '4px 0' }}>
                              {club.domains.split(',').map((d, idx) => (
                                <span key={idx} style={{ fontSize: '9px', backgroundColor: 'rgba(42,157,143,0.1)', color: 'var(--pine-primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                                  {d.trim()}
                                </span>
                              ))}
                            </div>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                            <div>
                              <strong>{club.president_designation || 'President'}:</strong> {club.president_name}
                            </div>
                            <a href={club.contact.startsWith('http') ? club.contact : `mailto:${club.contact}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pine-primary)', fontWeight: '800', textDecoration: 'none' }}>
                              Contact / Social
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            default:
              return null;
          }
        };

        return (
          <div style={styles.exploreTabContainer} className="animate-fade-in">
            {selectedExploreCategory ? (
              <div>
                <button 
                  onClick={() => setSelectedExploreCategory(null)}
                  className="btn-secondary"
                  style={{ marginBottom: '20px', padding: '8px 16px', fontSize: '13px' }}
                >
                  ← Back to Explore
                </button>
                {renderCategoryDetails()}
              </div>
            ) : (
              <div>
                {/* Explore Title (screenshot style) */}
                <div style={styles.exploreHeaderSection}>
                  <h2 style={styles.exploreTitle}>Explore <span style={{ color: 'var(--pine-primary)' }}>NITH</span></h2>
                  <p style={styles.exploreSubtitle}>Discover Your Campus</p>
                </div>

                {/* Explore Search Bar */}
                <div style={{ ...styles.searchBarContainer, marginBottom: '28px' }} className="glass-panel">
                  <Search size={18} color="var(--text-placeholder)" style={{ marginLeft: 12 }} />
                  <input 
                    type="text" 
                    placeholder="Search clubs, events, users..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>

                {/* Categories Grid (screenshot 2-column grid layout) */}
                <div style={styles.exploreGrid}>
                  {exploreCategories
                    .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedExploreCategory(cat.id)}
                        style={{
                          ...styles.exploreCard,
                          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%), url(${cat.image})`,
                        }}
                        className="glass-panel-hover"
                      >
                        <div style={styles.exploreCardContent}>
                          <h3 style={styles.exploreCardTitle}>{cat.title}</h3>
                          <p style={styles.exploreCardSubtitle}>{cat.subtitle}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        );
      }
      case 'marketplace': {
        const filteredItems = marketplaceItems.filter(item => {
          if (!item) return false;
          const title = item.title || '';
          const desc = item.description || '';
          const matchesSearch = title.toLowerCase().includes(marketplaceSearchQuery.toLowerCase()) ||
                               desc.toLowerCase().includes(marketplaceSearchQuery.toLowerCase());
          const matchesCategory = selectedMarketplaceCategory === 'all' || item.category === selectedMarketplaceCategory;
          return matchesSearch && matchesCategory;
        });

        const handleMarkAsSold = async (itemId: string) => {
          const success = await updateMarketplaceItemStatusAction(itemId, 'sold');
          if (success) {
            showToast('Item marked as SOLD.', 'success');
            loadMarketplaceItems();
          } else {
            showToast('Failed to update status.', 'error');
          }
        };

        return (
          <div style={styles.exploreTabContainer} className="animate-fade-in">
            {/* Header section */}
            <div style={styles.exploreHeaderSection}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={styles.exploreTitle}>Campus <span style={{ color: 'var(--pine-primary)' }}>Marketplace</span> 🛒</h2>
                  <p style={styles.exploreSubtitle}>Buy and sell items directly within the NITH student community</p>
                </div>
                <button 
                  onClick={() => setIsAddListingOpen(true)}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', fontWeight: '700' }}
                >
                  <Plus size={16} />
                  <span>List an Item</span>
                </button>
              </div>
            </div>

            {/* Filters Bar */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '20px',
              marginBottom: '20px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              {/* Search */}
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={marketplaceSearchQuery}
                  onChange={(e) => setMarketplaceSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 16px 10px 38px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: '#ffffff',
                    color: 'var(--text-main)',
                    fontSize: '13px'
                  }}
                />
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
              </div>

              {/* Category selector */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
                {['all', 'Books', 'Electronics', 'Cycle', 'Hostel Gear', 'Others'].map((cat) => {
                  const isSelected = selectedMarketplaceCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedMarketplaceCategory(cat)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: isSelected ? 'var(--pine-primary)' : 'transparent',
                        color: isSelected ? '#ffffff' : 'var(--text-main)',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {cat === 'all' ? 'All Items' : cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid display */}
            {filteredItems.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }} className="glass-panel">
                <ShoppingBag size={48} style={{ opacity: 0.5, marginBottom: '12px' }} />
                <p>No listings found in the marketplace.</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>Be the first to list a textbook, cycle, or electronic item!</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '20px',
                marginTop: '10px'
              }}>
                {filteredItems.map((item) => {
                  const discount = item.original_price > item.selling_price
                    ? Math.round(((item.original_price - item.selling_price) / item.original_price) * 100)
                    : 0;
                  const isSold = item.status === 'sold';
                  const isOwner = item.user_id === user.id;

                  // Clean contact number for WhatsApp Link formatting
                  const phoneNum = item.contact_number || '';
                  const cleanPhone = phoneNum.replace(/\D/g, '');
                  const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                  const sellerName = item.user_name || 'Seller';
                  const itemTitle = item.title || 'Item';
                  const waUrl = `https://wa.me/${waPhone}?text=Hi%20${encodeURIComponent(sellerName)},%20I%20am%20interested%20in%20your%20listing%20"${encodeURIComponent(itemTitle)}"%20on%20NITH%20Connect.`;

                  return (
                    <div 
                      key={item.id}
                      style={{
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: '#ffffff',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        opacity: isSold ? 0.75 : 1,
                        transition: 'transform 0.2s'
                      }}
                      className="glass-panel glass-panel-hover"
                    >
                      {/* Product Image */}
                      <div style={{ height: '160px', width: '100%', position: 'relative', backgroundColor: 'rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: 'var(--text-muted)' }}>
                            <ShoppingBag size={36} style={{ opacity: 0.4 }} />
                          </div>
                        )}

                        {/* Category tag */}
                        <span style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          backgroundColor: 'rgba(255,255,255,0.85)',
                          color: 'var(--pine-deep)',
                          fontSize: '10px',
                          fontWeight: '800',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                          {item.category}
                        </span>

                        {/* Discount Badge */}
                        {discount > 0 && !isSold && (
                          <span style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            backgroundColor: '#e76f51',
                            color: '#ffffff',
                            fontSize: '10px',
                            fontWeight: '900',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}>
                            {discount}% OFF
                          </span>
                        )}

                        {/* Sold overlay text */}
                        {isSold && (
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0,0,0,0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontWeight: '900',
                            fontSize: '16px',
                            letterSpacing: '1px'
                          }}>
                            SOLD
                          </div>
                        )}
                      </div>

                      {/* Product Content Details */}
                      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', margin: 0, lineHeight: '1.3' }}>
                          {item.title}
                        </h4>
                        
                        {/* Price Block */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                          <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--pine-primary)' }}>
                            ₹{item.selling_price}
                          </span>
                          {item.original_price > item.selling_price && (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                              ₹{item.original_price}
                            </span>
                          )}
                        </div>

                        <p style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          margin: '4px 0 0',
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          flex: 1
                        }}>
                          {item.description}
                        </p>

                        <div style={{
                          borderTop: '1px solid var(--border-subtle)',
                          paddingTop: '10px',
                          marginTop: '6px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            Seller: <strong>{item.user_name}</strong>
                          </span>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            {/* WhatsApp Direct Chat Button */}
                            {!isSold && (
                              <a 
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary"
                                style={{
                                  flex: 1,
                                  padding: '8px 10px',
                                  fontSize: '12px',
                                  backgroundColor: '#25D366',
                                  borderColor: '#25D366',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px',
                                  textDecoration: 'none',
                                  fontWeight: 'bold',
                                  borderRadius: '6px'
                                }}
                              >
                                <MessageSquare size={14} />
                                <span>WhatsApp Seller</span>
                              </a>
                            )}

                            {/* Mark as sold option for seller owners */}
                            {isOwner && !isSold && (
                              <button
                                onClick={() => handleMarkAsSold(item.id!)}
                                className="btn-secondary"
                                style={{
                                  padding: '8px 10px',
                                  fontSize: '11px',
                                  flexShrink: 0
                                }}
                              >
                                Mark Sold
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }
      case 'lostfound': {
        const branches = [
          { id: 'cse', name: 'Computer Science (CSE)' },
          { id: 'ece', name: 'Electronics & Communication (ECE)' },
          { id: 'ee', name: 'Electrical Engineering (EE)' },
          { id: 'me', name: 'Mechanical Engineering (ME)' },
          { id: 'ce', name: 'Civil Engineering (CE)' },
          { id: 'chemical', name: 'Chemical Engineering' },
          { id: 'material', name: 'Material Science' },
          { id: 'architecture', name: 'Architecture (B.Arch)' },
        ];

        const getCRContact = (year: string, branch: string, gender: 'Boys' | 'Girls') => {
          const key = `${year}-${branch}-${gender}`.toLowerCase();
          let hash = 0;
          for (let i = 0; i < key.length; i++) {
            hash = key.charCodeAt(i) + ((hash << 5) - hash);
          }
          const phoneSuffix = Math.abs(hash % 90000) + 10000;
          const mockPhone = `+9198160${phoneSuffix}`;
          const crName = `${gender === 'Boys' ? 'Amit' : 'Neha'} ${branch.toUpperCase()} (${year})`;
          return { name: crName, phone: mockPhone };
        };

        if (lostFoundSubView === 'report_cr') {
          const activeContact = selectedCrYear && selectedCrBranch && selectedCrGender
            ? getCRContact(selectedCrYear, selectedCrBranch, selectedCrGender)
            : null;

          const handleCrNextStep = () => {
            if (crStep === 4) {
              if (!crItemTitle || !crItemLocation || !crContactDetails) {
                showToast('Please fill in all required fields.', 'error');
                return;
              }
              const crNameStr = activeContact ? activeContact.name : 'CR';
              const formattedMsg = `Hello ${crNameStr},\n\nI hope you are doing well.\n\nCould you please share this lost/found notice in the official class/hostel WhatsApp groups?\n\nItem: ${crItemTitle}\nStatus: ${crItemType === 'lost' ? 'LOST 🔴' : 'FOUND 🟢'}\nLocation: ${crItemLocation}\nDate: ${crItemDate || 'N/A'}\nDescription: ${crItemDesc || 'N/A'}\nContact: ${crContactDetails}\n\nThank you for your assistance!\n\nRegards,\n${user.name}`;
              setCrCompiledMessage(formattedMsg);
            }
            setCrStep(crStep + 1);
          };

          return (
            <div style={styles.exploreTabContainer} className="animate-fade-in">
              <button 
                onClick={() => setLostFoundSubView('bulletin')}
                className="btn-secondary"
                style={{ marginBottom: '20px', padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>← Back to Bulletin</span>
              </button>

              <div style={styles.exploreHeaderSection}>
                <h2 style={styles.exploreTitle}>Report to <span style={{ color: '#25d366' }}>CR</span></h2>
                <p style={styles.exploreSubtitle}>Broadcast lost/found items to class WhatsApp groups</p>
              </div>

              {/* Progress Steps Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-input)', padding: '12px 18px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  { step: 1, label: 'Year' },
                  { step: 2, label: 'Branch' },
                  { step: 3, label: 'CR Contact' },
                  { step: 4, label: 'Details' },
                  { step: 5, label: 'Review & Send' },
                ].map((s) => {
                  const isCurrent = crStep === s.step;
                  const isPassed = crStep > s.step;
                  return (
                    <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          fontSize: '11px',
                          fontWeight: '700',
                          backgroundColor: isCurrent ? '#25d366' : isPassed ? 'var(--pine-primary)' : 'var(--border-subtle)',
                          color: isCurrent || isPassed ? '#ffffff' : 'var(--text-muted)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {s.step}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: isCurrent ? '700' : '400', color: isCurrent ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {s.label}
                      </span>
                      {s.step < 5 && <span style={{ color: 'var(--text-muted)', margin: '0 4px', fontSize: '10px' }}>➔</span>}
                    </div>
                  );
                })}
              </div>

              {/* Step 1: Select Year */}
              {crStep === 1 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--pine-deep)' }}>Select Academic Year:</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                    {['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'].map((year) => (
                      <button
                        key={year}
                        onClick={() => {
                          setSelectedCrYear(year);
                          setCrStep(2);
                        }}
                        className="glass-panel glass-panel-hover"
                        style={{
                          padding: '24px',
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: '#ffffff',
                          cursor: 'pointer',
                          fontSize: '16px',
                          fontWeight: '700',
                          color: 'var(--pine-deep)',
                          textAlign: 'center',
                        }}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Select Branch */}
              {crStep === 2 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--pine-deep)' }}>Select Batch / Branch ({selectedCrYear}):</h3>
                    <button onClick={() => setCrStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}>
                      ← Change Year
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                    {branches.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          setSelectedCrBranch(b.id);
                          setCrStep(3);
                        }}
                        className="glass-panel glass-panel-hover"
                        style={{
                          padding: '18px',
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: '#ffffff',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'var(--pine-deep)',
                          textAlign: 'left',
                        }}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Select Representative Type */}
              {crStep === 3 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--pine-deep)' }}>Select CR Representative ({selectedCrYear} - {selectedCrBranch.toUpperCase()}):</h3>
                    <button onClick={() => setCrStep(2)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}>
                      ← Change Branch
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                    {(['Boys', 'Girls'] as const).map((gender) => {
                      const contact = getCRContact(selectedCrYear, selectedCrBranch, gender);
                      return (
                        <div
                          key={gender}
                          onClick={() => {
                            setSelectedCrGender(gender);
                            setSelectedCrName(contact.name);
                            setSelectedCrPhone(contact.phone);
                            setCrStep(4);
                          }}
                          className="glass-panel glass-panel-hover"
                          style={{
                            padding: '24px',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border-subtle)',
                            backgroundColor: '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                          }}
                        >
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            color: gender === 'Boys' ? '#3b82f6' : '#ec4899',
                            backgroundColor: gender === 'Boys' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(236, 72, 153, 0.1)',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            alignSelf: 'flex-start',
                          }}>
                            {gender} CR
                          </span>
                          <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--pine-deep)', margin: '4px 0 2px' }}>{contact.name}</h4>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>WhatsApp: {contact.phone}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 4: Fill Item Details */}
              {crStep === 4 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '580px', margin: '0 auto', width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--pine-deep)' }}>Enter Lost/Found Details:</h3>
                    <button onClick={() => setCrStep(3)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}>
                      ← Change CR
                    </button>
                  </div>

                  <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={styles.formLabel}>Item Name *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Black leather wallet, keys..." 
                        value={crItemTitle} 
                        onChange={(e) => setCrItemTitle(e.target.value)} 
                        style={styles.formInput} 
                      />
                    </div>

                    <div>
                      <label style={styles.formLabel}>Report Type *</label>
                      <select 
                        value={crItemType} 
                        onChange={(e) => setCrItemType(e.target.value as 'lost' | 'found')} 
                        style={styles.formInput}
                      >
                        <option value="lost">Lost Item</option>
                        <option value="found">Found Item</option>
                      </select>
                    </div>

                    <div>
                      <label style={styles.formLabel}>Description *</label>
                      <textarea 
                        required
                        placeholder="Describe the item (color, contents, identifying marks)..." 
                        value={crItemDesc} 
                        onChange={(e) => setCrItemDesc(e.target.value)} 
                        style={{ ...styles.formInput, minHeight: '80px', resize: 'vertical' }} 
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={styles.formLabel}>Location *</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Audi Hall, library..." 
                          value={crItemLocation} 
                          onChange={(e) => setCrItemLocation(e.target.value)} 
                          style={styles.formInput} 
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={styles.formLabel}>Date *</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. 30 Jun, Yesterday..." 
                          value={crItemDate} 
                          onChange={(e) => setCrItemDate(e.target.value)} 
                          style={styles.formInput} 
                        />
                      </div>
                    </div>

                    <div>
                      <label style={styles.formLabel}>Your Contact Details *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Phone number or email..." 
                        value={crContactDetails} 
                        onChange={(e) => setCrContactDetails(e.target.value)} 
                        style={styles.formInput} 
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                      <button 
                        onClick={handleCrNextStep}
                        className="btn-primary" 
                        style={{ flex: 1, padding: '12px', backgroundColor: 'var(--aqua-primary)' }}
                      >
                        Next: Review Message
                      </button>
                      <button type="button" onClick={() => setCrStep(3)} className="btn-secondary" style={{ flex: 1, padding: '12px' }}>
                        Back
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review & Edit Compiled Message */}
              {crStep === 5 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '580px', margin: '0 auto', width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--pine-deep)' }}>Review & Edit WhatsApp Message:</h3>
                    <button onClick={() => setCrStep(4)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}>
                      ← Edit Details
                    </button>
                  </div>

                  <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '10px 14px', borderRadius: '6px', backgroundColor: 'var(--bg-input)', borderLeft: '4px solid #25d366', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <strong>Recipient:</strong> {selectedCrName} ({selectedCrPhone})
                    </div>

                    <div>
                      <label style={styles.formLabel}>Compiled Message (You can edit it below):</label>
                      <textarea
                        value={crCompiledMessage}
                        onChange={(e) => setCrCompiledMessage(e.target.value)}
                        style={{
                          width: '100%',
                          minHeight: '220px',
                          padding: '12px',
                          fontSize: '13px',
                          lineHeight: '1.5',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle)',
                          fontFamily: 'monospace',
                          resize: 'vertical',
                          backgroundColor: '#f9f9f9',
                          color: '#222222',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                      <button 
                        onClick={() => {
                          const cleanPhone = selectedCrPhone.trim().replace(/\+/g, '').replace(/\s/g, '');
                          const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(crCompiledMessage)}`;
                          window.open(url, '_blank');
                          setLostFoundSubView('bulletin');
                        }}
                        className="btn-primary" 
                        style={{ flex: 2, padding: '12px', backgroundColor: '#25d366', borderColor: '#25d366', boxShadow: '0 4px 12px rgba(37, 211, 102, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#ffffff' }}
                      >
                        <MessageSquare size={16} />
                        <span>Send to WhatsApp</span>
                      </button>
                      <button type="button" onClick={() => setCrStep(4)} className="btn-secondary" style={{ flex: 1, padding: '12px' }}>
                        Back
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }

        const filteredItems = lostFoundItems.filter(item => {
          const matchesType = selectedLostFoundFilter === 'all' || item.type === selectedLostFoundFilter;
          const matchesQuery = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                               item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               item.location.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesType && matchesQuery;
        });

        const handleReportSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!newItemTitle || !newItemDesc || !newItemLocation || !newItemDate || !newItemContact) {
            showToast('Please fill in all required fields.', 'error');
            return;
          }

          if (newItemContact.replace(/\D/g, '').length !== 10) {
            showToast('Please enter a valid 10-digit phone number.', 'error');
            return;
          }

          const success = await createLostFoundItemAction(
            newItemTitle,
            newItemDesc,
            newItemType,
            newItemLocation,
            newItemDate,
            newItemContact,
            newItemImage,
            user.id,
            user.name
          );

          if (success) {
            setNewItemTitle('');
            setNewItemDesc('');
            setNewItemLocation('');
            setNewItemDate('');
            setNewItemContact('');
            setNewItemImage('');
            setIsReportLostFoundOpen(false);
            loadLostFoundItems();
            showToast('Success! Item logged in bulletin.', 'success');
          } else {
            showToast('Failed to report item. Please try again.', 'error');
          }
        };

        const handleItemImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                setNewItemImage(event.target.result as string);
              }
            };
            reader.readAsDataURL(file);
          }
        };

        return (
          <div style={styles.exploreTabContainer} className="animate-fade-in">
            {/* Back Button */}
            <button 
              onClick={() => setActiveTab('home')}
              className="btn-secondary"
              style={{ marginBottom: '20px', padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>← Back to Home</span>
            </button>

            {/* Header section */}
            <div style={styles.exploreHeaderSection}>
              <h2 style={styles.exploreTitle}>Lost & <span style={{ color: 'var(--aqua-primary)' }}>Found</span></h2>
              <p style={styles.exploreSubtitle}>Report, search, and recover lost belongings</p>
            </div>

            {/* Actions & Filters bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              {/* Category Filter Tabs */}
              <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-input)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                {(['all', 'lost', 'found'] as const).map((filter) => {
                  const isActive = selectedLostFoundFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => setSelectedLostFoundFilter(filter)}
                      className="glass-panel-hover"
                      style={{
                        padding: '6px 16px',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: isActive ? 'var(--aqua-light)' : 'transparent',
                        color: isActive ? 'var(--aqua-primary)' : 'var(--text-muted)',
                        fontSize: '13px',
                        fontWeight: isActive ? '600' : '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)} Items
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setLostFoundSubView('report_cr');
                    setCrStep(1);
                    setSelectedCrYear('');
                    setSelectedCrBranch('');
                    setSelectedCrGender(null);
                    setCrItemTitle('');
                    setCrItemLocation('');
                    setCrItemDate('');
                    setCrItemDesc('');
                    setCrContactDetails(user.name + ' (' + (user.roll_number || 'Guest') + ')');
                  }}
                  className="btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    backgroundColor: '#25d366',
                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.2)',
                  }}
                >
                  <MessageSquare size={16} />
                  <span>Report to CR</span>
                </button>

                {/* Report New Button */}
                <button
                  onClick={() => setIsReportLostFoundOpen(true)}
                  className="btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    backgroundColor: 'var(--aqua-primary)',
                    boxShadow: '0 4px 12px rgba(32, 178, 170, 0.2)',
                  }}
                >
                  <Plus size={16} />
                  <span>Report Item</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div style={{ ...styles.searchBarContainer, marginBottom: '24px' }} className="glass-panel">
              <Search size={18} color="var(--text-placeholder)" style={{ marginLeft: 12 }} />
              <input 
                type="text" 
                placeholder="Search lost or found items..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {/* Items Grid */}
            {filteredItems.length === 0 ? (
              <div style={styles.placeholderTab} className="glass-panel">
                <Search size={48} color="var(--aqua-primary)" style={{ marginBottom: 16 }} />
                <h3>No items found</h3>
                <p style={styles.placeholderText}>
                  {searchQuery ? 'Try adjusting your search keywords.' : 'No lost or found items have been reported in this category yet.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {filteredItems.map((item) => {
                  const phoneNum = item.contact || '';
                  const cleanPhone = phoneNum.replace(/\D/g, '');
                  const isPhoneValid = cleanPhone.length >= 10;
                  const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                  const reporterName = item.user_name || 'Reporter';
                  const itemTitle = item.title || 'Item';
                  const waUrl = `https://wa.me/${waPhone}?text=Hi%20${encodeURIComponent(reporterName)},%20I%20contacted%20you%20regarding%20the%20${item.type === 'lost' ? 'lost' : 'found'}%20item%20"${encodeURIComponent(itemTitle)}"%20on%20NITH%20Connect.`;
                  const callUrl = `tel:${phoneNum}`;

                  return (
                    <div key={item.id} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }} className="glass-panel-hover">
                      {/* Item Image or Placeholder */}
                      <div style={{ height: '160px', width: '100%', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--bg-input)' }}>
                        {item.image ? (
                          <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', color: 'var(--text-muted)' }}>
                            <Search size={32} style={{ opacity: 0.5 }} />
                            <span style={{ fontSize: '12px', marginTop: '6px' }}>No Photo Attached</span>
                          </div>
                        )}
                        {/* Status Badge */}
                        <span
                          style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            color: '#ffffff',
                            backgroundColor: item.type === 'lost' ? '#ef4444' : '#10b981',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          }}
                        >
                          {item.type}
                        </span>
                      </div>

                      {/* Card Content */}
                      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--pine-deep)', marginBottom: '8px' }}>{item.title}</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '16px', flex: 1 }}>{item.description}</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={12} color="var(--aqua-primary)" />
                            <span><strong>Location:</strong> {item.location}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={12} color="var(--aqua-primary)" />
                            <span><strong>Date:</strong> {item.date}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', padding: '6px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-input)', fontSize: '11.5px', color: 'var(--pine-deep)' }}>
                            <span><strong>Contact:</strong> {item.contact} ({item.user_name})</span>
                          </div>
                        </div>

                        {/* Contact Action Buttons */}
                        {isPhoneValid && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ flex: 1, textDecoration: 'none' }}
                            >
                              <button
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: '1px solid #25d366',
                                  backgroundColor: 'rgba(37, 211, 102, 0.08)',
                                  color: '#128c7e',
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  transition: 'all 0.2s ease',
                                }}
                                className="glass-panel-hover"
                              >
                                <MessageSquare size={13} color="#128c7e" />
                                WhatsApp
                              </button>
                            </a>
                            <a
                              href={callUrl}
                              style={{ flex: 1, textDecoration: 'none' }}
                            >
                              <button
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: '1px solid var(--pine-primary)',
                                  backgroundColor: 'rgba(18, 91, 68, 0.08)',
                                  color: 'var(--pine-primary)',
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  transition: 'all 0.2s ease',
                                }}
                                className="glass-panel-hover"
                              >
                                <Phone size={13} color="var(--pine-primary)" />
                                Call
                              </button>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Report Item Modal */}
            {isReportLostFoundOpen && (
              <div style={styles.modalOverlay} onClick={() => setIsReportLostFoundOpen(false)}>
                <div 
                  style={{ ...styles.idCardModal, maxWidth: '480px' }} 
                  className="glass-panel animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={styles.modalHeader}>
                    <h3 style={styles.modalTitle}>Report Lost/Found Item</h3>
                    <button onClick={() => setIsReportLostFoundOpen(false)} style={styles.modalCloseBtn}>
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' }}>
                    <div>
                      <label style={styles.formLabel}>Item Name *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Black leather wallet, keys..." 
                        value={newItemTitle} 
                        onChange={(e) => setNewItemTitle(e.target.value)} 
                        style={styles.formInput} 
                      />
                    </div>

                    <div>
                      <label style={styles.formLabel}>Report Type *</label>
                      <select 
                        value={newItemType} 
                        onChange={(e) => setNewItemType(e.target.value as 'lost' | 'found')} 
                        style={styles.formInput}
                      >
                        <option value="lost">Lost Item</option>
                        <option value="found">Found Item</option>
                      </select>
                    </div>

                    <div>
                      <label style={styles.formLabel}>Description *</label>
                      <textarea 
                        required
                        placeholder="Describe the item (color, contents, identifying marks)..." 
                        value={newItemDesc} 
                        onChange={(e) => setNewItemDesc(e.target.value)} 
                        style={{ ...styles.formInput, minHeight: '80px', resize: 'vertical' }} 
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={styles.formLabel}>Location *</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Audi Hall, library..." 
                          value={newItemLocation} 
                          onChange={(e) => setNewItemLocation(e.target.value)} 
                          style={styles.formInput} 
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={styles.formLabel}>Date *</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. 30 Jun, Yesterday..." 
                          value={newItemDate} 
                          onChange={(e) => setNewItemDate(e.target.value)} 
                          style={styles.formInput} 
                        />
                      </div>
                    </div>

                    <div>
                      <label style={styles.formLabel}>Contact Details (10-Digit Phone Number) *</label>
                      <input 
                        type="tel" 
                        required
                        maxLength={10}
                        pattern="[0-9]{10}"
                        placeholder="e.g. 9816012345" 
                        value={newItemContact} 
                        onChange={(e) => setNewItemContact(e.target.value.replace(/\D/g, ''))} 
                        style={styles.formInput} 
                      />
                    </div>

                    <div>
                      <label style={styles.formLabel}>Attach Photo (Optional)</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleItemImageUpload} 
                        style={styles.formInput} 
                      />
                      {newItemImage && (
                        <div style={{ marginTop: '8px', height: '100px', width: '100%', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                          <img src={newItemImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>

                    <div style={{ ...styles.idCardActions, marginTop: '16px' }}>
                      <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px', backgroundColor: 'var(--aqua-primary)' }}>
                        Submit Report
                      </button>
                      <button type="button" onClick={() => setIsReportLostFoundOpen(false)} className="btn-secondary" style={{ flex: 1, padding: '12px' }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      }
      case 'chat': {
        const activeRoom = chatRoomsList.find(r => r.id === selectedRoomId);

        const handleSendMessage = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!newMsgText.trim()) return;
          const textToSend = newMsgText;
          setNewMsgText('');
          const res = await sendChatMessage(selectedRoomId, activeRoom?.name || 'Chat', user.id, user.name, textToSend);
          if (res.success) {
            loadMessages(selectedRoomId);
          } else if (res.banned) {
            const dateStr = new Date(res.bannedUntil!).toLocaleString();
            showToast(`Banned from chatroom: expires on ${dateStr}. Reason: ${res.reason}`, 'error');
          } else if (res.containsProfanity) {
            showToast('Message blocked: Contains prohibited language/profanity.', 'error');
          } else {
            showToast('Failed to send message.', 'error');
          }
        };

        const categories: Record<string, FirestoreChatroom[]> = {};
        chatRoomsList.forEach(room => {
          const cat = room.category || 'Other';
          if (!categories[cat]) categories[cat] = [];
          categories[cat].push(room);
        });

        const getAvatarColor = (name: string) => {
          let hash = 0;
          for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
          }
          const colors = [
            '#e76f51', '#f4a261', '#2a9d8f', '#e9c46a', 
            '#9b5de5', '#f15bb5', '#00bbf9', '#00f5d4',
            '#3a86c8', '#a0c4ff', '#ffadad', '#ffd6a5'
          ];
          return colors[Math.abs(hash % colors.length)];
        };

        return (
          <div style={{
            display: 'flex',
            height: 'calc(100vh - 120px)',
            gap: '16px',
            overflow: 'hidden'
          }} className="animate-fade-in">
            {/* Left Column: Channels Selector */}
            <div style={{
              width: '260px',
              display: isChatSidebarOpen ? 'flex' : 'none',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '16px',
              overflowY: 'auto'
            }} className="glass-panel">
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--pine-deep)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                NITH Channels
              </h3>
              
              {chatRoomsList.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Loading channels...</p>
              ) : (
                Object.keys(categories).map(catName => (
                  <div key={catName} style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', paddingLeft: '4px', marginBottom: '4px' }}>
                      {catName}
                    </span>
                    {categories[catName].map(room => {
                      const isSelected = room.id === selectedRoomId;
                      return (
                        <button
                          key={room.id}
                          onClick={() => {
                            setSelectedRoomId(room.id);
                            loadMessages(room.id);
                            // Auto collapse on selection on mobile/narrow screens
                            if (window.innerWidth < 768) {
                              setIsChatSidebarOpen(false);
                            }
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: isSelected ? 'rgba(42, 157, 143, 0.12)' : 'transparent',
                            borderLeft: isSelected ? '3px solid var(--pine-primary)' : '3px solid transparent',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          className="glass-panel-hover"
                        >
                          <span style={{
                            fontSize: '13px',
                            fontWeight: isSelected ? '700' : '500',
                            color: isSelected ? 'var(--pine-deep)' : 'var(--text-main)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            # {room.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Right Column: Chat window */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden'
            }} className="glass-panel">
              {/* Chat Window Header */}
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Channels List Toggle Button */}
                  <button
                    onClick={() => setIsChatSidebarOpen(!isChatSidebarOpen)}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      backgroundColor: isChatSidebarOpen ? 'rgba(42, 157, 143, 0.08)' : '#ffffff',
                      color: 'var(--pine-primary)',
                      transition: 'all 0.2s ease',
                    }}
                    title="Toggle channels list"
                  >
                    <MessageSquare size={14} />
                    <span style={{ fontSize: '12px', marginLeft: '6px', fontWeight: '700' }}>
                      {isChatSidebarOpen ? 'Hide Channels' : 'Channels'}
                    </span>
                  </button>

                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--pine-deep)', margin: 0 }}>
                      # {activeRoom?.name || 'Loading Channel...'}
                    </h3>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      {activeRoom?.description || ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message List Area */}
              <div style={{
                flex: 1,
                padding: '20px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {chatMessages.length === 0 ? (
                  <div style={{
                    margin: 'auto',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    padding: '20px'
                  }}>
                    <MessageSquare size={36} style={{ marginBottom: '8px', opacity: 0.5 }} />
                    <p style={{ fontSize: '13px' }}>Welcome to #{(activeRoom?.name || '').toLowerCase()}!</p>
                    <p style={{ fontSize: '11px', marginTop: '4px' }}>Be the first one to send a message.</p>
                  </div>
                ) : (
                  chatMessages.map(msg => {
                    const isOwnMessage = msg.user_id === user.id;
                    const avatarColor = getAvatarColor(msg.user_name);
                    const formattedTime = msg.created_at
                      ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '';

                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'flex-start',
                          alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          flexDirection: isOwnMessage ? 'row-reverse' : 'row'
                        }}
                      >
                        {/* Avatar */}
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: avatarColor,
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: '700',
                          flexShrink: 0,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                          {msg.user_name.charAt(0).toUpperCase()}
                        </div>

                        {/* Content Block */}
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
                        }}>
                          <div style={{
                            display: 'flex',
                            gap: '6px',
                            alignItems: 'center',
                            marginBottom: '4px'
                          }}>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--pine-deep)' }}>
                              {msg.user_name}
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                              {formattedTime}
                            </span>
                            {!isOwnMessage && (
                              <button
                                onClick={async () => {
                                  if (!confirm("Are you sure you want to report this message for policy violation?")) return;
                                  const res = await reportMessageAction(msg.id!, user.id);
                                  if (res.success) {
                                    showToast("Message reported to moderators.", "info");
                                  } else {
                                    showToast("Failed to report message.", "error");
                                  }
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#e76f51',
                                  fontSize: '10px',
                                  cursor: 'pointer',
                                  padding: '0 4px',
                                  opacity: 0.7,
                                  fontWeight: '600',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px'
                                }}
                              >
                                ⚠️ Report
                              </button>
                            )}
                          </div>

                          <div style={{
                            padding: '10px 14px',
                            borderRadius: '12px',
                            borderTopLeftRadius: isOwnMessage ? '12px' : '12px',
                            borderTopRightRadius: isOwnMessage ? '12px' : '12px',
                            backgroundColor: isOwnMessage ? 'var(--pine-primary)' : '#ffffff',
                            color: isOwnMessage ? '#ffffff' : 'var(--text-main)',
                            border: isOwnMessage ? 'none' : '1px solid var(--border-subtle)',
                            fontSize: '13px',
                            lineHeight: '1.4',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap'
                          }}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: '14px 20px',
                  borderTop: '1px solid var(--border-subtle)',
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center'
                }}
              >
                <input
                  type="text"
                  placeholder={`Send message to #${(activeRoom?.name || '').toLowerCase()}`}
                  value={newMsgText}
                  onChange={(e) => setNewMsgText(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-main)',
                    fontSize: '13px'
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMsgText.trim()}
                  className="btn-primary"
                  style={{
                    padding: '10px 16px',
                    backgroundColor: newMsgText.trim() ? 'var(--pine-primary)' : 'var(--border-subtle)',
                    borderColor: 'transparent',
                    opacity: newMsgText.trim() ? 1 : 0.6,
                    cursor: newMsgText.trim() ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        );
      }
      case 'dev_tools': {
        const handleInjectLostItem = async () => {
          const success = await createLostFoundItemAction(
            "Developer Test Wallet (Mock)",
            "A test item automatically injected from the Developer Console. Black leather wallet with student library card.",
            "lost",
            "Audi Hall, 3rd row",
            "Today",
            "+919816012345",
            "",
            user.id,
            user.name
          );
          if (success) {
            showToast('Staged mock lost item in Firestore.', 'success');
            loadLostFoundItems();
          } else {
            showToast('Failed to inject mock item.', 'error');
          }
        };

        const handleInjectAnnouncement = async () => {
          const success = await createAnnouncementAction(
            "Developer Update: System Under Test",
            "This announcement has been automatically injected from the Developer Console to verify feed synchronization. System status is nominal.",
            "All Students",
            "Today",
            "12:00 PM",
            "Cloud Console",
            "Developer Tools",
            "pine"
          );
          if (success) {
            showToast('Staged mock announcement in Firestore.', 'success');
            loadAnnouncements();
          } else {
            showToast('Failed to inject mock announcement.', 'error');
          }
        };
        const pendingAnnouncements = announcements.filter(ann => ann.approved === false);

        return (
          <div style={styles.exploreTabContainer} className="animate-fade-in">
            <div style={styles.exploreHeaderSection}>
              <h2 style={styles.exploreTitle}>Developer <span style={{ color: '#e76f51' }}>Console</span> 🛠️</h2>
              <p style={styles.exploreSubtitle}>Administrator utilities, Firestore seeding, and real-time environment status</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {/* Environment Status Card */}
              <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--pine-deep)', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  System Configuration
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div><strong>Developer Email:</strong> {user.email}</div>
                  <div><strong>Developer Roll No:</strong> {user.roll_number || 'N/A'}</div>
                  <div><strong>Session ID:</strong> {user.id}</div>
                  <div><strong>Role Level:</strong> <span style={{ color: '#e76f51', fontWeight: 'bold' }}>{user.role}</span></div>
                  <div><strong>Environment:</strong> development</div>
                  <div><strong>Database Server:</strong> Google Cloud Firestore (asia-south1)</div>
                </div>
              </div>

              {/* Database Controls Card */}
              <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--pine-deep)', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  Mock Data Injector
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Simulate and inject live records directly into Cloud Firestore to test application views.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    onClick={handleInjectLostItem}
                    className="btn-primary" 
                    style={{ padding: '10px 14px', backgroundColor: 'var(--pine-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <span>Inject Mock Lost Item</span>
                  </button>
                  <button 
                    onClick={handleInjectAnnouncement}
                    className="btn-primary" 
                    style={{ padding: '10px 14px', backgroundColor: 'var(--aqua-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <span>Inject Mock Announcement</span>
                  </button>
                </div>
              </div>

              {/* Maintenance Tools Card */}
              <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--pine-deep)', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  Database Utilities
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Trigger background data-healing and collection seeding routines.
                </p>
                <button 
                  onClick={async () => {
                    await runSeedingAction();
                    showToast('Firestore re-seeded successfully.', 'success');
                    loadAnnouncements();
                    loadLostFoundItems();
                  }}
                  className="btn-secondary" 
                  style={{ width: '100%', padding: '10px 14px', fontWeight: '700' }}
                >
                  Force Firestore Re-seed
                </button>
              </div>

              {/* Pending Approvals Section */}
              <div 
                className="glass-panel" 
                style={{ 
                  gridColumn: '1 / -1', 
                  padding: '24px', 
                  backgroundColor: '#ffffff', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: 'var(--radius-lg)',
                  marginTop: '10px'
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--pine-deep)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Pending Announcements Approvals</span>
                  {pendingAnnouncements.length > 0 && (
                    <span style={{
                      backgroundColor: '#e76f51',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      {pendingAnnouncements.length}
                    </span>
                  )}
                </h3>

                {pendingAnnouncements.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No pending announcements to approve. You&apos;re all caught up! ✨
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {pendingAnnouncements.map((ann) => {
                      return (
                        <div 
                          key={ann.id}
                          style={{
                            padding: '16px',
                            borderRadius: '10px',
                            border: '1px solid var(--border-subtle)',
                            backgroundColor: 'rgba(0,0,0,0.01)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                              <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                                {ann.title}
                              </h4>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                Publisher: <strong>{ann.publisher}</strong> | Target: {ann.target_audience}
                              </span>
                            </div>
                            <span style={{
                              fontSize: '10px',
                              backgroundColor: 'rgba(231, 111, 81, 0.15)',
                              color: '#e76f51',
                              fontWeight: '800',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}>
                              New Announcement
                            </span>
                          </div>

                          <p style={{ fontSize: '13px', color: 'var(--text-main)', margin: 0, lineHeight: '1.4' }}>
                            {ann.description}
                          </p>

                          <div style={{ display: 'flex', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                            <span><strong>Date:</strong> {ann.event_date}</span>
                            <span>|</span>
                            <span><strong>Time:</strong> {ann.event_time}</span>
                            <span>|</span>
                            <span><strong>Venue:</strong> {ann.location}</span>
                          </div>

                          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                            <button
                              onClick={async () => {
                                const success = await approveAnnouncementAction(ann.id!);
                                if (success) {
                                  showToast('Announcement approved & published.', 'success');
                                  loadAnnouncements();
                                } else {
                                  showToast('Failed to approve announcement.', 'error');
                                }
                              }}
                              className="btn-primary"
                              style={{ padding: '8px 16px', fontSize: '12px' }}
                            >
                              Approve & Publish
                            </button>
                            <button
                              onClick={async () => {
                                const success = await rejectAnnouncementAction(ann.id!);
                                if (success) {
                                  showToast('Announcement submission deleted.', 'info');
                                  loadAnnouncements();
                                } else {
                                  showToast('Failed to delete announcement.', 'error');
                                }
                              }}
                              className="btn-secondary"
                              style={{ padding: '8px 16px', fontSize: '12px', color: '#e76f51', borderColor: 'rgba(231, 111, 81, 0.2)' }}
                            >
                              Delete Submission
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Feedback Suggestions Section */}
              <div 
                className="glass-panel" 
                style={{ 
                  gridColumn: '1 / -1', 
                  padding: '24px', 
                  backgroundColor: '#ffffff', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: 'var(--radius-lg)',
                  marginTop: '16px'
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--pine-deep)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Student Feedback & Suggestions</span>
                  {feedbackSubmissions.length > 0 && (
                    <span style={{
                      backgroundColor: 'var(--pine-primary)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      {feedbackSubmissions.length}
                    </span>
                  )}
                </h3>

                {feedbackSubmissions.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No suggestions submitted by students yet. 💡
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {feedbackSubmissions.map((sub) => {
                      return (
                        <div 
                          key={sub.id}
                          style={{
                            padding: '16px',
                            borderRadius: '10px',
                            border: '1px solid var(--border-subtle)',
                            backgroundColor: 'rgba(0,0,0,0.01)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                              <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)' }}>
                                {sub.submitted_by}
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                                ({sub.submitted_by_email})
                              </span>
                            </div>
                            
                            {sub.awarded_visionary ? (
                              <span style={{
                                fontSize: '10px',
                                backgroundColor: 'rgba(233, 196, 106, 0.15)',
                                color: '#b58900',
                                fontWeight: '800',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                💡 Visionary Awarded
                              </span>
                            ) : (
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700' }}>
                                Suggestion Pending Review
                              </span>
                            )}
                          </div>

                          <p style={{ fontSize: '13px', color: 'var(--text-main)', margin: '4px 0', lineHeight: '1.4', fontStyle: 'italic' }}>
                            &ldquo;{sub.suggestion}&rdquo;
                          </p>

                          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                            {!sub.awarded_visionary ? (
                              <button
                                onClick={async () => {
                                  const success = await awardVisionaryBadgeAction(sub.id!, true);
                                  if (success) {
                                    showToast(`Successfully awarded The Visionary Badge! 💡`, 'success');
                                    loadFeedbackData();
                                  } else {
                                    showToast('Failed to award badge.', 'error');
                                  }
                                }}
                                className="btn-primary"
                                style={{ padding: '6px 12px', fontSize: '11px', fontWeight: '800' }}
                              >
                                💡 Award Visionary Badge
                              </button>
                            ) : (
                              <button
                                onClick={async () => {
                                  const success = await awardVisionaryBadgeAction(sub.id!, false);
                                  if (success) {
                                    showToast(`Revoked The Visionary Badge.`, 'info');
                                    loadFeedbackData();
                                  } else {
                                    showToast('Failed to revoke badge.', 'error');
                                  }
                                }}
                                className="btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '11px', fontWeight: '800', color: '#e76f51', borderColor: 'rgba(231, 111, 81, 0.2)' }}
                              >
                                Revoke Visionary Badge
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'dev_timetables': {
        const pendingTimetables = timetableSubmissions.filter(t => t.status === 'pending');
        return (
          <div style={styles.exploreTabContainer} className="animate-fade-in">
            <div style={styles.exploreHeaderSection}>
              <h2 style={styles.exploreTitle}>Timetables <span style={{ color: '#f4a261' }}>Approvals</span> 📅</h2>
              <p style={styles.exploreSubtitle}>Review, publish or reject timetable submissions from students</p>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div 
                className="glass-panel" 
                style={{ 
                  padding: '24px', 
                  backgroundColor: '#ffffff', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--pine-deep)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Pending Timetables Approvals</span>
                  {pendingTimetables.length > 0 && (
                    <span style={{
                      backgroundColor: '#e76f51',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      {pendingTimetables.length}
                    </span>
                  )}
                </h3>

                {pendingTimetables.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No pending timetables to approve. You&apos;re all caught up! ✨
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {pendingTimetables.map((sub) => {
                      return (
                        <div 
                          key={sub.id}
                          style={{
                            padding: '16px',
                            borderRadius: '10px',
                            border: '1px solid var(--border-subtle)',
                            backgroundColor: 'rgba(0,0,0,0.01)',
                            display: 'flex',
                            gap: '16px',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap'
                          }}
                        >
                          <div 
                            style={{
                              width: '120px',
                              height: '120px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: '#ffffff',
                              flexShrink: 0
                            }}
                          >
                            <img 
                              src={sub.file_data} 
                              alt="Timetable Preview" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                              onClick={() => {
                                const win = window.open();
                                if (win) {
                                  win.document.write(`<img src="${sub.file_data}" style="max-width:100%; height:auto;" />`);
                                }
                              }}
                              title="Click to view full size"
                            />
                          </div>

                          <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                              <div>
                                <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                                  {sub.year} — {sub.year === '1st Year' ? `Section ${sub.section}` : `${sub.branch} (Section ${sub.section})`}
                                </h4>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                  Submitted by: <strong>{sub.uploaded_by}</strong> ({sub.uploaded_by_email})
                                </span>
                              </div>
                              <span style={{
                                fontSize: '10px',
                                backgroundColor: 'rgba(231, 111, 81, 0.15)',
                                color: '#e76f51',
                                fontWeight: '800',
                                padding: '2px 8px',
                                borderRadius: '4px'
                              }}>
                                New Timetable Submission
                              </span>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                              <button
                                onClick={async () => {
                                  const success = await approveTimetableAction(sub.id!, sub.year, sub.section || '', sub.branch || '', sub.file_data);
                                  if (success) {
                                    showToast(`Timetable approved!`, 'success');
                                    loadTimetablesData();
                                  } else {
                                    showToast('Failed to approve timetable.', 'error');
                                  }
                                }}
                                className="btn-primary"
                                style={{ padding: '8px 16px', fontSize: '12px' }}
                              >
                                Approve & Publish
                              </button>
                              <button
                                onClick={async () => {
                                  const success = await rejectTimetableAction(sub.id!);
                                  if (success) {
                                    showToast('Timetable submission rejected.', 'info');
                                    loadTimetablesData();
                                  } else {
                                    showToast('Failed to reject timetable.', 'error');
                                  }
                                }}
                                className="btn-secondary"
                                style={{ padding: '8px 16px', fontSize: '12px', color: '#e76f51', borderColor: 'rgba(231, 111, 81, 0.2)' }}
                              >
                                Reject & Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'dev_clubs': {
        return (
          <div style={styles.exploreTabContainer} className="animate-fade-in">
            <div style={styles.exploreHeaderSection}>
              <h2 style={styles.exploreTitle}>Clubs <span style={{ color: '#9b5de5' }}>Moderation</span> 🏆</h2>
              <p style={styles.exploreSubtitle}>Review and approve campus club & society registration submissions</p>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div 
                className="glass-panel" 
                style={{ 
                  padding: '24px', 
                  backgroundColor: '#ffffff', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--pine-deep)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Club Registration Requests</span>
                  {clubSubmissions.filter(s => s.status === 'pending').length > 0 && (
                    <span style={{
                      backgroundColor: '#e76f51',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      {clubSubmissions.filter(s => s.status === 'pending').length}
                    </span>
                  )}
                </h3>

                {clubSubmissions.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No club registration requests submitted yet. 🎪
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {clubSubmissions.map((sub) => {
                      return (
                        <div 
                          key={sub.id || sub.name}
                          style={{
                            padding: '16px',
                            borderRadius: '10px',
                            border: '1px solid var(--border-subtle)',
                            backgroundColor: 'rgba(0,0,0,0.01)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                              <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                                {sub.name} <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--pine-primary)', backgroundColor: 'rgba(42,157,143,0.1)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>{sub.category}</span>
                              </h4>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                Submitted by: <strong>{sub.submitted_by}</strong> ({sub.submitted_by_email})
                              </span>
                            </div>
                            
                            <span style={{
                              fontSize: '10px',
                              backgroundColor: sub.status === 'approved' ? 'rgba(42,157,143,0.15)' : sub.status === 'rejected' ? 'rgba(231,111,81,0.15)' : 'rgba(244,162,97,0.15)',
                              color: sub.status === 'approved' ? 'var(--pine-primary)' : sub.status === 'rejected' ? '#e76f51' : '#f4a261',
                              fontWeight: '800',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}>
                              {sub.status.toUpperCase()}
                            </span>
                          </div>

                          <p style={{ fontSize: '13px', color: 'var(--text-main)', margin: '4px 0', lineHeight: '1.4' }}>
                            {sub.desc}
                          </p>

                          <div style={{ 
                            fontSize: '11px', 
                            color: 'var(--text-muted)', 
                            backgroundColor: 'rgba(0,0,0,0.02)', 
                            padding: '10px', 
                            borderRadius: '6px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '4px',
                            margin: '6px 0'
                          }}>
                            <div><strong>President / Lead:</strong> {sub.president_name} ({sub.president_email}) - <em>{sub.president_designation}</em></div>
                            <div><strong>Domains / Focus:</strong> {sub.domains || 'General'}</div>
                            <div><strong>Contact Link:</strong> {sub.contact}</div>
                          </div>

                          {sub.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                              <button
                                onClick={async () => {
                                  const success = await approveClubSubmissionAction(sub.id!, user.email);
                                  if (success) {
                                    showToast(`Approved club "${sub.name}"!`, 'success');
                                    loadClubsData();
                                  } else {
                                    showToast('Failed to approve club registration.', 'error');
                                  }
                                }}
                                className="btn-primary"
                                style={{ padding: '6px 12px', fontSize: '11px', fontWeight: '800' }}
                              >
                                Approve & List Club
                              </button>
                              <button
                                onClick={async () => {
                                  const success = await rejectClubSubmissionAction(sub.id!);
                                  if (success) {
                                    showToast('Rejected club request.', 'info');
                                    loadClubsData();
                                  } else {
                                    showToast('Failed to reject request.', 'error');
                                  }
                                }}
                                className="btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '11px', fontWeight: '800', color: '#e76f51', borderColor: 'rgba(231, 111, 81, 0.2)' }}
                              >
                                Reject Request
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'dev_files': {
        return (
          <div style={styles.exploreTabContainer} className="animate-fade-in">
            <div style={styles.exploreHeaderSection}>
              <h2 style={styles.exploreTitle}>Academic Files <span style={{ color: '#3d5a80' }}>Manager</span> 📚</h2>
              <p style={styles.exploreSubtitle}>Upload syllabus, calendar, notes, practicals, and PYQs to student resources</p>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div
                className="glass-panel"
                style={{
                  padding: '24px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--pine-deep)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GraduationCap size={18} color="#3d5a80" /> Academic Files Manager
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Upload PDFs/ZIPs via Google Drive links. Paste the share link — the app auto-converts it to a direct download.
                </p>

                {/* Upload Form */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={styles.formLabel}>Category Tab</label>
                    <select value={newFileTab} onChange={e => setNewFileTab(e.target.value as AcademicTab)} style={{ ...styles.formInput, padding: '8px 10px' }}>
                      <option value="syllabus">📋 Syllabus</option>
                      <option value="calendar">📅 Academic Calendar</option>
                      <option value="notes">📝 Notes</option>
                      <option value="practical">🔬 Practical Files</option>
                      <option value="pyq">📄 PYQs</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={styles.formLabel}>Year</label>
                    <select value={newFileYear} onChange={e => { setNewFileYear(e.target.value); setNewFileBranch(e.target.value === '1st Year' ? 'All' : 'Computer Science & Engineering'); }} style={{ ...styles.formInput, padding: '8px 10px' }}>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  {newFileYear !== '1st Year' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={styles.formLabel}>Branch</label>
                      <select value={newFileBranch} onChange={e => setNewFileBranch(e.target.value)} style={{ ...styles.formInput, padding: '8px 10px' }}>
                        <option value="Computer Science & Engineering">CSE</option>
                        <option value="Electronics & Communication Engineering">ECE</option>
                        <option value="Electrical Engineering">Electrical</option>
                        <option value="Mechanical Engineering">Mechanical</option>
                        <option value="Civil Engineering">Civil</option>
                        <option value="Chemical Engineering">Chemical</option>
                        <option value="Material Science & Engineering">Materials</option>
                      </select>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={styles.formLabel}>File Title</label>
                    <input type="text" placeholder="e.g. Unit 1 Notes" value={newFileTitle} onChange={e => setNewFileTitle(e.target.value)} style={{ ...styles.formInput, padding: '8px 10px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={styles.formLabel}>Subject</label>
                    <input type="text" placeholder="e.g. Data Structures" value={newFileSubject} onChange={e => setNewFileSubject(e.target.value)} style={{ ...styles.formInput, padding: '8px 10px' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                  <label style={styles.formLabel}>Description (optional)</label>
                  <input type="text" placeholder="Short description of the file" value={newFileDesc} onChange={e => setNewFileDesc(e.target.value)} style={{ ...styles.formInput, padding: '8px 10px' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                  <label style={styles.formLabel}>Google Drive Share Link</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                    value={newFileDriveLink}
                    onChange={e => setNewFileDriveLink(e.target.value)}
                    style={{ ...styles.formInput, padding: '8px 10px' }}
                  />
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    Paste the &quot;Anyone with link&quot; share URL — the app auto-converts it to a direct download link for users.
                  </p>
                </div>

                <button
                  className="btn-primary"
                  disabled={isSubmittingAcadFile || !newFileTitle.trim() || !newFileDriveLink.trim() || !newFileSubject.trim()}
                  onClick={async () => {
                    setIsSubmittingAcadFile(true);
                    const ok = await addAcademicFileAction({
                      tab: newFileTab,
                      title: newFileTitle.trim(),
                      subject: newFileSubject.trim(),
                      description: newFileDesc.trim(),
                      year: newFileYear,
                      branch: newFileYear === '1st Year' ? 'All' : newFileBranch,
                      drive_link: newFileDriveLink.trim(),
                      uploaded_by: user.name,
                      uploaded_by_email: user.email,
                    });
                    if (ok) {
                      showToast('File uploaded successfully!', 'success');
                      setNewFileTitle(''); setNewFileSubject(''); setNewFileDesc(''); setNewFileDriveLink('');
                      await loadAcademicFiles();
                    } else {
                      showToast('Upload failed. Check the link and try again.', 'error');
                    }
                    setIsSubmittingAcadFile(false);
                  }}
                  style={{ padding: '10px 24px', fontSize: '13px', fontWeight: '800', marginBottom: '24px' }}
                >
                  {isSubmittingAcadFile ? 'Uploading...' : '+ Upload File'}
                </button>

                <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--pine-deep)', marginBottom: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                  All Uploaded Files ({academicFiles.length})
                </h4>
                {academicFiles.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No files uploaded yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {academicFiles.map(f => (
                      <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-hover)', gap: '10px' }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.title}</p>
                          <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                            {f.tab.toUpperCase()} · {f.year}{f.year !== '1st Year' ? ` · ${f.branch}` : ''} · {f.subject}
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            const ok = await deleteAcademicFileAction(f.id);
                            if (ok) { showToast('File deleted.', 'success'); await loadAcademicFiles(); }
                            else showToast('Delete failed.', 'error');
                          }}
                          style={{ flexShrink: 0, background: 'rgba(231,111,81,0.12)', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: '800', color: '#e76f51', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }
      case 'dev_moderation': {
        return (
          <div style={styles.exploreTabContainer} className="animate-fade-in">
            <div style={styles.exploreHeaderSection}>
              <h2 style={styles.exploreTitle}>Chatroom <span style={{ color: '#e76f51' }}>Moderation</span> ⚖️</h2>
              <p style={styles.exploreSubtitle}>Review flagged messages and enforce timeouts/bans on problematic accounts</p>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div 
                className="glass-panel" 
                style={{ 
                  padding: '24px', 
                  backgroundColor: '#ffffff', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--pine-deep)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Flagged Messages (3+ Reports)</span>
                  {reportedMessages.length > 0 && (
                    <span style={{
                      backgroundColor: '#e76f51',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      {reportedMessages.length}
                    </span>
                  )}
                </h3>

                {reportedMessages.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No reported messages to review. Chatrooms are clean! 😇
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {reportedMessages.map((msg) => {
                      return (
                        <div 
                          key={msg.id}
                          style={{
                            padding: '16px',
                            borderRadius: '10px',
                            border: '1px solid var(--border-subtle)',
                            backgroundColor: 'rgba(0,0,0,0.01)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                              <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                                {msg.user_name} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(ID: {msg.user_id})</span>
                              </h4>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                Chatroom: <strong>#{msg.chatroom_name || 'unknown'}</strong>
                              </span>
                            </div>
                            <span style={{
                              fontSize: '11px',
                              backgroundColor: 'rgba(231, 111, 81, 0.15)',
                              color: '#e76f51',
                              fontWeight: '800',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              🚨 {msg.reports_count} Reports
                            </span>
                          </div>

                          <p style={{ 
                            fontSize: '13.5px', 
                            color: 'var(--text-main)', 
                            margin: '4px 0', 
                            lineHeight: '1.4', 
                            backgroundColor: 'var(--bg-input)', 
                            padding: '12px', 
                            borderRadius: '8px', 
                            borderLeft: '4px solid #e76f51',
                            fontStyle: 'italic'
                          }}>
                            &ldquo;{msg.text}&rdquo;
                          </p>

                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <button
                              onClick={async () => {
                                const success = await dismissReportsAction(msg.id!);
                                if (success) {
                                  showToast('Reports dismissed successfully.', 'success');
                                  loadReportedMessages();
                                } else {
                                  showToast('Failed to dismiss reports.', 'error');
                                }
                              }}
                              className="btn-secondary"
                              style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '700' }}
                            >
                              Dismiss Reports
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm("Are you sure you want to delete this message?")) return;
                                const success = await deleteMessageAction(msg.id!);
                                if (success) {
                                  showToast('Message deleted.', 'success');
                                  loadReportedMessages();
                                } else {
                                  showToast('Failed to delete message.', 'error');
                                }
                              }}
                              className="btn-secondary"
                              style={{ padding: '8px 16px', fontSize: '12px', color: '#e76f51', borderColor: 'rgba(231, 111, 81, 0.2)', fontWeight: '700' }}
                            >
                              Delete Message
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                              <select 
                                id={`ban-duration-${msg.id}`}
                                defaultValue="24"
                                style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '12px', fontWeight: '700', backgroundColor: '#fff', color: 'var(--text-main)', cursor: 'pointer' }}
                              >
                                <option value="1">Ban 1 Hour</option>
                                <option value="24">Ban 1 Day</option>
                                <option value="168">Ban 7 Days</option>
                                <option value="-1">Ban Permanent</option>
                              </select>
                              <button
                                onClick={async () => {
                                  const selectEl = document.getElementById(`ban-duration-${msg.id}`) as HTMLSelectElement;
                                  const duration = Number(selectEl?.value || '24');
                                  const reason = prompt("Enter ban reason:", "Violation of chatroom policies");
                                  if (reason === null) return;
                                  
                                  const success = await banUserAction(msg.user_id, duration, reason);
                                  if (success) {
                                    await deleteMessageAction(msg.id!);
                                    showToast('User banned and message deleted.', 'success');
                                    loadReportedMessages();
                                  } else {
                                    showToast('Failed to ban user.', 'error');
                                  }
                                }}
                                className="btn-primary"
                                style={{ padding: '8px 16px', fontSize: '12px', backgroundColor: '#e76f51', borderColor: 'transparent', fontWeight: '700' }}
                              >
                                Ban Sender & Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <div 
                className="glass-panel" 
                style={{ 
                  padding: '24px', 
                  backgroundColor: '#ffffff', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--pine-deep)', marginBottom: '8px' }}>
                  Prohibited Language & Profanity Blocklist 🚫
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Messages matching these words (case-insensitive, whole-word matching) will automatically be blocked before transmission.
                </p>

                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newBadWord.trim()) return;
                    setIsSubmittingBadWord(true);
                    const success = await addBlockedWordAction(newBadWord.trim());
                    if (success) {
                      showToast(`Added "${newBadWord.trim()}" to blocklist.`, 'success');
                      setNewBadWord('');
                      await loadBlockedWords();
                    } else {
                      showToast('Failed to add word.', 'error');
                    }
                    setIsSubmittingBadWord(false);
                  }}
                  style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}
                >
                  <input
                    type="text"
                    placeholder="Enter word to block..."
                    value={newBadWord}
                    onChange={(e) => setNewBadWord(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-hover)',
                      fontSize: '13px',
                      color: 'var(--text-main)'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingBadWord}
                    className="btn-primary"
                    style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800', whiteSpace: 'nowrap' }}
                  >
                    {isSubmittingBadWord ? 'Adding...' : '+ Add Word'}
                  </button>
                </form>

                {blockedWords.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No prohibited words on the blocklist.</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {blockedWords.map((word) => (
                      <span 
                        key={word}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: 'var(--bg-hover)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-main)',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '700'
                        }}
                      >
                        {word}
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm(`Are you sure you want to remove "${word}" from the blocklist?`)) return;
                            const success = await removeBlockedWordAction(word);
                            if (success) {
                              showToast(`Removed "${word}" from blocklist.`, 'info');
                              await loadBlockedWords();
                            } else {
                              showToast('Failed to remove word.', 'error');
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#e76f51',
                            cursor: 'pointer',
                            padding: '0 2px',
                            fontWeight: '800',
                            fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }
      case 'academics': {
        const ACAD_TABS: { id: AcademicTab; label: string; emoji: string }[] = [
          { id: 'syllabus',   label: 'Syllabus',          emoji: '📋' },
          { id: 'calendar',  label: 'Academic Calendar',  emoji: '📅' },
          { id: 'notes',     label: 'Notes',              emoji: '📝' },
          { id: 'practical', label: 'Practical Files',    emoji: '🔬' },
          { id: 'pyq',       label: 'PYQs',               emoji: '📄' },
        ];

        const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
        const BRANCHES = [
          'Computer Science & Engineering',
          'Electronics & Communication Engineering',
          'Electrical Engineering',
          'Mechanical Engineering',
          'Civil Engineering',
          'Chemical Engineering',
          'Material Science & Engineering',
        ];

        const filteredAcadFiles = academicFiles.filter(f => {
          if (f.tab !== activeAcademicTab) return false;
          if (f.year !== acadFilterYear) return false;
          if (acadFilterYear === '1st Year') return true;
          return f.branch === acadFilterBranch;
        });

        const toDriveDownload = (link: string) => {
          const match = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
          if (match) return `https://drive.google.com/uc?export=download&id=${match[1]}`;
          return link;
        };

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '24px' }} className="animate-fade-in">

            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #3d5a80 0%, #5e60ce 100%)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 28px rgba(61,90,128,0.25)',
            }}>
              <div style={{ position: 'absolute', top: 0, left: '-50%', width: '100%', height: '100%', background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0) 100%)', transform: 'skewX(-25deg)', animation: 'shimmer 4s infinite linear' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 2 }}>
                <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: '14px', padding: '12px', display: 'flex' }}>
                  <GraduationCap size={28} color="#fff" />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0 }}>Academics</h2>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.82)', margin: '3px 0 0', fontWeight: '500' }}>Your academic hub at NIT Hamirpur</p>
                </div>
              </div>
            </div>

            {/* Sub-tabs pill row — horizontal scroll */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {ACAD_TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveAcademicTab(t.id)}
                  style={{
                    flexShrink: 0,
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: activeAcademicTab === t.id ? 'none' : '1px solid var(--border-subtle)',
                    background: activeAcademicTab === t.id ? 'linear-gradient(135deg, #3d5a80, #5e60ce)' : 'var(--bg-hover)',
                    color: activeAcademicTab === t.id ? '#fff' : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>

            {/* Filters: Year + Branch */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: '120px' }}>
                <label style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-placeholder)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Year</label>
                <select
                  value={acadFilterYear}
                  onChange={e => setAcadFilterYear(e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', backgroundColor: '#fff', fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', cursor: 'pointer' }}
                >
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {acadFilterYear !== '1st Year' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 2, minWidth: '160px' }}>
                  <label style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-placeholder)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Branch</label>
                  <select
                    value={acadFilterBranch}
                    onChange={e => setAcadFilterBranch(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', backgroundColor: '#fff', fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', cursor: 'pointer' }}
                  >
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* File Cards */}
            {filteredAcadFiles.length === 0 ? (
              <div className="glass-panel" style={{ padding: '40px 24px', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
                <FileText size={40} color="var(--text-placeholder)" style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-muted)', margin: 0 }}>No files yet</p>
                <p style={{ fontSize: '12px', color: 'var(--text-placeholder)', marginTop: '6px' }}>
                  {ACAD_TABS.find(t => t.id === activeAcademicTab)?.label} files for{' '}
                  {acadFilterYear}{acadFilterYear !== '1st Year' ? ` · ${acadFilterBranch}` : ''} will appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredAcadFiles.map(file => (
                  <div key={file.id} className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <div style={{ background: 'linear-gradient(135deg, #3d5a80, #5e60ce)', borderRadius: '10px', padding: '10px', display: 'flex', flexShrink: 0 }}>
                        <FileText size={20} color="#fff" />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.title}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{file.subject}</p>
                        {file.description && <p style={{ fontSize: '11px', color: 'var(--text-placeholder)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.description}</p>}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: '#3d5a8018', color: '#3d5a80', padding: '2px 7px', borderRadius: '6px' }}>{file.year}</span>
                          {file.year !== '1st Year' && <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: '#5e60ce18', color: '#5e60ce', padding: '2px 7px', borderRadius: '6px' }}>{file.branch}</span>}
                        </div>
                      </div>
                    </div>
                    <a
                      href={toDriveDownload(file.drive_link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none', flexShrink: 0 }}
                    >
                      <button className="btn-primary" style={{ padding: '8px 14px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Download size={13} /> Download
                      </button>
                    </a>
                  </div>
                ))}
              </div>
            )}

          </div>
        );
      }

      default:
        return (
          <div style={styles.placeholderTab} className="glass-panel animate-fade-in">
            <Sparkles size={48} color="var(--pine-primary)" style={{ marginBottom: 16 }} />
            <h2>{menuItems.find(i => i.id === activeTab)?.label} Page</h2>
            <p style={styles.placeholderText}>
              The detailed content for this page is being developed in our incremental tabs phase. Check back shortly!
            </p>
            <button 
              onClick={() => setActiveTab('home')}
              className="btn-primary"
              style={{ marginTop: 20 }}
            >
              Back to Home
            </button>
          </div>
        );
    }
  };

  return (
    <div style={styles.dashboardContainer}>
      {/* Sidebar Navigation - Desktop only */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.sidebarLogo}>
            {isDevModeActive ? (
              <>
                <Sparkles size={24} color="#e76f51" />
                <h1 style={{ ...styles.sidebarTitle, color: '#e76f51' }}>Dev Console</h1>
              </>
            ) : (
              <>
                <Mountain size={24} color="var(--text-light)" />
                <h1 style={styles.sidebarTitle}>NITH Connect</h1>
              </>
            )}
          </div>
        </div>

        <nav style={styles.sidebarNav}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  ...styles.navLink,
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  fontWeight: isActive ? '600' : '400',
                }}
              >
                <Icon size={18} color={isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {user.role !== 'guest' && (
            <button 
              onClick={() => setIsProfileOpen(true)}
              style={styles.navLink}
            >
              <User size={18} color="rgba(255, 255, 255, 0.7)" />
              <span>Profile</span>
            </button>
          )}
        </nav>

        {/* Sidebar Footer User Details */}
        <div style={styles.sidebarFooter}>
          <div style={styles.userThumb}>
            <div style={styles.userAvatarPlaceholder}>
              {user.name.charAt(0)}
            </div>
            <div style={styles.userDetails}>
              <div style={styles.userName}>{user.name}</div>
              <div style={styles.userRole}>
                {isDevModeActive ? 'Developer Mode' : (user.role === 'guest' ? 'Campus Guest' : 'Student')}
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={styles.logoutBtn}
            disabled={isPending}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={styles.mainWrapper}>
        {/* App Topbar - Replicating screenshot */}
        <header style={styles.topbar} className="glass-panel">
          <div style={styles.topbarLeft}>
            {/* Profile Pill */}
            {user.role !== 'guest' && (
              <button 
                onClick={() => setIsProfileOpen(true)}
                style={styles.idPill}
              >
                <div style={styles.idPillIcon}>
                  <User size={14} color="#ffffff" />
                </div>
                <span style={styles.idPillText}>Profile</span>
              </button>
            )}
          </div>
          
          {/* Center Lotus Logo */}
          <div style={styles.topbarCenter}>
            <div style={styles.lotusIcon}>
              <Mountain size={20} color="var(--pine-primary)" />
            </div>
          </div>

          <div style={styles.topbarRight}>
            <button 
              onClick={() => showToast('Notifications: All caught up!', 'info')}
              style={styles.iconBtn}
            >
              <Bell size={18} color="var(--pine-deep)" />
            </button>
          </div>
        </header>

        {/* Render Page Content based on selected tab */}
        <main style={styles.contentContainer}>
          {renderActiveTabContent()}
        </main>
      </div>

      {/* Dynamic Sticky Bottom Navigation Bar - Mobile only */}
      <nav style={styles.bottomNav} className="glass-panel nith-bottom-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={styles.bottomNavBtn}
            >
              <div style={{
                ...styles.bottomNavIconWrapper,
                backgroundColor: isActive ? 'var(--pine-primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
              }}>
                <Icon size={20} />
              </div>
              <span style={{
                ...styles.bottomNavLabel,
                color: isActive ? 'var(--pine-deep)' : 'var(--text-muted)',
                fontWeight: isActive ? '600' : '400',
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Profile Sidebar Drawer (Slides left-to-right smoothly) */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isProfileOpen ? 'rgba(14, 61, 47, 0.3)' : 'transparent',
          backdropFilter: isProfileOpen ? 'blur(6px)' : 'none',
          pointerEvents: isProfileOpen ? 'auto' : 'none',
          transition: 'all 0.3s ease-in-out',
          zIndex: 1100,
        }}
        onClick={() => setIsProfileOpen(false)}
      >
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            maxWidth: '380px',
            height: '100%',
            backgroundColor: '#ffffff',
            borderRight: '1px solid var(--border-subtle)',
            boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)',
            transform: isProfileOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '16px'
          }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--pine-deep)', margin: 0 }}>Student Profile</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Manage achievements & badges</p>
            </div>
            <button 
              onClick={() => setIsProfileOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.02)',
                transition: 'all 0.2s'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Profile Quick Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '24px', textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: `3px solid ${user.role === 'developer' ? '#f4a261' : 'var(--pine-primary)'}`,
              backgroundColor: 'var(--pine-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: '800',
              color: 'var(--pine-deep)',
              boxShadow: '0 4px 12px rgba(42, 157, 143, 0.15)'
            }}>
              {user.name.charAt(0)}
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{user.name}</h4>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                color: user.role === 'developer' ? '#e76f51' : 'var(--pine-primary)',
                backgroundColor: user.role === 'developer' ? 'rgba(231, 111, 81, 0.1)' : 'rgba(42, 157, 143, 0.1)',
                padding: '2px 8px',
                borderRadius: '12px',
                marginTop: '4px',
                display: 'inline-block'
              }}>
                {user.role === 'developer' ? 'App Developer 🛠️' : 'Student Scholar'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            {/* Badges & Achievements Row (Max 3 Badges) */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-placeholder)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                Earned Badges (Max 3)
              </span>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                {/* 1. Developer / Pioneer Badge */}
                {user.role === 'developer' ? (
                  <div 
                    title="The Primordial: Architect of NITH Connect. Creator of the universe."
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '80px',
                      textAlign: 'center',
                      gap: '4px',
                      cursor: 'help'
                    }}
                  >
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7b2cbf, #3c096c)',
                      border: '2px solid #e0aaff',
                      boxShadow: '0 0 10px rgba(123, 44, 191, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      🌌
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-main)' }}>Primordial</span>
                  </div>
                ) : (
                  <div 
                    title="Beta Pioneer: Awarded to the early founders who joined during the beta launch phase."
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '80px',
                      textAlign: 'center',
                      gap: '4px',
                      cursor: 'help'
                    }}
                  >
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #e76f51, #f4a261)',
                      border: '2px solid #ffffff',
                      boxShadow: '0 4px 10px rgba(231, 111, 81, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      🚀
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-main)' }}>Beta Pioneer</span>
                  </div>
                )}

                {/* 2. Pathfinder Badge (Based on feedback count) */}
                {userAchievements.pathfinderTier > 0 && (
                  <div 
                    title={`Pathfinder Tier ${'I'.repeat(userAchievements.pathfinderTier)}: Granted for submitting suggestions to improve campus life.`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '80px',
                      textAlign: 'center',
                      gap: '4px',
                      cursor: 'help'
                    }}
                  >
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2a9d8f, #125b44)',
                      border: '2px solid #a7f3d0',
                      boxShadow: '0 4px 10px rgba(42, 157, 143, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      🧭
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-main)' }}>
                      Pathfinder {'I'.repeat(userAchievements.pathfinderTier)}
                    </span>
                  </div>
                )}

                {/* 3. The Visionaries Badge (Awarded by developer if approved suggestion) */}
                {userAchievements.isVisionary && (
                  <div 
                    title="The Visionary: Awarded by the Developer for contributing a premium, game-changing feature suggestion."
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '80px',
                      textAlign: 'center',
                      gap: '4px',
                      cursor: 'help'
                    }}
                  >
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #e9c46a, #e76f51)',
                      border: '2px solid #ffe3a8',
                      boxShadow: '0 4px 10px rgba(233, 196, 106, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      💡
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-main)' }}>The Visionary</span>
                  </div>
                )}
              </div>
            </div>

            {/* Suggestion & Improvement Area */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <button
                onClick={() => setIsSuggestFormOpen(!isSuggestFormOpen)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--pine-primary)',
                  backgroundColor: 'rgba(42, 157, 143, 0.04)',
                  color: 'var(--pine-primary)',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>💡 Suggest an Improvement</span>
              </button>

              {isSuggestFormOpen && (
                <div style={{ 
                  marginTop: '10px', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  backgroundColor: 'rgba(0,0,0,0.01)', 
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <textarea
                    placeholder="Suggest a new badge, feature, or improvement..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      outline: 'none',
                      fontSize: '12px',
                      resize: 'vertical'
                    }}
                  />
                  <button
                    disabled={isSubmittingFeedback || !feedbackText.trim()}
                    onClick={async () => {
                      setIsSubmittingFeedback(true);
                      const success = await submitFeedbackAction(feedbackText, user.name, user.email);
                      setIsSubmittingFeedback(false);
                      if (success) {
                        showToast("Thank you! Suggestion submitted successfully.", "success");
                        setFeedbackText('');
                        setIsSuggestFormOpen(false);
                        loadUserAchievements(); // instantly refresh badges!
                      } else {
                        showToast("Failed to submit suggestion.", "error");
                      }
                    }}
                    className="btn-primary"
                    style={{ padding: '6px 12px', fontSize: '11px', fontWeight: '800' }}
                  >
                    {isSubmittingFeedback ? 'Submitting...' : 'Submit Suggestion'}
                  </button>
                </div>
              )}
            </div>
          </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-placeholder)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Settings</span>
              
              <button 
                onClick={() => showToast('Profile settings are read-only.', 'info')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: '#ffffff',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.2s'
                }}
              >
                <span>Department:</span>
                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontWeight: '500' }}>{user.department || 'Visitor'}</span>
              </button>

              <button 
                onClick={() => showToast('Profile settings are read-only.', 'info')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: '#ffffff',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.2s'
                }}
              >
                <span>Roll Number:</span>
                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontWeight: '500' }}>{user.roll_number || 'N/A'}</span>
              </button>

              <button 
                onClick={() => showToast('Profile settings are read-only.', 'info')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: '#ffffff',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.2s'
                }}
              >
                <span>Hostel Residence:</span>
                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontWeight: '500' }}>{user.hostel || 'Guest House'}</span>
              </button>
            </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {user.role === 'developer' && (
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  const nextDevMode = !isDevModeActive;
                  setIsDevModeActive(nextDevMode);
                  setActiveTab(nextDevMode ? 'dev_tools' : 'home');
                  showToast(nextDevMode ? 'Entered Developer Mode 🛠️' : 'Returned to Student Mode 🎓', 'success');
                }}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: isDevModeActive ? '#2a9d8f' : '#e76f51',
                  background: isDevModeActive ? 'linear-gradient(135deg, #2a9d8f 0%, #125b44 100%)' : 'linear-gradient(135deg, #e76f51 0%, #d95d39 100%)',
                  borderColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: '700',
                  boxShadow: 'none',
                  color: '#ffffff'
                }}
              >
                <Sparkles size={16} />
                <span>{isDevModeActive ? 'Exit Developer Mode' : 'Enter Developer Mode'}</span>
              </button>
            )}
            <button 
              onClick={() => setIsProfileOpen(false)}
              className="btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              Close Profile
            </button>
            <button 
              onClick={() => {
                setIsProfileOpen(false);
                handleLogout();
              }}
              className="btn-secondary"
              style={{ 
                width: '100%', 
                padding: '12px', 
                color: '#e76f51', 
                borderColor: 'rgba(231, 111, 81, 0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                fontWeight: '700'
              }}
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Links Modal */}
      {isQuickLinksOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsQuickLinksOpen(false)}>
          <div 
            style={styles.idCardModal} 
            className="glass-panel animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Campus Quick Links</h3>
              <button 
                onClick={() => setIsQuickLinksOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} />
              </button>
            </div>

            {/* Links List */}
            <div style={styles.quickLinksModalContent}>
              <p style={{ ...styles.placeholderText, marginBottom: 16, textAlign: 'center' }}>
                Direct access to NITH academic and administrative portals.
              </p>
              
              <a href="https://nith.ac.in" target="_blank" rel="noopener noreferrer" style={styles.quickLinkModalItem}>
                <span style={styles.quickLinkModalLabel}>NITH Official Website</span>
                <ExternalLink size={14} color="var(--pine-primary)" />
              </a>

              <a href="https://results.nith.ac.in" target="_blank" rel="noopener noreferrer" style={styles.quickLinkModalItem}>
                <span style={styles.quickLinkModalLabel}>Student Results Portal</span>
                <ExternalLink size={14} color="var(--pine-primary)" />
              </a>

              <a href="http://academic.nith.ac.in" target="_blank" rel="noopener noreferrer" style={styles.quickLinkModalItem}>
                <span style={styles.quickLinkModalLabel}>Academic Student Portal</span>
                <ExternalLink size={14} color="var(--pine-primary)" />
              </a>

              <a href="https://nith.ac.in/library" target="_blank" rel="noopener noreferrer" style={styles.quickLinkModalItem}>
                <span style={styles.quickLinkModalLabel}>Central Library Portal</span>
                <ExternalLink size={14} color="var(--pine-primary)" />
              </a>
            </div>

            <button 
              onClick={() => setIsQuickLinksOpen(false)}
              className="btn-secondary" 
              style={{ width: '100%', marginTop: 20, padding: '10px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Create Announcement Modal */}
      {isCreateAnnouncementOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsCreateAnnouncementOpen(false)}>
          <div 
            style={styles.idCardModal} 
            className="glass-panel animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Publish Announcement</h3>
              <button 
                onClick={() => setIsCreateAnnouncementOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
              <div>
                <label style={styles.formLabel}>Event Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sleep & Digital Wellbeing"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  style={styles.formInput}
                />
              </div>

              <div>
                <label style={styles.formLabel}>Publisher / Host Club</label>
                <input 
                  type="text" 
                  placeholder="e.g. Flourishing Hub"
                  value={newPostPub}
                  onChange={(e) => setNewPostPub(e.target.value)}
                  style={styles.formInput}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Target Audience</label>
                  <select 
                    value={newPostTarget}
                    onChange={(e) => setNewPostTarget(e.target.value)}
                    style={styles.formInput}
                  >
                    <option value="All Students">All Students</option>
                    <option value="Only for Boys">Only for Boys</option>
                    <option value="Only for Girls">Only for Girls</option>
                    <option value="CSE Students">CSE Students</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Banner Theme</label>
                  <select 
                    value={newPostTheme}
                    onChange={(e) => setNewPostTheme(e.target.value)}
                    style={styles.formInput}
                  >
                    <option value="sunset">Sunset Orange</option>
                    <option value="ocean">Ocean Blue</option>
                    <option value="pine">Pine Green</option>
                    <option value="lavender">Lavender Violet</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Event Date</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Saturday, 4 July 2026"
                    value={newPostDate}
                    onChange={(e) => setNewPostDate(e.target.value)}
                    style={styles.formInput}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Event Time</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 5:30 PM - 6:15 PM"
                    value={newPostTime}
                    onChange={(e) => setNewPostTime(e.target.value)}
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div>
                <label style={styles.formLabel}>Location / Venue</label>
                <input 
                  type="text" 
                  placeholder="e.g. TV Room, Hostel 15"
                  value={newPostLoc}
                  onChange={(e) => setNewPostLoc(e.target.value)}
                  style={styles.formInput}
                />
              </div>

              <div>
                <label style={styles.formLabel}>Description</label>
                <textarea 
                  placeholder="Tell students about the event..."
                  value={newPostDesc}
                  onChange={(e) => setNewPostDesc(e.target.value)}
                  style={{ ...styles.formInput, minHeight: '80px', resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ ...styles.idCardActions, marginTop: '20px' }}>
              <button 
                onClick={async () => {
                  if (!newPostTitle || !newPostPub || !newPostDesc) {
                    showToast('Please enter a Title, Publisher, and Description.', 'error');
                    return;
                  }
                  const isDeveloper = user.role === 'developer';
                  const success = await createAnnouncementAction(
                    newPostTitle,
                    newPostDesc,
                    newPostTarget,
                    newPostDate || 'TBD',
                    newPostTime || 'TBD',
                    newPostLoc || 'TBD',
                    newPostPub,
                    newPostTheme,
                    isDeveloper,
                    user.id
                  );
                  if (success) {
                    setNewPostTitle('');
                    setNewPostDesc('');
                    setNewPostPub('');
                    setNewPostDate('');
                    setNewPostTime('');
                    setNewPostLoc('');
                    setIsCreateAnnouncementOpen(false);
                    loadAnnouncements();
                    showToast(isDeveloper 
                      ? 'Announcement published successfully.' 
                      : 'Submitted! Sent to developer for approval.', 'success');
                  } else {
                    showToast('Failed to publish announcement.', 'error');
                  }
                }}
                className="btn-primary" 
                style={{ flex: 1, padding: '10px' }}
              >
                Publish Now
              </button>
              <button 
                onClick={() => setIsCreateAnnouncementOpen(false)}
                className="btn-secondary" 
                style={{ flex: 1, padding: '10px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Weekly Timetable Modal */}
      {isTimetableModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsTimetableModalOpen(false)}>
          <div 
            style={{ ...styles.idCardModal, maxWidth: '580px', width: '92%' }} 
            className="glass-panel animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Weekly Timetable 📅</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Academic Class Schedule (Mon - Fri)</p>
              </div>
              <button 
                onClick={() => setIsTimetableModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} />
              </button>
            </div>

            {(() => {
              const customTimetable = approvedTimetables.find(t => {
                if (selectedYear === '1st Year') {
                  return t.year === selectedYear && t.section === selectedSection;
                } else {
                  return t.year === selectedYear && t.branch === selectedBranch;
                }
              });

              if (customTimetable && timetableModalViewMode === 'image') {
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Mode Toggle Button inside modal */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <button
                        onClick={() => setTimetableModalViewMode('grid')}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: 'transparent',
                          color: 'var(--text-main)',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        Live Grid View
                      </button>
                      <button
                        onClick={() => setTimetableModalViewMode('image')}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px solid var(--pine-primary)',
                          backgroundColor: 'var(--pine-primary)',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        Official Image View
                      </button>
                    </div>

                    <div style={{ width: '100%', maxHeight: '55vh', overflow: 'auto', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                      <img 
                        src={customTimetable.file_data} 
                        alt="Official Timetable" 
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                    </div>
                  </div>
                );
              }

              return (
                <>
                  {customTimetable && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                      <button
                        onClick={() => setTimetableModalViewMode('grid')}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px solid var(--pine-primary)',
                          backgroundColor: 'var(--pine-primary)',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        Live Grid View
                      </button>
                      <button
                        onClick={() => setTimetableModalViewMode('image')}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: 'transparent',
                          color: 'var(--text-main)',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        Official Image View
                      </button>
                    </div>
                  )}

                  {/* Day Picker Tabs inside Modal */}
                  <div style={{
                    display: 'flex',
                    gap: '6px',
                    overflowX: 'auto',
                    marginBottom: '16px',
                    borderBottom: '1px solid var(--border-subtle)',
                    paddingBottom: '8px',
                    scrollbarWidth: 'none'
                  }}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                      const isSelected = selectedTimetableDay === day;
                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedTimetableDay(day)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: '1px solid var(--border-subtle)',
                            backgroundColor: isSelected ? 'var(--pine-primary)' : 'transparent',
                            color: isSelected ? '#ffffff' : 'var(--text-main)',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>

                  {/* Vertical List of Time Slots */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    maxHeight: '45vh',
                    overflowY: 'auto',
                    paddingRight: '6px',
                    scrollbarWidth: 'thin'
                  }}>
                    {(weeklyTimetable[selectedTimetableDay] || []).length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No classes scheduled.
                      </div>
                    ) : (
                      (weeklyTimetable[selectedTimetableDay] || []).map((slot, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-subtle)',
                            backgroundColor: slot.isLunch ? 'rgba(244, 162, 97, 0.05)' : '#ffffff',
                            borderLeft: `5px solid ${slot.isLunch ? '#f4a261' : 'var(--pine-primary)'}`,
                          }}
                        >
                          <div style={{
                            width: '65px',
                            fontSize: '12px',
                            fontWeight: '800',
                            color: slot.isLunch ? '#e76f51' : 'var(--pine-deep)',
                            flexShrink: 0
                          }}>
                            {slot.time}
                          </div>

                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                              {slot.subject}
                            </h4>
                            {!slot.isLunch && (
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {slot.code} • Room {slot.room}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              );
            })()}

            {/* Close action */}
            <div style={{ ...styles.idCardActions, marginTop: '20px' }}>
              <button 
                onClick={() => setIsTimetableModalOpen(false)}
                className="btn-primary" 
                style={{ flex: 1, padding: '10px' }}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Timetable Modal */}
      {isUploadTimetableOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsUploadTimetableOpen(false)}>
          <div 
            style={{ ...styles.idCardModal, maxWidth: '480px', width: '92%' }} 
            className="glass-panel animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Upload Timetable 📅</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Submit the official timetable to the developer for review
                </p>
              </div>
              <button 
                onClick={() => setIsUploadTimetableOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Selected Year</label>
                  <input 
                    type="text" 
                    value={uploadTimetableYear} 
                    disabled 
                    style={{ ...styles.formInput, backgroundColor: 'rgba(0,0,0,0.03)', color: 'var(--text-muted)', padding: '8px 12px' }} 
                  />
                </div>
                {uploadTimetableYear === '1st Year' ? (
                  <div style={{ flex: 1 }}>
                    <label style={styles.formLabel}>Selected Section</label>
                    <input 
                      type="text" 
                      value={`Section ${uploadTimetableSec}`} 
                      disabled 
                      style={{ ...styles.formInput, backgroundColor: 'rgba(0,0,0,0.03)', color: 'var(--text-muted)', padding: '8px 12px' }} 
                    />
                  </div>
                ) : (
                  <>
                    <div style={{ flex: 1 }}>
                      <label style={styles.formLabel}>Selected Branch</label>
                      <input 
                        type="text" 
                        value={uploadTimetableBranch} 
                        disabled 
                        style={{ ...styles.formInput, backgroundColor: 'rgba(0,0,0,0.03)', color: 'var(--text-muted)', padding: '8px 12px' }} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={styles.formLabel}>Selected Section</label>
                      <input 
                        type="text" 
                        value={`Section ${uploadTimetableSec}`} 
                        disabled 
                        style={{ ...styles.formInput, backgroundColor: 'rgba(0,0,0,0.03)', color: 'var(--text-muted)', padding: '8px 12px' }} 
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <label style={styles.formLabel}>Timetable Image (PNG/JPG)</label>
                <div 
                  style={{
                    border: '2px dashed var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '24px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: 'rgba(0,0,0,0.01)',
                    position: 'relative'
                  }}
                >
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setUploadTimetableFile(reader.result as string);
                          setUploadTimetableFileName(file.name);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                  {uploadTimetableFile ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                        <img src={uploadTimetableFile} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>
                        {uploadTimetableFileName}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--pine-primary)' }}>Click to replace file</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <Download size={24} style={{ color: 'var(--text-placeholder)', opacity: 0.7 }} />
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>Choose Timetable Image</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Drag & drop or click to upload</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ ...styles.idCardActions, marginTop: '20px' }}>
              <button 
                onClick={async () => {
                  if (!uploadTimetableFile) {
                    showToast('Please select a timetable image to upload.', 'error');
                    return;
                  }
                  setIsSubmittingTimetable(true);
                  const success = await submitTimetableAction(
                    uploadTimetableYear,
                    uploadTimetableSec,
                    uploadTimetableFile,
                    uploadTimetableFileName,
                    user.name,
                    user.email,
                    uploadTimetableBranch
                  );
                  setIsSubmittingTimetable(false);
                  if (success) {
                    showToast('Success! Timetable sent to developer for review.', 'success');
                    setIsUploadTimetableOpen(false);
                    loadTimetablesData();
                  } else {
                    showToast('Failed to submit timetable. Try again.', 'error');
                  }
                }}
                className="btn-primary" 
                disabled={isSubmittingTimetable}
                style={{ flex: 1, padding: '10px' }}
              >
                {isSubmittingTimetable ? 'Submitting...' : 'Submit for Review'}
              </button>
              <button 
                onClick={() => setIsUploadTimetableOpen(false)}
                className="btn-secondary" 
                disabled={isSubmittingTimetable}
                style={{ flex: 1, padding: '10px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Club Modal */}
      {isRegisterClubOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsRegisterClubOpen(false)}>
          <div 
            style={{ ...styles.idCardModal, maxWidth: '480px', width: '92%' }} 
            className="glass-panel animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Register a Club 🎪</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Submit details of your club or society to the developer for listing approval
                </p>
              </div>
              <button 
                onClick={() => setIsRegisterClubOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Club Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. English Debating Club, SPEC..." 
                    value={newClubName} 
                    onChange={(e) => setNewClubName(e.target.value)} 
                    style={styles.formInput} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Club Category</label>
                  <select 
                    value={newClubCategory} 
                    onChange={(e) => setNewClubCategory(e.target.value)} 
                    style={{ ...styles.formInput, padding: '8px 12px' }}
                  >
                    <option value="cultural">Cultural Club</option>
                    <option value="technical">Technical Club</option>
                    <option value="literary">Literary / Hobby Club</option>
                    <option value="sports">Sports Club / Gym</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>President / Coordinator Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Rahul Sharma" 
                    value={newClubPresidentName} 
                    onChange={(e) => setNewClubPresidentName(e.target.value)} 
                    style={styles.formInput} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Official Email (for Admin access)</label>
                  <input 
                    type="email" 
                    placeholder="e.g. president@nith.ac.in" 
                    value={newClubPresidentEmail} 
                    onChange={(e) => setNewClubPresidentEmail(e.target.value)} 
                    style={styles.formInput} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Leader Designation</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Coordinator, President, Lead" 
                    value={newClubPresidentDesignation} 
                    onChange={(e) => setNewClubPresidentDesignation(e.target.value)} 
                    style={styles.formInput} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Club Domains (comma-separated)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Web Dev, Design, PR, Core" 
                    value={newClubDomains} 
                    onChange={(e) => setNewClubDomains(e.target.value)} 
                    style={styles.formInput} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Contact Link / Handle</label>
                  <input 
                    type="text" 
                    placeholder="e.g. instagram.com/clubname or email" 
                    value={newClubContact} 
                    onChange={(e) => setNewClubContact(e.target.value)} 
                    style={styles.formInput} 
                  />
                </div>
              </div>

              <div>
                <label style={styles.formLabel}>Description & Vibe</label>
                <textarea 
                  placeholder="What is this club about? Focus, activities, fests details..." 
                  value={newClubDesc} 
                  onChange={(e) => setNewClubDesc(e.target.value)} 
                  style={{ ...styles.formInput, minHeight: '80px', resize: 'vertical' }} 
                />
              </div>
            </div>

            <div style={{ ...styles.idCardActions, marginTop: '20px' }}>
              <button 
                onClick={async () => {
                  if (
                    !newClubName.trim() || 
                    !newClubDesc.trim() || 
                    !newClubContact.trim() || 
                    !newClubPresidentName.trim() || 
                    !newClubPresidentEmail.trim()
                  ) {
                    showToast('Please fill out all required fields.', 'error');
                    return;
                  }
                  setIsSubmittingClub(true);
                  const success = await submitClubRequestAction(
                    newClubName,
                    newClubDesc,
                    newClubCategory,
                    newClubContact,
                    newClubPresidentName,
                    newClubPresidentEmail,
                    newClubPresidentDesignation,
                    newClubDomains,
                    user.name,
                    user.email
                  );
                  setIsSubmittingClub(true);
                  if (success) {
                    showToast('Success! Club request submitted to developer for review.', 'success');
                    setNewClubName('');
                    setNewClubDesc('');
                    setNewClubContact('');
                    setNewClubPresidentName('');
                    setNewClubPresidentEmail('');
                    setNewClubPresidentDesignation('President/Coordinator');
                    setNewClubDomains('');
                    setIsRegisterClubOpen(false);
                    await loadClubsData();
                  } else {
                    showToast('Failed to submit request. Try again.', 'error');
                  }
                  setIsSubmittingClub(false);
                }}
                className="btn-primary" 
                disabled={isSubmittingClub}
                style={{ flex: 1, padding: '10px' }}
              >
                {isSubmittingClub ? 'Submitting...' : 'Submit Request'}
              </button>
              <button 
                onClick={() => setIsRegisterClubOpen(false)}
                className="btn-secondary" 
                disabled={isSubmittingClub}
                style={{ flex: 1, padding: '10px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hostel Mess Menu Modal */}
      {activeHostelMenu && (
        <div style={styles.modalOverlay} onClick={() => setActiveHostelMenu(null)}>
          <div 
            style={{ ...styles.idCardModal, maxWidth: '500px', width: '92%' }} 
            className="glass-panel animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>{activeHostelMenu} Mess Menu</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Daily food menu details</p>
              </div>
              <button 
                onClick={() => setActiveHostelMenu(null)}
                style={styles.modalCloseBtn}
              >
                <X size={20} />
              </button>
            </div>

            {/* Day Switcher */}
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              overflowX: 'auto', 
              paddingBottom: '10px', 
              marginBottom: '14px', 
              borderBottom: '1px solid var(--border-subtle)',
              scrollbarWidth: 'none'
            }}>
              {days.map((day) => {
                const isSelected = selectedDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '16px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--pine-primary)' : 'transparent',
                      color: isSelected ? '#ffffff' : 'var(--text-main)',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Meals Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '4px' }}>
              {(['breakfast', 'lunch', 'snacks', 'dinner'] as const).map((meal) => {
                let mealMenuText = 'No menu uploaded';
                if (messMenu) {
                  if (meal === 'breakfast') mealMenuText = messMenu.breakfast || 'No menu uploaded';
                  else if (meal === 'lunch') mealMenuText = messMenu.lunch || 'No menu uploaded';
                  else if (meal === 'snacks') mealMenuText = messMenu.snacks || 'No menu uploaded';
                  else if (meal === 'dinner') mealMenuText = messMenu.dinner || 'No menu uploaded';
                }
                return (
                  <div 
                    key={meal}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      borderLeft: '4px solid var(--pine-primary)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--pine-deep)', textTransform: 'uppercase' }}>
                        {meal}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {getMealTime(meal)}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-main)', margin: 0, lineHeight: '1.4' }}>
                      {mealMenuText}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Close action */}
            <div style={{ ...styles.idCardActions, marginTop: '20px' }}>
              <button 
                onClick={() => setActiveHostelMenu(null)}
                className="btn-primary" 
                style={{ flex: 1, padding: '10px' }}
              >
                Close Mess Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Marketplace Listing Modal */}
      {isAddListingOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsAddListingOpen(false)}>
          <div 
            style={{ ...styles.idCardModal, maxWidth: '520px', width: '92%' }} 
            className="glass-panel animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>List Item for Sale 🏷️</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Upload product photos, description, and WhatsApp details</p>
              </div>
              <button 
                onClick={() => setIsAddListingOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!newListingTitle || !newListingSellingPrice || !newListingContact) {
                showToast('Please enter a Title, Price, and Contact.', 'error');
                return;
              }

              if (newListingContact.replace(/\D/g, '').length !== 10) {
                showToast('Please enter a valid 10-digit WhatsApp number.', 'error');
                return;
              }

              const originalVal = Number(newListingOriginalPrice) || Number(newListingSellingPrice);
              const sellingVal = Number(newListingSellingPrice);

              const success = await createMarketplaceItemAction(
                newListingTitle,
                newListingDesc,
                originalVal,
                sellingVal,
                newListingContact,
                newListingImage || '',
                user.id,
                user.name,
                newListingCategory
              );

              if (success) {
                setNewListingTitle('');
                setNewListingDesc('');
                setNewListingOriginalPrice('');
                setNewListingSellingPrice('');
                setNewListingContact('');
                setNewListingImage('');
                setNewListingCategory('Others');
                setIsAddListingOpen(false);
                loadMarketplaceItems();
                showToast('Success! Your listing has been published.', 'success');
              } else {
                showToast('Failed to publish listing.', 'error');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px', scrollbarWidth: 'thin' }}>
              
              {/* Image upload */}
              <div>
                <label style={styles.formLabel}>Product Image</label>
                <div style={{
                  border: '2px dashed var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(0,0,0,0.01)',
                  position: 'relative'
                }}>
                  {newListingImage ? (
                    <div style={{ position: 'relative', height: '140px', width: '100%' }}>
                      <img 
                        src={newListingImage} 
                        alt="Product Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setNewListingImage('')}
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <Upload size={24} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--pine-primary)' }}>Click to upload product photo</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PNG, JPG up to 2MB (Converted to Base64)</span>
                    </div>
                  )}
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewListingImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>

              {/* Title & Category Row */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 2 }}>
                  <label style={styles.formLabel}>Item Title *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Hercules Bicycle, Engineering Drafter"
                    value={newListingTitle}
                    onChange={(e) => setNewListingTitle(e.target.value)}
                    style={styles.formInput}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Category</label>
                  <select 
                    value={newListingCategory}
                    onChange={(e) => setNewListingCategory(e.target.value)}
                    style={styles.formInput}
                  >
                    {['Books', 'Electronics', 'Cycle', 'Hostel Gear', 'Others'].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={styles.formLabel}>Description</label>
                <textarea 
                  placeholder="Describe item condition, usage details, accessories included..."
                  value={newListingDesc}
                  onChange={(e) => setNewListingDesc(e.target.value)}
                  style={{ ...styles.formInput, minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              {/* Price row */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Original Price (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 500"
                    value={newListingOriginalPrice}
                    onChange={(e) => setNewListingOriginalPrice(e.target.value)}
                    style={styles.formInput}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Selling Price (₹) *</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 100"
                    value={newListingSellingPrice}
                    onChange={(e) => setNewListingSellingPrice(e.target.value)}
                    style={styles.formInput}
                    required
                  />
                </div>

                {/* Live Discount calculation */}
                {Number(newListingOriginalPrice) > Number(newListingSellingPrice) && Number(newListingOriginalPrice) > 0 && (
                  <div style={{
                    flex: 1,
                    backgroundColor: 'rgba(231, 111, 81, 0.1)',
                    border: '1px solid #e76f51',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    textAlign: 'center',
                    marginTop: '18px'
                  }}>
                    <span style={{ fontSize: '10px', color: '#e76f51', fontWeight: 'bold', textTransform: 'uppercase' }}>Computed Discount</span>
                    <h5 style={{ fontSize: '13px', color: '#e76f51', fontWeight: '900', margin: '2px 0 0' }}>
                      {Math.round(((Number(newListingOriginalPrice) - Number(newListingSellingPrice)) / Number(newListingOriginalPrice)) * 100)}% OFF
                    </h5>
                  </div>
                )}
              </div>

              {/* Contact number */}
              <div>
                <label style={styles.formLabel}>WhatsApp Contact Number (10-Digit Phone Number) *</label>
                <input 
                  type="tel" 
                  maxLength={10}
                  pattern="[0-9]{10}"
                  placeholder="e.g. 9816012345"
                  value={newListingContact}
                  onChange={(e) => setNewListingContact(e.target.value.replace(/\D/g, ''))}
                  style={styles.formInput}
                  required
                />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Provide a valid 10-digit number for direct WhatsApp text routing.</span>
              </div>

              {/* Actions */}
              <div style={{ ...styles.idCardActions, marginTop: '10px' }}>
                <button 
                  type="submit"
                  className="btn-primary" 
                  style={{ flex: 1, padding: '10px' }}
                >
                  Publish Listing
                </button>
                <button 
                  type="button"
                  onClick={() => setIsAddListingOpen(false)}
                  className="btn-secondary" 
                  style={{ flex: 1, padding: '10px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification popup */}
      {toast.visible && (
        <div 
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: toast.type === 'success' 
              ? 'var(--pine-primary)' 
              : toast.type === 'error' 
                ? '#e76f51' 
                : 'var(--pine-deep)',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '700',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 99999
          }}
          className="glass-panel animate-fade-in"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={16} color="#ffffff" />
          ) : (
            <Info size={16} color="#ffffff" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  dashboardContainer: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg-app)',
    width: '100%',
    position: 'relative',
  },
  sidebar: {
    width: '280px',
    backgroundColor: 'var(--pine-deep)',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    transition: 'var(--transition-smooth)',
  },
  sidebarHeader: {
    padding: '24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  sidebarLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sidebarTitle: {
    fontSize: '20px',
    color: '#ffffff',
    fontWeight: '800',
    fontFamily: 'var(--font-display)',
    margin: 0,
  },
  sidebarNav: {
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    color: 'rgba(255, 255, 255, 0.85)',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    fontSize: '14px',
    transition: 'var(--transition-smooth)',
  },
  sidebarFooter: {
    padding: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  userThumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userAvatarPlaceholder: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--pine-medium)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '18px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
  },
  userRole: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.08)',
    color: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '10px',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'var(--transition-smooth)',
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflowY: 'auto',
    paddingBottom: '80px', // spacing for mobile bottom bar
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    margin: '16px 16px 0 16px',
    borderRadius: 'var(--radius-md)',
  },
  topbarLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  idPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--pine-deep)',
    padding: '6px 14px 6px 6px',
    borderRadius: 'var(--radius-round)',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(14, 61, 47, 0.15)',
    transition: 'var(--transition-bounce)',
  },
  idPillIcon: {
    width: '24px',
    height: '24px',
    borderRadius: 'var(--radius-round)',
    background: 'rgba(255, 255, 255, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  idPillText: {
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  topbarCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lotusIcon: {
    width: '38px',
    height: '38px',
    borderRadius: 'var(--radius-round)',
    background: 'var(--bg-hover)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-subtle)',
    boxShadow: '0 2px 6px rgba(18, 91, 68, 0.05)',
  },
  topbarRight: {
    display: 'flex',
    alignItems: 'center',
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-round)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition-smooth)',
  },
  contentContainer: {
    flex: 1,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  dashboardHome: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '600px',
    margin: '0 auto',
    width: '100%',
  },
  messCard: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  messHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px dotted var(--border-thick)',
    paddingBottom: '12px',
  },
  messTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--pine-deep)',
  },
  dropdownWrapper: {
    display: 'flex',
    gap: '8px',
  },
  messSelect: {
    background: 'var(--bg-input)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-round)',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--text-main)',
    cursor: 'pointer',
    outline: 'none',
  },
  messBody: {
    display: 'flex',
    gap: '16px',
  },
  messVerticalTabs: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100px',
  },
  messTabBtn: {
    padding: '10px 14px',
    borderRadius: 'var(--radius-round)',
    border: '1px solid transparent',
    fontSize: '12px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'var(--transition-smooth)',
  },
  messDetailCard: {
    flex: 1,
    background: '#ffffff',
    border: '2px solid rgba(18, 91, 68, 0.08)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '120px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(18, 91, 68, 0.02)',
  },
  messMenuContent: {
    padding: '16px',
    fontSize: '14px',
    color: 'var(--text-main)',
    lineHeight: '1.5',
    fontWeight: '500',
  },
  messFooterRow: {
    background: 'linear-gradient(135deg, var(--pine-primary) 0%, var(--pine-medium) 100%)',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#ffffff',
  },
  messTime: {
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  broadcastIconBg: {
    width: '20px',
    height: '20px',
    borderRadius: 'var(--radius-round)',
    background: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrBanner: {
    background: 'linear-gradient(135deg, var(--pine-primary) 0%, var(--aqua-primary) 100%)',
    borderRadius: 'var(--radius-md)',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    color: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 6px 20px rgba(18, 91, 68, 0.12)',
  },
  qrBannerGlow: {
    position: 'absolute',
    top: 0,
    left: '-50%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%)',
    transform: 'skewX(-25deg)',
    animation: 'shimmer 4s infinite linear',
  },
  qrBannerText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    zIndex: 2,
  },
  qrBannerTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#ffffff',
  },
  qrBannerSubtitle: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  qrBannerIconBg: {
    zIndex: 2,
  },
  servicesSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  servicesHeader: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--pine-deep)',
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  serviceCard: {
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    minHeight: '96px',
  },
  serviceCardText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  serviceCardTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--pine-deep)',
  },
  serviceCardDesc: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  newBadge: {
    background: 'var(--pine-primary)',
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: 'var(--radius-round)',
    alignSelf: 'flex-start',
    marginTop: '4px',
  },
  serviceCardIllustration: {
    opacity: 0.85,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLinksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
    marginTop: '4px',
  },
  quickLinkItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: 'var(--pine-primary)',
    fontWeight: '600',
    background: 'var(--bg-hover)',
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-subtle)',
  },
  placeholderTab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    maxWidth: '400px',
    lineHeight: '1.6',
    marginTop: '8px',
  },
  bottomNav: {
    position: 'fixed',
    bottom: '16px',
    left: '16px',
    right: '16px',
    height: '64px',
    display: 'none', // Managed by mobile media queries in CSS
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 99,
    padding: '0 10px',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0 8px 30px rgba(18, 91, 68, 0.12)',
  },
  bottomNavBtn: {
    background: 'transparent',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    cursor: 'pointer',
    flex: 1,
  },
  bottomNavIconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-round)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition-bounce)',
  },
  bottomNavLabel: {
    fontSize: '10px',
    fontFamily: 'var(--font-display)',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(14, 61, 47, 0.4)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  idCardModal: {
    width: '100%',
    maxWidth: '380px',
    padding: '24px',
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '12px',
  },
  modalTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--pine-deep)',
  },
  modalCloseBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-round)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition-smooth)',
  },
  idCardLayout: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  idCardBadge: {
    width: '100%',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
    background: 'linear-gradient(135deg, #0e3d2f 0%, #154c3c 60%, #1e6b54 100%)',
    color: '#ffffff',
    position: 'relative',
  },
  idCardHeaderBanner: {
    background: 'rgba(255, 255, 255, 0.06)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    color: '#ffffff',
  },
  idCardHeaderTitle: {
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '2px',
    color: '#ffffff',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  idCardContent: {
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '18px',
  },
  idCardProfileRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    width: '100%',
    borderBottom: '1px dashed rgba(255, 255, 255, 0.15)',
    paddingBottom: '16px',
  },
  idCardAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
    fontWeight: '800',
    border: '2px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
  },
  idCardMainDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  idCardName: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
    textShadow: '0 1px 2px rgba(0,0,0,0.15)',
  },
  idCardRoleText: {
    fontSize: '11px',
    color: '#a7f3d0',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  idCardDetailsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
  },
  idCardDetailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    lineHeight: '1.4',
  },
  idCardLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '500',
  },
  idCardVal: {
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'right',
  },
  idCardQrWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    marginTop: '12px',
    borderTop: '1px dashed rgba(255, 255, 255, 0.15)',
    paddingTop: '20px',
    width: '100%',
  },
  qrScanText: {
    fontSize: '9px',
    color: 'rgba(255, 255, 255, 0.55)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '700',
  },
  idCardActions: {
    display: 'flex',
    gap: '10px',
    width: '100%',
  },
  quickLinksModalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
  },
  quickLinkModalItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-subtle)',
    textDecoration: 'none',
    transition: 'var(--transition-smooth)',
  },
  quickLinkModalLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--pine-deep)',
  },
  feedTabContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    paddingBottom: '80px',
  },
  feedHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  feedHeading: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--pine-deep)',
    letterSpacing: '-0.5px',
  },
  feedSubheading: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  searchBarContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    width: '100%',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-subtle)',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '14px',
    marginLeft: '10px',
    width: '100%',
    color: 'var(--pine-deep)',
  },
  feedStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  emptyFeedState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    textAlign: 'center',
    color: 'var(--text-muted)',
  },
  feedCard: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    border: '1px solid var(--border-subtle)',
    backgroundColor: '#ffffff',
  },
  feedBanner: {
    position: 'relative',
    height: '240px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '24px',
    color: '#ffffff',
  },
  sunsetGradientBanner: {
    background: 'linear-gradient(135deg, #f4a261 0%, #e76f51 100%)',
  },
  oceanGradientBanner: {
    background: 'linear-gradient(135deg, #2a9d8f 0%, #264653 100%)',
  },
  pineGradientBanner: {
    background: 'linear-gradient(135deg, #0d3b2e 0%, #2a9d8f 100%)',
  },
  lavenderGradientBanner: {
    background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
  },
  bannerLogoText: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    opacity: 0.9,
  },
  bannerEventTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 1.2,
    letterSpacing: '-0.5px',
  },
  bannerEventMeta: {
    fontSize: '12px',
    opacity: 0.9,
    marginTop: '6px',
  },
  bannerTargetBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    padding: '4px 12px',
    borderRadius: 'var(--radius-round)',
    fontSize: '11px',
    fontWeight: '700',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  feedCardHeader: {
    padding: '16px 20px 8px 20px',
  },
  publisherInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  publisherAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-round)',
    backgroundColor: 'var(--pine-light)',
    color: 'var(--pine-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '16px',
  },
  publisherName: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--pine-deep)',
  },
  eventTimeBadge: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '10px',
    color: 'var(--text-placeholder)',
    marginTop: '2px',
  },
  feedCardBody: {
    padding: '8px 20px 16px 20px',
  },
  feedCardEventTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--pine-deep)',
    marginBottom: '8px',
  },
  feedCardDescription: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
  },
  eventDetailInfoBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '14px',
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-subtle)',
  },
  eventDetailInfoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'var(--pine-deep)',
  },
  feedCardFooter: {
    display: 'flex',
    borderTop: '1px solid var(--border-subtle)',
    padding: '12px 16px',
    justifyContent: 'space-around',
  },
  interactionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: 'var(--radius-md)',
    transition: 'var(--transition-smooth)',
    outline: 'none',
  },
  commentsSection: {
    borderTop: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--bg-input)',
    padding: '16px 20px',
  },
  commentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  noCommentsText: {
    fontSize: '12px',
    color: 'var(--text-placeholder)',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: '8px 0',
  },
  commentItem: {
    backgroundColor: '#ffffff',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-subtle)',
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  commentAuthor: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--pine-deep)',
  },
  commentDate: {
    fontSize: '9px',
    color: 'var(--text-placeholder)',
  },
  commentText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: 1.4,
  },
  commentInputRow: {
    display: 'flex',
    gap: '10px',
  },
  commentInput: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-subtle)',
    fontSize: '12px',
    outline: 'none',
    backgroundColor: '#ffffff',
  },
  formLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'var(--pine-deep)',
    marginBottom: '6px',
    letterSpacing: '0.5px',
  },
  formInput: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--bg-input)',
    fontSize: '13px',
    color: 'var(--pine-deep)',
    outline: 'none',
  },
  exploreTabContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    paddingBottom: '80px',
  },
  exploreHeaderSection: {
    marginBottom: '8px',
  },
  exploreTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--pine-deep)',
    letterSpacing: '-1px',
  },
  exploreSubtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  exploreGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '16px',
    width: '100%',
  },
  exploreCard: {
    position: 'relative',
    height: '180px',
    borderRadius: 'var(--radius-xl)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '16px',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
    transition: 'var(--transition-smooth)',
  },
  exploreCardContent: {
    color: '#ffffff',
    zIndex: 2,
  },
  exploreCardTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#ffffff',
  },
  exploreCardSubtitle: {
    fontSize: '10px',
    opacity: 0.85,
    marginTop: '2px',
  },
  exploreSubpage: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  subpageHeader: {
    marginBottom: '8px',
  },
  subpageTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--pine-deep)',
  },
  subpageDesc: {
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  subpageList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  clubCard: {
    padding: '18px 22px',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  clubTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--pine-deep)',
  },
  clubDesc: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
  },
  clubContact: {
    fontSize: '11px',
    color: 'var(--pine-primary)',
    fontWeight: '600',
  },
  exploreHostelButton: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-subtle)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--pine-deep)',
    transition: 'var(--transition-smooth)',
    textAlign: 'left',
    width: '100%',
    outline: 'none',
  },
  subpageCardImage: {
    height: '140px',
    width: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: 'var(--radius-md)',
    marginBottom: '10px',
  }
};
