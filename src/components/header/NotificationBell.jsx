import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotificationBell.css';
import { useNotificationsQuery } from '../../hooks/queries/useNotificationQuery';
import { useMarkChatRoomReadMutation } from '../../hooks/mutations/useChatMutations';
import { useChatRoomsQuery } from '../../hooks/queries/useChatQuery';
import { useReadAnnouncementNotificationsMutation } from '../../hooks/queries/useAnnouncementQuery';
import { useUserSearch } from '../../hooks/queries/useUserQuery';
import useAuthStore from '../../store/useAuthStore';

function NotificationBell() {
  const currentUser = useAuthStore((state) => state.user);
  const { data: notifications = [] } = useNotificationsQuery();
  const { data: rooms = [] } = useChatRoomsQuery();
  const { data: allEmployees = [] } = useUserSearch({ scope: 'all' });
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const markReadMutation = useMarkChatRoomReadMutation();
  const readAnnouncementsMutation = useReadAnnouncementNotificationsMutation();

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

  // 채팅방 참여자의 부서+이름 표시용 (ChatPage와 동일한 방식).
  const userDisplayMap = useMemo(() => {
    const map = {};
    allEmployees.forEach((emp) => { map[String(emp.userId)] = emp; });
    return map;
  }, [allEmployees]);

  const displayName = (userId) => {
    const emp = userDisplayMap[String(userId)];
    if (!emp) return String(userId);
    return emp.departmentName ? `${emp.departmentName} ${emp.name}` : emp.name;
  };

  const roomsById = useMemo(() => {
    const map = {};
    rooms.forEach((r) => { map[r.room_id] = r; });
    return map;
  }, [rooms]);

  // 읽은 알림은 벨에서 완전히 사라져야 하므로(요청사항), 읽지 않은 것만 표시 대상으로 삼는다.
  const unread = useMemo(() => notifications.filter((n) => !n.is_read), [notifications]);

  // 채팅 알림은 방(room_id) 하나당 메시지가 여러 건 쌓여도 "1개의 알림"으로만 보여주고,
  // 그 옆에 개수만 표시한다. 공지사항은 건별로 그대로 보여준다.
  const items = useMemo(() => {
    const chatGroups = new Map(); // room_id -> { room_id, count, latestCreatedAt }
    const announcementItems = [];

    unread.forEach((n) => {
      if (n.type === 'ANNOUNCEMENT') {
        announcementItems.push(n);
        return;
      }
      if (!n.room_id) return;
      const existing = chatGroups.get(n.room_id);
      if (existing) {
        existing.count += 1;
        if (n.created_at > existing.latestCreatedAt) existing.latestCreatedAt = n.created_at;
      } else {
        chatGroups.set(n.room_id, { room_id: n.room_id, count: 1, latestCreatedAt: n.created_at });
      }
    });

    const chatItems = Array.from(chatGroups.values()).map((g) => {
      const room = roomsById[g.room_id];
      let text;
      if (room?.is_group) {
        text = '단체방에 메세지가 도착했습니다.';
      } else if (room && currentUser?.userId) {
        // currentUser가 아직 로드되지 않은 순간(새로고침 직후)에는 본인을 걸러내지
        // 못해 엉뚱한 상대가 뽑힐 수 있으므로, 그 사이엔 안전한 기본 문구로 대체한다.
        const otherId = room.member_ids.find((id) => id !== currentUser.userId);
        text = `${displayName(otherId)}에게 메세지가 도착했습니다.`;
      } else {
        // 방 목록이 아직 로드되지 않았거나(드묾) 이미 나간 방 - 안전한 기본 문구.
        text = '새 채팅 메시지가 도착했습니다.';
      }
      return {
        key: `room-${g.room_id}`,
        type: 'CHAT_MESSAGE',
        room_id: g.room_id,
        text,
        count: g.count,
        sortKey: g.latestCreatedAt,
      };
    });

    // 안읽은 공지사항이 몇 건이든 최상단에 1건으로만 묶어서 보여주고, 옆에 개수만 표시한다.
    const announcementGroup = announcementItems.length > 0
      ? [{
          key: 'ann-group',
          type: 'ANNOUNCEMENT',
          text: '새로운 공지사항이 등록되었습니다. 확인해주세요.',
          count: announcementItems.length,
          sortKey: announcementItems.reduce(
            (latest, n) => (n.created_at > latest ? n.created_at : latest),
            announcementItems[0].created_at
          ),
        }]
      : [];

    // 기존 동작 유지: 공지사항을 채팅 알림보다 먼저 보여준다.
    return [
      ...announcementGroup,
      ...chatItems.sort((a, b) => (a.sortKey < b.sortKey ? 1 : -1)),
    ];
  }, [unread, roomsById, userDisplayMap, currentUser]);

  const unreadCount = unread.length;

  const handleClick = (item) => {
    setIsOpen(false);
    if (item.type === 'ANNOUNCEMENT') {
      navigate('/announcements');
    } else if (item.room_id) {
      markReadMutation.mutate(item.room_id);
      navigate(`/chat?room=${item.room_id}`);
    }
  };

  // 방으로 이동하지 않고, 목록에서 바로 지울 때(직접 삭제 버튼).
  const handleDismiss = (e, item) => {
    e.stopPropagation();
    if (item.type === 'ANNOUNCEMENT') {
      readAnnouncementsMutation.mutate();
    } else if (item.room_id) {
      markReadMutation.mutate(item.room_id);
    }
  };

  return (
    <div className="notification-bell" ref={ref}>
      <button className="bell-btn" onClick={() => setIsOpen((v) => !v)} aria-label="알림">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
      </button>
      {isOpen && (
        <div className="bell-dropdown">
          {items.length === 0 ? (
            <div className="bell-empty">새 알림이 없습니다.</div>
          ) : (
            items.map((item) => (
              <div
                key={item.key}
                className="bell-item unread"
                onClick={() => handleClick(item)}
              >
                <span className="bell-item-text">
                  {item.text}
                  {item.count > 1 && <span className="bell-item-count">{item.count}</span>}
                </span>
                <button
                  className="bell-item-dismiss"
                  aria-label="알림 지우기"
                  title="알림 지우기"
                  onClick={(e) => handleDismiss(e, item)}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
