import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import './ChatPage.css';
import { useChatRoomsQuery, useChatRoomMessagesQuery } from '../../hooks/queries/useChatQuery';
import { useCreateChatRoomMutation, useMarkChatRoomReadMutation, useAddChatRoomMembersMutation, useLeaveChatRoomMutation } from '../../hooks/mutations/useChatMutations';
import { useChatSocketContext } from '../../store/ChatSocketContext';
import useAuthStore from '../../store/useAuthStore';
import EmployeeSearchModal from '../../components/EmpSearchModal/EmpSearchModal';
import { useUserSearch } from '../../hooks/queries/useUserQuery';

function ChatPage() {
  const currentUser = useAuthStore((state) => state.user);
  const { data: rooms = [], isError: isRoomsError } = useChatRoomsQuery();
  const [searchParams] = useSearchParams();
  // 알림벨에서 /chat?room=123 형태로 딥링크했을 때, 해당 방을 초기 선택 상태로 사용합니다.
  // 유효하지 않거나 접근 권한이 없는 room_id는 이후 메시지 조회(GET /chat/rooms/{id}/messages)에서
  // 백엔드의 멤버십 검증에 의해 자연스럽게 실패하므로 여기서 별도 검증하지 않습니다.
  const roomParam = searchParams.get('room');
  const [selectedRoomId, setSelectedRoomId] = useState(roomParam ? Number(roomParam) : null);
  const [draft, setDraft] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [sendError, setSendError] = useState('');
  const [roomError, setRoomError] = useState('');

  const { data: messages = [], isError: isMessagesError } = useChatRoomMessagesQuery(selectedRoomId);
  const { isConnected, sendMessage, setActiveRoom } = useChatSocketContext();
  const createRoomMutation = useCreateChatRoomMutation();
  const markReadMutation = useMarkChatRoomReadMutation();
  const addMembersMutation = useAddChatRoomMembersMutation();
  const leaveRoomMutation = useLeaveChatRoomMutation();
  const [isAddMemberPickerOpen, setIsAddMemberPickerOpen] = useState(false);
  const textareaRef = useRef(null);

  // 채팅방/메시지 API는 참여자를 사번(member_ids/sender_id)으로만 내려주므로,
  // 화면에는 "부서 이름" 형태로 보여주기 위해 전체 직원 목록을 한 번 불러와
  // 사번 -> {name, departmentName} 맵을 만들어 둔다.
  const { data: allEmployees = [] } = useUserSearch({ scope: 'all' });
  const userDisplayMap = useMemo(() => {
    const map = {};
    allEmployees.forEach((emp) => {
      map[String(emp.userId)] = emp;
    });
    return map;
  }, [allEmployees]);

  const displayName = (userId) => {
    const emp = userDisplayMap[String(userId)];
    if (!emp) return String(userId);
    return emp.departmentName ? `${emp.departmentName} ${emp.name}` : emp.name;
  };

  useEffect(() => {
    // 이미 /chat 페이지에 머무른 상태에서 알림벨을 통해 다른 room으로 다시 딥링크되는 경우
    // (컴포넌트가 언마운트되지 않으므로 위 useState 초기값만으로는 반영되지 않음),
    // room 쿼리 파라미터가 바뀔 때마다 동일한 setSelectedRoomId 경로로 선택 상태를 갱신합니다.
    if (!roomParam) return;
    const parsedRoomId = Number(roomParam);
    if (Number.isNaN(parsedRoomId)) return;
    setSelectedRoomId(parsedRoomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomParam]);

  useEffect(() => {
    // 읽음 처리는 REST 호출이라 WebSocket 연결 상태와 무관합니다.
    // 소켓이 끊겨있거나 재연결 백오프 중이어도(최대 15초) 방을 선택/전환하면 즉시 호출되어야 합니다.
    if (!selectedRoomId) return;
    markReadMutation.mutate(selectedRoomId, {
      onError: () => setRoomError('읽음 처리에 실패했습니다.'),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoomId]);

  useEffect(() => {
    // 소켓이 연결되어 있을 때만 active_room을 보낼 수 있습니다.
    // isConnected가 false -> true로 바뀔 때(최초 연결/재연결 모두)도 이 effect가 다시 실행되어
    // 현재 선택된 방을 서버에 다시 알립니다.
    if (!isConnected) return undefined;

    setActiveRoom(selectedRoomId);
    return () => setActiveRoom(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoomId, isConnected]);

  useEffect(() => {
    setSendError('');
  }, [selectedRoomId]);

  // 입력창 높이를 내용에 맞춰 늘렸다 줄였다 한다 (최대 높이는 CSS max-height로 제한).
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

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

  const handleAddMembers = (selectedEmployees) => {
    setIsAddMemberPickerOpen(false);
    if (selectedEmployees.length === 0 || !selectedRoomId) return;
    setRoomError('');
    addMembersMutation.mutate(
      { roomId: selectedRoomId, memberIds: selectedEmployees.map((e) => e.userId) },
      {
        onError: (error) => {
          const message = error.response?.data?.detail || '인원 추가에 실패했습니다.';
          setRoomError(message);
        },
      }
    );
  };

  const handleLeaveRoom = (roomId) => {
    if (!window.confirm('이 채팅방에서 나가시겠습니까?')) return;
    leaveRoomMutation.mutate(roomId, {
      onSuccess: () => {
        if (selectedRoomId === roomId) setSelectedRoomId(null);
      },
      onError: () => setRoomError('채팅방 나가기에 실패했습니다.'),
    });
  };

  const roomLabel = (room) => {
    // room.name은 방 생성 시점의 이름(사번/이름)만 저장되어 있어 부서 정보가 없다.
    // 1:1/그룹 모두 항상 member_ids를 부서+이름으로 변환해 동일한 형식으로 보여준다.
    const others = room.member_ids.filter((id) => id !== currentUser?.userId);
    return others.map(displayName).join(', ') || '(참여자 없음)';
  };

  const currentRoom = rooms.find((r) => r.room_id === selectedRoomId);

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
            <button
              className="chat-room-leave-btn"
              aria-label="채팅방 나가기"
              onClick={(e) => {
                e.stopPropagation();
                handleLeaveRoom(room.room_id);
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </aside>

      <section className="chat-thread">
        {selectedRoomId ? (
          <>
            <div className="chat-thread-header">
              {currentRoom?.is_group && (
                <button
                  className="chat-add-member-btn"
                  onClick={() => setIsAddMemberPickerOpen(true)}
                >
                  + 인원 추가
                </button>
              )}
              <span className={`chat-connection-badge ${isConnected ? 'online' : 'offline'}`}>
                {isConnected ? '연결됨' : '연결 끊김'}
              </span>
            </div>
            <div className="chat-message-list">
              {isMessagesError && <div className="chat-inline-error">메시지를 불러오지 못했습니다.</div>}
              {[...messages].reverse().map((m) => (
                <div key={m.message_id} className={`chat-message ${m.sender_id === currentUser?.userId ? 'mine' : ''}`}>
                  <span className="chat-message-sender">{displayName(m.sender_id)}</span>
                  <p>{m.content}</p>
                </div>
              ))}
            </div>
            <div className="chat-input-area">
              <textarea
                ref={textareaRef}
                rows={1}
                className="chat-textarea"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="메시지를 입력하세요 (Shift+Enter로 줄바꿈)"
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

      {isAddMemberPickerOpen && currentRoom && (
        <EmployeeSearchModal
          multiSelect
          excludeUserIds={currentRoom.member_ids}
          onConfirm={handleAddMembers}
          onClose={() => setIsAddMemberPickerOpen(false)}
        />
      )}
    </div>
  );
}

export default ChatPage;
