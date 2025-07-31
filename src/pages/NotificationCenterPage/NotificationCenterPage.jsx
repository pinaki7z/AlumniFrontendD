import React, { useEffect, useState } from "react";
import { Eye, X, CheckCircle, AlertCircle, Bell, Clock, Users, Building } from 'lucide-react';
import { useSelector } from 'react-redux';
// Update the API URL as needed

const typeIcons = {
  job: <Building className="text-blue-600" size={20} />,
  internship: <Users className="text-pink-700" size={20} />,
  event: <Clock className="text-yellow-700" size={20} />,
  post: <Bell className="text-green-700" size={20} />,
  admin: <AlertCircle className="text-red-600" size={20} />,
};

function NotificationCenterPage() {
  const profile = useSelector(state => state.profile);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    const resp = await fetch(`${process.env.REACT_APP_API_URL}/api/notification-center/user/${profile._id}`);
    const result = await resp.json();
    setNotifications(result.notifications || []);
    setLoading(false);
  };

  const markAsRead = async (notifId) => {
    await fetch(`${process.env.REACT_APP_API_URL}/api/notification-center/${notifId}/read`, { method: "PATCH" });
    fetchNotifications();
  };

  const removeNotif = async (notifId) => {
    await fetch(`${process.env.REACT_APP_API_URL}/api/notification-center/${notifId}`, { method: "DELETE" });
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-[#0A3A4C] mb-4">Notification Center</h2>
      {loading ? <div>Loading...</div> : (
        <div className="divide-y divide-gray-200 rounded-lg shadow border bg-white">
          {notifications.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <Bell size={36} className="mx-auto mb-2 text-[#0A3A4C]" />
              No notifications yet.
            </div>
          )}
          {notifications.map(notif =>
            <div key={notif._id}
              className={`flex items-start gap-3 p-4 transition
                ${notif.read ? 'bg-gray-50' : 'bg-gradient-to-br from-[#F2F6FA] to-[#E7EFFA]'}
              `}>
              <div>{typeIcons[notif.type] || <Bell size={20} />}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{notif.title}</h4>
                <div className="text-gray-700 text-sm">{notif.message}</div>
                <div className="text-gray-400 text-xs mt-1">{new Date(notif.createdAt).toLocaleString()}</div>
                {!notif.read && (
                  <button
                    onClick={() => markAsRead(notif._id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#174873] mt-2 hover:underline"
                  >
                    <CheckCircle size={12} /> Mark as read
                  </button>
                )}
              </div>
              <button onClick={() => removeNotif(notif._id)}
                className="text-gray-400 hover:text-red-600 ml-1 transition"
                title="Delete notification"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationCenterPage;
