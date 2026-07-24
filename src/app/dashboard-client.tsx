'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { UserSession } from '@/lib/auth';
import { logout } from './login/actions';
import { fetchMessMenu, MessMenuData } from './actions/mess';
import { 
  fetchAnnouncements, 
  toggleLikeAnnouncement, 
  commentAnnouncement, 
  createAnnouncementAction 
} from './actions/announcements';
import { type FirestoreAnnouncement, type FirestoreComment, type FirestoreLostFoundItem } from '@/lib/firestore';
import { fetchLostFoundItems, createLostFoundItemAction, runSeedingAction } from './actions/lostfound';
import { 
  Mountain, 
  Home, 
  Contact, 
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
  ArrowRight
} from 'lucide-react';

interface DashboardClientProps {
  user: UserSession;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isPending, startTransition] = useTransition();

  // ID Card modal state
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);

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

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        await runSeedingAction();
        const [announcementsData, lostFoundData] = await Promise.all([
          fetchAnnouncements(),
          fetchLostFoundItems()
        ]);
        if (active) {
          setAnnouncements(announcementsData);
          setLostFoundItems(lostFoundData);
        }
      } catch (err) {
        console.error('Failed to fetch announcements and items in effect:', err);
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
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'snacks' | 'dinner'>('dinner');
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

  const menuItems = [
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

  const getMealMenu = () => {
    if (!messMenu) return 'Loading menu details...';
    switch (selectedMeal) {
      case 'breakfast': return messMenu.breakfast || 'No menu uploaded';
      case 'lunch': return messMenu.lunch || 'No menu uploaded';
      case 'snacks': return messMenu.snacks || 'No menu uploaded';
      case 'dinner': return messMenu.dinner || 'No menu uploaded';
    }
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div style={styles.dashboardHome} className="animate-fade-in">
            {/* Mess Menu Card - Replicating screenshot */}
            <div style={styles.messCard} className="glass-panel">
              <div style={styles.messHeader}>
                <h3 style={styles.messTitle}>Mess Menu</h3>
                <div style={styles.dropdownWrapper}>
                  <select 
                    value={selectedHostel}
                    onChange={(e) => setSelectedHostel(e.target.value)}
                    style={styles.messSelect}
                  >
                    {hostels.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <select 
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    style={styles.messSelect}
                  >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div style={styles.messBody}>
                {/* Left Side: Vertical Tabs */}
                <div style={styles.messVerticalTabs}>
                  {(['breakfast', 'lunch', 'snacks', 'dinner'] as const).map((meal) => {
                    const isActive = selectedMeal === meal;
                    return (
                      <button
                        key={meal}
                        onClick={() => setSelectedMeal(meal)}
                        style={{
                          ...styles.messTabBtn,
                          borderColor: isActive ? 'var(--pine-primary)' : 'transparent',
                          backgroundColor: isActive ? 'var(--pine-light)' : 'transparent',
                          color: isActive ? 'var(--pine-primary)' : 'var(--text-muted)',
                          fontWeight: isActive ? '600' : '400',
                        }}
                      >
                        {meal.charAt(0).toUpperCase() + meal.slice(1)}
                      </button>
                    );
                  })}
                </div>

                {/* Right Side: Detail Panel */}
                <div style={styles.messDetailCard}>
                  <div style={styles.messMenuContent}>
                    {getMealMenu()}
                  </div>
                  <div style={styles.messFooterRow}>
                    <span style={styles.messTime}>{getMealTime(selectedMeal)}</span>
                    <div style={styles.broadcastIconBg}>
                      <Bell size={14} color="#ffffff" />
                    </div>
                  </div>
                </div>
              </div>
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

            {/* Services Section - Replicating screenshot */}
            <div style={styles.servicesSection}>
              <h3 style={styles.servicesHeader}>Services</h3>
              <div style={styles.servicesGrid}>
                {/* Buy & Sell */}
                <div 
                  style={styles.serviceCard} 
                  className="glass-panel glass-panel-hover"
                  onClick={() => {
                    // Route to market page or show notification
                    setActiveTab('explore');
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
        const filteredAnnouncements = announcements.filter(ann => 
          ann.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ann.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ann.publisher?.toLowerCase().includes(searchQuery.toLowerCase())
        );

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
          { id: 'cult', title: 'Cult', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80', subtitle: 'Music, Drama & Arts' },
          { id: 'tech', title: 'Tech', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80', subtitle: 'Coding, Electronics & Robos' },
          { id: 'sports', title: 'Sports', image: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=500&q=80', subtitle: 'Teams, Gym & Tournaments' },
          { id: 'academics', title: 'Academics', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500&q=80', subtitle: 'Curriculum & Resources' },
          { id: 'hostels', title: 'Hostels', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500&q=80', subtitle: 'Mess menu & updates' },
          { id: 'departments', title: 'Departments', image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=500&q=80', subtitle: 'Offices & Labs' },
        ];

        const renderCategoryDetails = () => {
          switch (selectedExploreCategory) {
            case 'tech':
              return (
                <div style={styles.exploreSubpage}>
                  <div style={styles.subpageHeader}>
                    <h3 style={styles.subpageTitle}>Technical Clubs & Societies</h3>
                    <p style={styles.subpageDesc}>Code, innovate, and build systems at NITH</p>
                  </div>
                  <div style={styles.subpageList}>
                    <div style={styles.clubCard} className="glass-panel">
                      <h4 style={styles.clubTitle}>GLUG NITH</h4>
                      <p style={styles.clubDesc}>GNU/Linux User Group: Promoting open source, Linux workshops, and software freedom.</p>
                      <span style={styles.clubContact}>Contact: glug@nith.ac.in</span>
                    </div>
                    <div style={styles.clubCard} className="glass-panel">
                      <h4 style={styles.clubTitle}>SPEC NITH</h4>
                      <p style={styles.clubDesc}>Society for Promotion of Electronics Culture: Focused on embedded systems, IoT, robotics, and hardware fests.</p>
                      <span style={styles.clubContact}>Contact: spec@nith.ac.in</span>
                    </div>
                    <div style={styles.clubCard} className="glass-panel">
                      <h4 style={styles.clubTitle}>CSEC NITH</h4>
                      <p style={styles.clubDesc}>Computer Science Engineers Club: Leading competitive coding events, hackathons, and software engineering preparation.</p>
                      <span style={styles.clubContact}>Contact: csec@nith.ac.in</span>
                    </div>
                  </div>
                </div>
              );
            case 'cult':
              return (
                <div style={styles.exploreSubpage}>
                  <div style={styles.subpageHeader}>
                    <h3 style={styles.subpageTitle}>Cultural & Fine Arts Clubs</h3>
                    <p style={styles.subpageDesc}>Express yourself through drama, music, and art</p>
                  </div>
                  <div style={styles.subpageList}>
                    <div style={styles.clubCard} className="glass-panel">
                      <h4 style={styles.clubTitle}>Pithoo Dramatics Club</h4>
                      <p style={styles.clubDesc}>Famous for Street Plays (Nukkad Natak), stage plays, and hosting drama workshops during HillFFair.</p>
                    </div>
                    <div style={styles.clubCard} className="glass-panel">
                      <h4 style={styles.clubTitle}>NITH Music Club</h4>
                      <p style={styles.clubDesc}>Home of the college rock bands, choir ensembles, and classical instrumental performances.</p>
                    </div>
                    <div style={styles.clubCard} className="glass-panel">
                      <h4 style={styles.clubTitle}>Choreography Club</h4>
                      <p style={styles.clubDesc}>Covers western, freestyle, street hip-hop, and traditional bhangra dance forms.</p>
                    </div>
                  </div>
                </div>
              );
            case 'sports':
              return (
                <div style={styles.exploreSubpage}>
                  <div style={styles.subpageHeader}>
                    <h3 style={styles.subpageTitle}>Sports Facilities & Gyms</h3>
                    <p style={styles.subpageDesc}>Stay active on campus</p>
                  </div>
                  <div style={styles.subpageList}>
                    <div style={styles.clubCard} className="glass-panel">
                      <div style={{ ...styles.subpageCardImage, backgroundImage: 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80")' }} />
                      <h4 style={styles.clubTitle}>Student Gym Center</h4>
                      <p style={styles.clubDesc}>Fully functional gymnasium located near Student Activity Center. Open daily 5:30 AM - 8:30 AM and 4:30 PM - 8:30 PM.</p>
                    </div>
                    <div style={styles.clubCard} className="glass-panel">
                      <div style={{ ...styles.subpageCardImage, backgroundImage: 'url("https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&q=80")' }} />
                      <h4 style={styles.clubTitle}>Indoor Badminton Courts</h4>
                      <p style={styles.clubDesc}>Three wooden-floored courts located inside the Sports Complex. Bring your own racquets and indoor non-marking shoes.</p>
                    </div>
                    <div style={styles.clubCard} className="glass-panel">
                      <div style={{ ...styles.subpageCardImage, backgroundImage: 'url("https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&q=80")' }} />
                      <h4 style={styles.clubTitle}>Volleyball & Basketball Courts</h4>
                      <p style={styles.clubDesc}>Outdoor courts with floodlights for evening games. Hosts annual NITH sports fests.</p>
                    </div>
                  </div>
                </div>
              );
            case 'academics':
              return (
                <div style={styles.exploreSubpage}>
                  <div style={styles.subpageHeader}>
                    <h3 style={styles.subpageTitle}>Academic Resources</h3>
                    <p style={styles.subpageDesc}>Important study and administrative links</p>
                  </div>
                  <div style={styles.subpageList}>
                    <div style={styles.clubCard} className="glass-panel">
                      <div style={{ ...styles.subpageCardImage, backgroundImage: 'url("https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&q=80")' }} />
                      <h4 style={styles.clubTitle}>NITH Syllabus Portal</h4>
                      <p style={styles.clubDesc}>Download B.Tech, M.Tech, and PhD syllabus sheets and curriculum structure for all departments.</p>
                    </div>
                    <div style={styles.clubCard} className="glass-panel">
                      <div style={{ ...styles.subpageCardImage, backgroundImage: 'url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=500&q=80")' }} />
                      <h4 style={styles.clubTitle}>Central Library Catalogue</h4>
                      <p style={styles.clubDesc}>Browse book availability, access e-journals, and search online catalogs via library network.</p>
                    </div>
                  </div>
                </div>
              );
            case 'hostels':
              return (
                <div style={styles.exploreSubpage}>
                  <div style={styles.subpageHeader}>
                    <h3 style={styles.subpageTitle}>NITH Hostel Directory</h3>
                    <p style={styles.subpageDesc}>Tap any hostel to view its mess menu instantly</p>
                  </div>
                  <div style={styles.subpageList}>
                    {hostels.map((hostelName) => (
                      <button
                        key={hostelName}
                        onClick={() => {
                          setSelectedHostel(hostelName);
                          setActiveTab('home');
                          setSelectedExploreCategory(null);
                        }}
                        style={styles.exploreHostelButton}
                        className="glass-panel glass-panel-hover"
                      >
                        <span>{hostelName}</span>
                        <ArrowRight size={14} color="var(--pine-primary)" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            case 'departments':
              return (
                <div style={styles.exploreSubpage}>
                  <div style={styles.subpageHeader}>
                    <h3 style={styles.subpageTitle}>Academic Departments</h3>
                    <p style={styles.subpageDesc}>Faculty, research centers, and offices</p>
                  </div>
                  <div style={styles.subpageList}>
                    <div style={styles.clubCard} className="glass-panel">
                      <h4 style={styles.clubTitle}>Computer Science & Engineering</h4>
                      <p style={styles.clubDesc}>Department offices and computer labs. Host of CSEC and GLUG clubs.</p>
                    </div>
                    <div style={styles.clubCard} className="glass-panel">
                      <h4 style={styles.clubTitle}>Electronics & Communication Engineering</h4>
                      <p style={styles.clubDesc}>Labs for analog, digital, microprocessor design, and VLSI systems. Host of SPEC.</p>
                    </div>
                    <div style={styles.clubCard} className="glass-panel">
                      <h4 style={styles.clubTitle}>Electrical Engineering</h4>
                      <p style={styles.clubDesc}>Control system labs, power grid laboratories, and smart energy modules.</p>
                    </div>
                  </div>
                </div>
              );
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
                alert('Please fill in all required fields.');
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
            alert('Please fill in all required fields.');
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
          } else {
            alert('Failed to report item. Please try again.');
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
                {filteredItems.map((item) => (
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
                    </div>
                  </div>
                ))}
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
                      <label style={styles.formLabel}>Contact Details *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Phone number or email..." 
                        value={newItemContact} 
                        onChange={(e) => setNewItemContact(e.target.value)} 
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
            <Mountain size={24} color="var(--text-light)" />
            <h1 style={styles.sidebarTitle}>NITH Connect</h1>
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

          <button 
            onClick={() => setIsIdCardOpen(true)}
            style={styles.navLink}
          >
            <Contact size={18} color="rgba(255, 255, 255, 0.7)" />
            <span>Digital ID Card</span>
          </button>
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
                {user.role === 'guest' ? 'Campus Guest' : 'Student'}
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
            {/* ID Pill */}
            <button 
              onClick={() => setIsIdCardOpen(true)}
              style={styles.idPill}
            >
              <div style={styles.idPillIcon}>
                <Contact size={14} color="#ffffff" />
              </div>
              <span style={styles.idPillText}>ID</span>
            </button>
          </div>
          
          {/* Center Lotus Logo */}
          <div style={styles.topbarCenter}>
            <div style={styles.lotusIcon}>
              <Mountain size={20} color="var(--pine-primary)" />
            </div>
          </div>

          <div style={styles.topbarRight}>
            <button 
              onClick={() => alert('Notifications: All caught up!')}
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

      {/* Digital ID Card Modal / Drawer */}
      {isIdCardOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsIdCardOpen(false)}>
          <div 
            style={styles.idCardModal} 
            className="glass-panel animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Student Identity</h3>
              <button 
                onClick={() => setIsIdCardOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} />
              </button>
            </div>

            {/* Premium ID Card Grid */}
            <div style={styles.idCardLayout}>
              <div style={styles.idCardBadge}>
                {/* Header banner */}
                <div style={styles.idCardHeaderBanner}>
                  <Mountain size={18} color="#ffffff" />
                  <span style={styles.idCardHeaderTitle}>NIT HAMIRPUR</span>
                </div>
                
                {/* Body details */}
                <div style={styles.idCardContent}>
                  <div style={styles.idCardProfileRow}>
                    <div style={styles.idCardAvatar}>
                      {user.name.charAt(0)}
                    </div>
                    <div style={styles.idCardMainDetails}>
                      <h4 style={styles.idCardName}>{user.name}</h4>
                      <p style={styles.idCardRoleText}>
                        {user.role === 'guest' ? 'Campus Guest' : 'Student Scholar'}
                      </p>
                    </div>
                  </div>

                  <div style={styles.idCardDetailsGrid}>
                    <div style={styles.idCardDetailItem}>
                      <span style={styles.idCardLabel}>Roll No:</span>
                      <span style={styles.idCardVal}>{user.roll_number || 'GUEST-001'}</span>
                    </div>
                    <div style={styles.idCardDetailItem}>
                      <span style={styles.idCardLabel}>Department:</span>
                      <span style={styles.idCardVal}>{user.department || 'Visitor'}</span>
                    </div>
                    <div style={styles.idCardDetailItem}>
                      <span style={styles.idCardLabel}>Hostel:</span>
                      <span style={styles.idCardVal}>{user.hostel || 'Guest House'}</span>
                    </div>
                    {user.blood_group && (
                      <div style={styles.idCardDetailItem}>
                        <span style={styles.idCardLabel}>Blood Group:</span>
                        <span style={styles.idCardVal}>{user.blood_group}</span>
                      </div>
                    )}
                  </div>

                  {/* Scannable Vector QR Code */}
                  <div style={styles.idCardQrWrapper}>
                    <svg width="120" height="120" viewBox="0 0 29 29" style={{ shapeRendering: 'crispEdges' }}>
                      <path fill="#ffffff" d="M0 0h29v29H0z"/>
                      <path fill="var(--pine-deep)" d="M0 0h7v7H0zm22 0h7v7h-7zM0 22h7v7H0zm9 0h1v1H9zm1-1h1v1h-1zm1 2h1v1h-1zm-2 1h1v1H9zm1 1h1v1h-1zm1-2h1v1h-1zm1 3h1v1h-1zm-2 1h1v1H9zm4-8h1v1h-1zm1 1h1v1h-1zm-1-2h1v1h-1zm2 1h1v1h-1zm1 2h1v1h-1zm-2 1h1v1h-1zm1 1h1v1h-1zm1-2h1v1h-1zm1 3h1v1h-1zm-2 1h1v1h-1zm6-6h1v1h-1zm1 1h1v1h-1zm-1-2h1v1h-1zm2 1h1v1h-1zm1 2h1v1h-1zm-2 1h1v1h-1zm1 1h1v1h-1zm1-2h1v1h-1zm1 3h1v1h-1zm-2 1h1v1h-1zM2 2h3v3H2zm20 0h3v3h-3zM2 24h3v3H2zm8-16h1v1h-1zm1 1h1v1h-1zm-1-2h1v1h-1zm2 1h1v1h-1zm1 2h1v1h-1zm-2 1h1v1h-1zm1 1h1v1h-1zm1-2h1v1h-1zm1 3h1v1h-1zm-2 1h1v1h-1zm6-6h1v1h-1zm1 1h1v1h-1zm-1-2h1v1h-1zm2 1h1v1h-1zm1 2h1v1h-1zm-2 1h1v1h-1zm1 1h1v1h-1zm1-2h1v1h-1zm1 3h1v1h-1zm-2 1h1v1h-1zm-8 4h1v1h-1zm1 1h1v1h-1zm-1-2h1v1h-1zm2 1h1v1h-1zm1 2h1v1h-1zm-2 1h1v1h-1zm1 1h1v1h-1zm1-2h1v1h-1zm1 3h1v1h-1zm-2 1h1v1h-1zm6-6h1v1h-1zm1 1h1v1h-1zm-1-2h1v1h-1zm2 1h1v1h-1zm1 2h1v1h-1zm-2 1h1v1h-1zm1 1h1v1h-1zm1-2h1v1h-1zm1 3h1v1h-1zm-2 1h1v1h-1z"/>
                    </svg>
                    <span style={styles.qrScanText}>Scan for Campus Access</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={styles.idCardActions}>
              <button 
                onClick={() => alert('Identity downloaded successfully to your devices.')}
                className="btn-primary" 
                style={{ flex: 1, padding: '10px' }}
              >
                <Download size={14} style={{ marginRight: 6 }} /> Download Pass
              </button>
              <button 
                onClick={() => setIsIdCardOpen(false)}
                className="btn-secondary" 
                style={{ flex: 1, padding: '10px' }}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

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
                    alert('Please fill out the Title, Publisher, and Description.');
                    return;
                  }
                  const success = await createAnnouncementAction(
                    newPostTitle,
                    newPostDesc,
                    newPostTarget,
                    newPostDate || 'TBD',
                    newPostTime || 'TBD',
                    newPostLoc || 'TBD',
                    newPostPub,
                    newPostTheme
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
                  } else {
                    alert('Failed to publish. Check your console.');
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
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    border: '1px solid var(--border-thick)',
    boxShadow: '0 8px 24px rgba(18, 91, 68, 0.08)',
    background: '#ffffff',
  },
  idCardHeaderBanner: {
    background: 'linear-gradient(135deg, var(--pine-primary) 0%, var(--pine-deep) 100%)',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    color: '#ffffff',
  },
  idCardHeaderTitle: {
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '1px',
  },
  idCardContent: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  idCardProfileRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    width: '100%',
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '12px',
  },
  idCardAvatar: {
    width: '56px',
    height: '56px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--pine-light)',
    color: 'var(--pine-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '700',
    border: '1px dashed var(--pine-primary)',
  },
  idCardMainDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  idCardName: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--pine-deep)',
  },
  idCardRoleText: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  idCardDetailsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  },
  idCardDetailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    lineHeight: '1.4',
  },
  idCardLabel: {
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  idCardVal: {
    color: 'var(--pine-deep)',
    fontWeight: '600',
    textAlign: 'right',
  },
  idCardQrWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
    borderTop: '1px dashed var(--border-subtle)',
    paddingTop: '16px',
    width: '100%',
  },
  qrScanText: {
    fontSize: '10px',
    color: 'var(--text-placeholder)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600',
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
