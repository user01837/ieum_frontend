import React, { useState, useEffect } from 'react';
import './ChatPage.css';
import { useChatRoomsQuery, useChatRoomMessagesQuery } from '../../hooks/queries/useChatQuery';
import { useCreateChatRoomMutation, useMarkChatRoomReadMutation } from '../../hooks/mutations/useChatMutations';
import { useChatSocketContext } from '../../store/ChatSocketContext';
import useAuthStore from '../../store/useAuthStore';
import EmployeeSearchModal from '../../components/EmpSearchModal/EmpSearchModal';

function ChatPage() {
  const currentUser = useAuthStore((state) => state.user);
  const { data: rooms = [], isError: isRoomsError } = useChatRoomsQuery();
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [draft, setDraft] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [sendError, setSendError] = useState('');
  const [roomError, setRoomError] = useState('');

  const { data: messages = [], isError: isMessagesError } = useChatRoomMessagesQuery(selectedRoomId);
  const { isConnected, sendMessage, setActiveRoom } = useChatSocketContext();
  const createRoomMutation = useCreateChatRoomMutation();
  const markReadMutation = useMarkChatRoomReadMutation();

  useEffect(() => {
    // 소켓이 연결되어 있을 때만 active_room을 보낼 수 있습니다.
    // isConnected가 false -> true로 바뀔 때(최초 연결/재연결 모두)도 이 effect가 다시 실행되어
    // 현재 선택된 방을 서버에 다시 알립니다.
    if (!isConnected) return undefined;

    setActiveRoom(selectedRoomId);
    if (selectedRoomId) {
      markReadMutation.mutate(selectedRoomId, {
        onError: () => setRoomError('읽음 처리에 실패했습니다.'),
      });
    }
    return () => setActiveRoom(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoomId, isConnected]);

  useEffect(() => {
    setSendError('');
  }, [selectedRoomId]);

  const handleSend = () => {
    if (!draft.trim() || !selectedRoomId) return;
    const sent = sendMessage(selectedRoomId, draft.trim());
    if (sent) {
      setDraft('');
      setSendError('');
    } else {
      setSendError('연결이 끊겨 있어 메시지를 보낼 수 없습니다.');
    }
  };

  const handlePickEmployees = (selectedEmployees) => {
    setIsPickerOpen(false);
    if (selectedEmployees.length === 0) return;
    setRoomError('');
    createRoomMutation.mutate(
      {
        memberIds: selectedEmployees.map((e) => e.userId),
        name: selectedEmployees.length > 1 ? selectedEmployees.map((e) => e.name).join(', ') : null,
      },
      {
        onSuccess: (room) => setSelectedRoomId(room.room_id),
        onError: (error) => {
          const message = error.response?.data?.detail || '채팅방 생성에 실패했습니다.';
          setRoomError(message);
        },
      }
    );
  };

  const roomLabel = (room) => {
    if (room.name) return room.name;
    const others = room.member_ids.filter((id) => id !== currentUser?.userId);
    return others.join(', ') || '(참여자 없음)';
  };

  return (
    <div className="chat-page">
      <aside className="chat-room-list">
        <button className="chat-new-room-btn" onClick={() => setIsPickerOpen(true)}>+ 새 채팅</button>
        {roomError && <div className="chat-inline-error">{roomError}</div>}
        {isRoomsError && <div className="chat-inline-error">채팅방 목록을 불러오지 못했습니다.</div>}
        {rooms.map((room) => (
          <div
            key={room.room_id}
            className={`chat-room-item ${selectedRoomId === room.room_id ? 'active' : ''}`}
            onClick={() => setSelectedRoomId(room.room_id)}
          >
            <div className="chat-room-name">{roomLabel(room)}</div>
            <div className="chat-room-preview">{room.last_message || '대화를 시작해보세요'}</div>
            {room.unread_count > 0 && <span className="chat-unread-badge">{room.unread_count}</span>}
          </div>
        ))}
      </aside>

      <section className="chat-thread">
        {selectedRoomId ? (
          <>
            <div className="chat-thread-header">
              <span className={`chat-connection-badge ${isConnected ? 'online' : 'offline'}`}>
                {isConnected ? '연결됨' : '연결 끊김'}
              </span>
            </div>
            <div className="chat-message-list">
              {isMessagesError && <div className="chat-inline-error">메시지를 불러오지 못했습니다.</div>}
              {[...messages].reverse().map((m) => (
                <div key={m.message_id} className={`chat-message ${m.sender_id === currentUser?.userId ? 'mine' : ''}`}>
                  <span className="chat-message-sender">{m.sender_id}</span>
                  <p>{m.content}</p>
                </div>
              ))}
            </div>
            <div className="chat-input-area">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="메시지를 입력하세요"
              />
              <button onClick={handleSend}>전송</button>
            </div>
            {sendError && <div className="chat-inline-error">{sendError}</div>}
          </>
        ) : (
          <div className="chat-empty-state">채팅방을 선택하거나 새 채팅을 시작하세요.</div>
        )}
      </section>

      {isPickerOpen && (
        <EmployeeSearchModal multiSelect onConfirm={handlePickEmployees} onClose={() => setIsPickerOpen(false)} />
      )}
    </div>
  );
}

export default ChatPage;
