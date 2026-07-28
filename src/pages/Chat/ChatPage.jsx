import React, { useState, useEffect } from 'react';
import './ChatPage.css';
import { useChatRoomsQuery, useChatRoomMessagesQuery } from '../../hooks/queries/useChatQuery';
import { useCreateChatRoomMutation, useMarkChatRoomReadMutation } from '../../hooks/mutations/useChatMutations';
import { useChatSocketContext } from '../../store/ChatSocketContext';
import useAuthStore from '../../store/useAuthStore';
import EmployeeSearchModal from '../../components/EmpSearchModal/EmpSearchModal';

function ChatPage() {
  const currentUser = useAuthStore((state) => state.user);
  const { data: rooms = [] } = useChatRoomsQuery();
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [draft, setDraft] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const { data: messages = [] } = useChatRoomMessagesQuery(selectedRoomId);
  const { sendMessage, setActiveRoom } = useChatSocketContext();
  const createRoomMutation = useCreateChatRoomMutation();
  const markReadMutation = useMarkChatRoomReadMutation();

  useEffect(() => {
    setActiveRoom(selectedRoomId);
    if (selectedRoomId) {
      markReadMutation.mutate(selectedRoomId);
    }
    return () => setActiveRoom(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoomId]);

  const handleSend = () => {
    if (!draft.trim() || !selectedRoomId) return;
    sendMessage(selectedRoomId, draft.trim());
    setDraft('');
  };

  const handlePickEmployees = (selectedEmployees) => {
    setIsPickerOpen(false);
    if (selectedEmployees.length === 0) return;
    createRoomMutation.mutate(
      {
        memberIds: selectedEmployees.map((e) => e.userId),
        name: selectedEmployees.length > 1 ? selectedEmployees.map((e) => e.name).join(', ') : null,
      },
      { onSuccess: (room) => setSelectedRoomId(room.room_id) }
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
            <div className="chat-message-list">
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
