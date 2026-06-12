import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Bell, Inbox } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import type { RootState } from '../../store';
import API, { getWebSocketUrl } from '../../config/api';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, accessToken } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!user || !accessToken) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // 1. Fetch initial notifications
    void loadNotifications();
    void loadUnreadCount();

    // 2. Set up WebSocket STOMP Client
    const client = new Client({
      brokerURL: getWebSocketUrl('/ws-notifications'),
      connectHeaders: { Authorization: `Bearer ${accessToken}` },
      debug: (str) => {
        console.debug('STOMP: ' + str);
      },
      onConnect: () => {
        console.log('STOMP Connected');
        client.subscribe('/user/queue/notifications', (message) => {
          try {
            const newItem: NotificationItem = JSON.parse(message.body);
            setNotifications((prev) => [newItem, ...prev]);
            setUnreadCount((prev) => prev + 1);
          } catch (e) {
            console.error('Failed to parse WebSocket notification payload', e);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP Broker error: ' + frame.headers['message']);
      },
      onDisconnect: () => {
        console.log('STOMP Disconnected');
      }
    });

    client.activate();

    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      client.deactivate();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [accessToken, user]);

  const loadNotifications = async () => {
    try {
      const res = await API.get<NotificationItem[]>('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to retrieve notifications list', err);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const res = await API.get<number>('/notifications/unread-count');
      setUnreadCount(res.data);
    } catch (err) {
      console.error('Failed to retrieve unread notifications count', err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="text-slate-600 hover:text-indigo-600 relative focus:outline-none p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-[-16px] sm:right-0 mt-3 w-[calc(100vw-32px)] sm:w-80 rounded-3xl border border-slate-100 bg-white p-4 shadow-xl z-50 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b">
            <h3 className="font-bold text-sm text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                <Inbox size={28} className="mb-2 text-slate-300" />
                <p className="text-xs">No alerts yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                  className={`p-3 rounded-2xl border text-xs relative cursor-pointer transition-all duration-200 ${
                    n.isRead
                      ? 'border-slate-100 hover:bg-slate-50'
                      : 'border-indigo-100 bg-indigo-50/10 hover:bg-indigo-50/20'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <p className={`font-bold ${n.isRead ? 'text-slate-700' : 'text-indigo-950'}`}>{n.title}</p>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0 mt-1"></span>
                    )}
                  </div>
                  <p className="text-slate-500 mt-1">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    {new Date(n.createdAt).toLocaleDateString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
