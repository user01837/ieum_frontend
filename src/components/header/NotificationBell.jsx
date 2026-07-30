import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotificationBell.css';
import { useNotificationsQuery } from '../../hooks/queries/useNotificationQuery';
import { useMarkChatRoomReadMutation } from '../../hooks/mutations/useChatMutations';

function NotificationBell() {
  const { data: notifications = [] } = useNotificationsQuery();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const markReadMutation = useMarkChatRoomReadMutation();

  useEffect(() => {
    if (!isOpen) return undefined;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const sortedNotifications = [...notifications].sort((a, b) => {
    if (a.type === "ANNOUNCEMENT" && b.type !== "ANNOUNCEMENT") return -1;
    if (a.type !== "ANNOUNCEMENT" && b.type === "ANNOUNCEMENT") return 1;
    return 0;
  });

  const handleClick = (notification) => {
    setIsOpen(false);
    if (notification.type === "ANNOUNCEMENT") {
      navigate("/announcements");
    } else if (notification.room_id) {
      markReadMutation.mutate(notification.room_id);
      navigate(`/chat?room=${notification.room_id}`);
    }
  };

  return (
    <div className="notification-bell" ref={ref}>
      <button className="bell-btn" onClick={() => setIsOpen((v) => !v)} aria-label="알림">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 2.5 8.5 3 9.5a1 1 0 0 1-.9 1.5H3.9A1 1 0 0 1 3 17.5C3.5 16.5 6 15 6 8z" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
      </button>
      {isOpen && (
        <div className="bell-dropdown">
          {notifications.length === 0 ? (
            <div className="bell-empty">알림이 없습니다.</div>
          ) : (
            sortedNotifications.map((n) => (
              <div
                key={n.notification_id}
                className={`bell-item ${n.is_read ? '' : 'unread'}`}
                onClick={() => handleClick(n)}
              >
                {n.type === "ANNOUNCEMENT"
                  ? "새로운 공지사항이 등록되었습니다. 확인해주세요."
                  : "새 채팅 메시지가 도착했습니다."}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
