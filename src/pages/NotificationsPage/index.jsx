/* NotificationsPage.jsx */
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
} from 'react';
import { Route, Routes, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Bell,
  BellRing,
  X,
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  MessageCircle,
  Clock,
  Settings,
  Filter,
  Search,
  Loader2,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

import { NotificationsP } from '../../components/NotificationsP';
import { NotificationsDeclined } from '../../components/NotificationsDeclined';

/* -------------------------------------------------
   Helper: reusable skeleton while page is loading
--------------------------------------------------*/
const Skeleton = memo(() => (
  <div className="animate-pulse space-y-4">
    <div className="h-10 bg-gray-200 rounded-lg w-2/3" />
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 rounded-lg" />
      ))}
    </div>
    <div className="h-40 bg-gray-200 rounded-lg" />
  </div>
));

/* -------------------------------------------------
   Error-boundary so one error doesn’t loop forever
--------------------------------------------------*/
export class NotificationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { crashed: false };
  }
  static getDerivedStateFromError() {
    return { crashed: true };
  }
  componentDidCatch(err, info) {
    // eslint-disable-next-line no-console
    console.error('Notification page crashed:', err, info);
  }
  render() {
    if (this.state.crashed) {
      return (
        <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-center">
          <h2 className="text-lg font-semibold text-red-700 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-600 mb-4 text-sm">
            Please refresh the page. If the problem persists contact support.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* -------------------------------------------------
   Main page
--------------------------------------------------*/
const NotificationsPage = () => {
  const profile = useSelector((s) => s.profile);
  const location = useLocation();

  /* ---------------- STATE -------------- */
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [declinedCount, setDeclinedCount] = useState(0);

  /* ---------- ADMIN FLAG --------------- */
  const isAdmin = profile?.profileLevel === 0 || profile?.profileLevel === 1;

  /* ------------- EFFECT --------------- */
  // Simulated spinner delay (remove if you fetch real data here)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  /* --------- STATS (derived) ---------- */
  const stats = useMemo(
    () => ({
      pending: notificationCount,
      declined: declinedCount,
      approved: 0, // supply real value if available
      total: notificationCount + declinedCount,
    }),
    [notificationCount, declinedCount]
  );

  /* ------- CALLBACKS passed to children ------- */
  const handleNotificationCount = useCallback(
    (cnt) => setNotificationCount(cnt ?? 0),
    []
  );
  const handleDeclinedCount = useCallback(
    (cnt) => setDeclinedCount(cnt ?? 0),
    []
  );

  /* ------------- UI small helpers -------------- */
  const ActiveTab = location.pathname.endsWith('/declined')
    ? 'declined'
    : 'all';
  const titleText =
    ActiveTab === 'declined' ? 'Declined Notifications' : 'Notifications';

  const StatCard = ({ label, value, icon, tint }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center">
      <div>
        <p className="text-xs text-gray-600">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
      <div
        className={`w-8 h-8 rounded-lg ${tint} flex items-center justify-center`}
      >
        {icon}
      </div>
    </div>
  );

  /* ------------- RENDER -------------- */

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <Skeleton />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 space-y-4">
        {/* ===== Header ===== */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 dynamic-site-bg rounded-lg flex items-center justify-center">
                <Bell size={16} className="text-white" />
              </div>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] leading-none bg-red-600 text-white rounded-full px-1">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {titleText}
              </h1>
              <p className="text-xs text-gray-600">
                Keep track of your latest alerts and requests
              </p>
            </div>
          </div>

          {/* action buttons */}
          <div className="flex gap-2">
            <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
              <Filter size={16} />
            </button>
            {isAdmin && (
              <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                <Settings size={16} />
              </button>
            )}
          </div>
        </header>

        {/* ===== Stats ===== */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={<Clock size={14} className="text-yellow-600" />}
            tint="bg-yellow-100"
          />
          <StatCard
            label="Declined"
            value={stats.declined}
            icon={<X size={14} className="text-red-600" />}
            tint="bg-red-100"
          />
          <StatCard
            label="Approved"
            value={stats.approved}
            icon={<CheckCircle size={14} className="text-green-600" />}
            tint="bg-green-100"
          />
          <StatCard
            label="Total"
            value={stats.total}
            icon={<TrendingUp size={14} className="text-blue-600" />}
            tint="bg-blue-100"
          />
        </section>

        {/* ===== Tabs ===== */}
        <nav className="bg-white rounded-lg p-2 flex gap-2 overflow-x-auto">
          <Link
            to="/home/notifications"
            className={`flex items-center gap-1 whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              ActiveTab === 'all'
                ? 'dynamic-site-bg text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BellRing size={14} />
            All
          </Link>

          {isAdmin && (
            <Link
              to="/home/notifications/declined"
              className={`flex items-center gap-1 whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                ActiveTab === 'declined'
                  ? 'dynamic-site-bg text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <X size={14} />
              Declined
            </Link>
          )}
        </nav>

        {/* ===== Content Routes ===== */}
        <Routes>
          <Route
            path="/"
            element={
              <NotificationsP
                sendNotificationCount={handleNotificationCount}
                topBar={false}
              />
            }
          />
          {isAdmin && (
            <Route
              path="/declined"
              element={
                <NotificationsDeclined
                  sendDeclinedCount={handleDeclinedCount}
                />
              }
            />
          )}
          {!isAdmin && (
            <Route
              path="/declined"
              element={
                <div className="bg-white p-6 rounded-lg text-center">
                  <AlertTriangle
                    size={32}
                    className="text-red-500 mx-auto mb-4"
                  />
                  <h3 className="text-lg font-semibold mb-2">
                    Access restricted
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Declined notifications are only available to admins.
                  </p>
                  <Link
                    to="/home/notifications"
                    className="inline-flex items-center gap-1 px-4 py-2 bg-[#0A3A4C] text-white rounded-lg"
                  >
                    <BellRing size={14} />
                    Back to notifications
                  </Link>
                </div>
              }
            />
          )}
        </Routes>

        {/* ===== Help footer ===== */}
        <footer className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-gray-700">
              Need help understanding notifications?
            </p>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-white text-gray-700 rounded-lg hover:bg-gray-100 text-xs">
                <MessageCircle size={12} />
                Help&nbsp;Center
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs">
                <ExternalLink size={12} />
                User&nbsp;Guide
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default NotificationsPage;
