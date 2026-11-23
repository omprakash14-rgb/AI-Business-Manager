import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, ExternalLink, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { formatRelativeTime } from '@ai-business-manager/shared';
import type { NotificationDto } from '@ai-business-manager/shared';

export function NotificationDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await apiClient.getUnreadNotificationCount();
      setUnreadCount(res.unreadCount);
    } catch {
      // Ignore background error
    }
  }, []);

  // Fetch notifications list
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.getNotifications({ page: 1, limit: 15, sortOrder: 'desc' });
      setNotifications(res.items);
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkRead = async (id: string) => {
    try {
      await apiClient.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none cursor-pointer"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-xl z-40 overflow-hidden text-xs">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-blue-700">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-3 w-3" />
                    <span>Mark all read</span>
                  </button>
                )}
                <button
                  onClick={fetchNotifications}
                  disabled={isLoading}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Refresh notifications"
                >
                  <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <p className="text-xs">No notifications in this organization yet.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && handleMarkRead(n.id)}
                    className={`p-3.5 transition-colors cursor-pointer flex items-start gap-2.5 ${
                      n.isRead ? 'bg-white opacity-70 hover:opacity-100' : 'bg-blue-50/40 hover:bg-blue-50/70'
                    }`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                        n.isRead ? 'bg-transparent' : 'bg-blue-600'
                      }`}
                    />
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-slate-900 truncate">{n.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{n.body}</p>
                      {n.link && (
                        <div className="flex items-center gap-1 text-[10px] text-blue-600 font-medium">
                          <span>View record</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 px-4 py-2 bg-slate-50/50 text-[10px] text-slate-400 text-center">
              Scoped to active organization • Phase 3 In-App Engine
            </div>
          </div>
        </>
      )}
    </div>
  );
}
