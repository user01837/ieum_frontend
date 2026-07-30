import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import './ChatPage.css';
import '../Petition/Detail_petition.css'; // 민원 상세의 첨부파일 스타일 재사용
import { useChatRoomsQuery, useChatRoomMessagesQuery } from '../../hooks/queries/useChatQuery';
import { useCreateChatRoomMutation, useMarkChatRoomReadMutation, useAddChatRoomMembersMutation, useLeaveChatRoomMutation, useRenameChatRoomMutation } from '../../hooks/mutations/useChatMutations';
import { useChatSocketContext } from '../../store/ChatSocketContext';
import useAuthStore from '../../store/useAuthStore';
import EmployeeSearchModal from '../../components/EmpSearchModal/EmpSearchModal';
import { useUserSearch } from '../../hooks/queries/useUserQuery';

/* ── 아이콘 (inline SVG, 외부 라이브러리 없이) ── */
const IconPerson = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const IconGroup = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconInfo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="8" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="12" y1="12" x2="12" y2="16" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const IconAttach = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.41 17.41A2 2 0 016.59 14.59l8.49-8.48"/>
  </svg>
);
const IconEmoji = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);
const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
  </svg>
);
const IconChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

/* 시간 포맷 헬퍼 */
const formatTime = (isoStr) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h < 12 ? '오전' : '오후';
  return `${ampm} ${h % 12 || 12}:${m}`;
};

const formatDate = (isoStr) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${['일','월','화','수','목','금','토'][d.getDay()]})`;
};

const isSameDay = (a, b) => {
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate();
};

function ChatPage() {
  const currentUser = useAuthStore((state) => state.user);
  const { data: rooms = [], isError: isRoomsError } = useChatRoomsQuery();
  const [searchParams] = useSearchParams();
  const roomParam = searchParams.get('room');
  const [selectedRoomId, setSelectedRoomId] = useState(roomParam ? Number(roomParam) : null);
  const [draft, setDraft] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [sendError, setSendError] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [roomError, setRoomError] = useState('');
  const [roomSearch, setRoomSearch] = useState('');

  const { data: messages = [], isError: isMessagesError } = useChatRoomMessagesQuery(selectedRoomId);
  const { isConnected, sendMessage, setActiveRoom } = useChatSocketContext();
  const createRoomMutation = useCreateChatRoomMutation();
  const markReadMutation = useMarkChatRoomReadMutation();
  const addMembersMutation = useAddChatRoomMembersMutation();
  const leaveRoomMutation = useLeaveChatRoomMutation();
  const renameRoomMutation = useRenameChatRoomMutation();
  const [isAddMemberPickerOpen, setIsAddMemberPickerOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const textareaRef = useRef(null);
  const messageListRef = useRef(null);
  const participantsRef = useRef(null);

  const { data: allEmployees = [] } = useUserSearch({ scope: 'all' });
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

  // --- 파일 첨부 로직 (react-dropzone) ---
  const onDrop = useCallback(acceptedFiles => {
    if (attachedFiles.length + acceptedFiles.length > 5) {
      alert('파일은 최대 5개까지 첨부할 수 있습니다.');
      return;
    }
    const newUniqueFiles = acceptedFiles.filter(
      newFile => !attachedFiles.some(existingFile => existingFile.path === newFile.path && existingFile.size === newFile.size)
    );
    setAttachedFiles(prev => {
      return [...prev, ...newUniqueFiles].slice(0, 5);
    });
  }, [attachedFiles]);

  const onDropRejected = useCallback((fileRejections) => {
    const largeFile = fileRejections.find(f => f.errors.some(e => e.code === 'file-too-large'));
    if (largeFile) {
      alert(`오류: 파일 크기는 10MB를 초과할 수 없습니다. (${largeFile.file.name})`);
    }
  }, []);

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    multiple: true,
    maxSize: 10485760, // 10MB
    noClick: true,
    noKeyboard: true,
  });

  const removeFile = (fileToRemove) => setAttachedFiles(prev => prev.filter(file => file !== fileToRemove));

  useEffect(() => {
    if (!roomParam) return;
    const parsed = Number(roomParam);
    if (Number.isNaN(parsed)) return;
    setSelectedRoomId(parsed);
  }, [roomParam]);

  useEffect(() => {
    if (!selectedRoomId) return;
    markReadMutation.mutate(selectedRoomId, {
      onError: () => setRoomError('읽음 처리에 실패했습니다.'),
    });
  }, [selectedRoomId]);

  useEffect(() => {
    if (!isConnected) return undefined;
    setActiveRoom(selectedRoomId);
    return () => setActiveRoom(null);
  }, [selectedRoomId, isConnected]);

  useEffect(() => { setSendError(''); }, [selectedRoomId]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

  // 새 메시지 오면 스크롤 하단 이동
  useEffect(() => {
    const el = messageListRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // 방을 바꾸면 이전 방의 참여자 목록 드롭다운은 닫아둔다.
  useEffect(() => { setIsParticipantsOpen(false); }, [selectedRoomId]);

  useEffect(() => {
    if (!isParticipantsOpen) return undefined;
    const handler = (e) => {
      if (participantsRef.current && !participantsRef.current.contains(e.target)) {
        setIsParticipantsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isParticipantsOpen]);

  const handleSend = () => {
    if ((!draft.trim() && attachedFiles.length === 0) || !selectedRoomId) return;

    if (attachedFiles.length > 0) {
      // TODO: 파일 전송 로직 구현 필요
      console.log('파일을 전송합니다:', attachedFiles.map(f => f.name));
    }

    if (draft.trim()) {
      const sent = sendMessage(selectedRoomId, draft.trim());
      if (!sent) {
        setSendError('연결이 끊겨 있어 메시지를 보낼 수 없습니다.');
        return;
      }
    }
    setDraft('');
    setAttachedFiles([]);
    setSendError('');
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
          setRoomError(error.response?.data?.detail || '채팅방 생성에 실패했습니다.');
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

  const handleRenameRoom = () => {
    if (!selectedRoomId) return;
    const nextName = window.prompt('새 채팅방 이름을 입력하세요.', selectedRoomLabel);
    if (nextName === null) return; // 취소
    const trimmed = nextName.trim();
    if (!trimmed) return;
    setRoomError('');
    renameRoomMutation.mutate(
      { roomId: selectedRoomId, name: trimmed },
      { onError: () => setRoomError('채팅방 이름 변경에 실패했습니다.') }
    );
  };

  const roomLabel = (room) => {
    // 그룹방 생성 시 지정된 이름(예: 사업 협업방의 "[사업] ...")이 있으면 그대로 보여준다.
    // 이름이 없는 방(1:1, 또는 이름 없이 만든 그룹방)만 참여자 목록으로 대체 표시한다.
    if (room.name) return room.name;
    const others = room.member_ids.filter((id) => id !== currentUser?.userId);
    return others.map(displayName).join(', ') || '(참여자 없음)';
  };

  const currentRoom = rooms.find((r) => r.room_id === selectedRoomId);
  const selectedRoom = rooms.find((r) => r.room_id === selectedRoomId);
  const selectedRoomLabel = selectedRoom ? roomLabel(selectedRoom) : '';
  const selectedRoomMemberCount = selectedRoom?.member_ids?.length ?? 0;

  /* 메시지를 오래된 순으로 정렬 + 날짜 구분선 삽입 */
  const sortedMessages = useMemo(() => [...messages].reverse(), [messages]);

  const filteredRooms = useMemo(() => {
    if (!roomSearch.trim()) return rooms;
    const q = roomSearch.trim().toLowerCase();
    return rooms.filter((r) => roomLabel(r).toLowerCase().includes(q));
  }, [rooms, roomSearch, userDisplayMap]);


  return (
    <div className="chat-page">
      {/* ── 좌측: 채팅방 목록 ── */}
      <aside className="chat-room-list">
        <div className="chat-room-list-header">
          <input
            className="chat-search-input"
            placeholder="채팅방 검색"
            value={roomSearch}
            onChange={(e) => setRoomSearch(e.target.value)}
          />
          {/* <button className="chat-sort-btn">최신순 ▾</button> */}
          <button className="chat-new-room-btn" onClick={() => setIsPickerOpen(true)} title="새 채팅">+ 새 채팅</button>
        </div>

        {roomError && <div className="chat-inline-error">{roomError}</div>}
        {isRoomsError && <div className="chat-inline-error">채팅방 목록을 불러오지 못했습니다.</div>}

        {filteredRooms.map((room) => (
          <div
            key={room.room_id}
            className={`chat-room-item ${selectedRoomId === room.room_id ? 'active' : ''}`}
            onClick={() => setSelectedRoomId(room.room_id)}
          >
      <div className="chat-room-avatar">
        {room.member_ids.length > 2 ? <IconGroup /> : <IconPerson />}
      </div>
      <div className="chat-room-body">
        <div className="chat-room-meta">
          <span className="chat-room-name">{roomLabel(room)}</span>
          <span className="chat-room-time">
            {room.last_message_at ? formatTime(room.last_message_at) : ''}
          </span>
        </div>
        <div className="chat-room-preview">
          {room.last_message || '대화를 시작해보세요'}
        </div>
      </div>
      {room.unread_count > 0 && (
        <span className="chat-unread-badge">{room.unread_count}</span>
      )}
      <button
        className="chat-room-leave-btn"
        aria-label="채팅방 나가기"
        title="채팅방 나가기"
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

      {/* ── 우측: 채팅 스레드 ── */}
      <section className="chat-thread">
        {selectedRoomId ? (
          <>
            {/* 헤더 */}
            <div className="chat-thread-header">
              <div className="chat-thread-header-left">
                <div className="chat-thread-title-row">
                  <span className="chat-thread-title">{selectedRoomLabel}</span>
                  <button
                    className="chat-rename-badge"
                    onClick={handleRenameRoom}
                    title="채팅방 이름 변경"
                    aria-label="채팅방 이름 변경"
                  >
                    ✎ 이름변경
                  </button>
                </div>
                <div className="chat-participants-wrap" ref={participantsRef}>
                  <button
                    type="button"
                    className="chat-thread-subtitle"
                    onClick={() => setIsParticipantsOpen((v) => !v)}
                  >
                    참여자 {selectedRoomMemberCount}명 <IconChevronDown />
                  </button>
                  {isParticipantsOpen && selectedRoom && (
                    <div className="chat-participants-dropdown">
                      {selectedRoom.member_ids.map((id) => (
                        <div key={id} className="chat-participant-item">
                          {displayName(id)}
                          {id === currentUser?.userId && <span className="chat-participant-me"> (나)</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="chat-thread-header-right">
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
                {/* <button className="chat-icon-btn"><IconSearch /></button>
                <button className="chat-icon-btn"><IconInfo /></button> */}
              </div>
            </div>

            {/* 메시지 목록 */}
            <div className="chat-message-list" ref={messageListRef}>
              {isMessagesError && (
                <div className="chat-inline-error">메시지를 불러오지 못했습니다.</div>
              )}
              {sortedMessages.map((m, idx) => {
                const isMine = m.sender_id === currentUser?.userId;
                const prev = sortedMessages[idx - 1];
                const showDate = !prev || !isSameDay(prev.created_at ?? prev.sent_at, m.created_at ?? m.sent_at);

                return (
                  <React.Fragment key={m.message_id}>
                    {showDate && (
                      <div className="chat-date-divider">
                        {formatDate(m.created_at ?? m.sent_at)}
                      </div>
                    )}
                    <div className={`chat-message-group ${isMine ? 'mine' : ''}`}>
                      {!isMine && (
                        <span className="chat-message-group-sender">{displayName(m.sender_id)}</span>
                      )}
                      <div className="chat-message-bubble-row">
                        <div className={`chat-message ${isMine ? 'mine' : ''}`}>{m.content}</div>
                        <span className="chat-message-time">
                          {formatTime(m.created_at ?? m.sent_at)}
                        </span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* 입력창 */}
            <div className="chat-input-area" {...getRootProps()}>
              {isDragActive && <div className="chat-dropzone-overlay">파일을 여기에 드롭하세요</div>}
              <input {...getInputProps()} />

              {attachedFiles.length > 0 && (
                <div className="attach-list" style={{ padding: '8px 12px', borderTop: '1px solid var(--line)' }}>
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="reply-attach-chip">
                      <svg className="ic" viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c-1.93 0-3.5 1.57-3.5 3.5v11.5c0 2.76 2.24 5 5 5s5-2.24 5-5V6h-1.5z"></path></svg>
                      <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                      <button type="button" className="rm" onClick={() => removeFile(file)}>
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="chat-input-row">
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
                <button className="chat-attach-btn" title="파일 첨부" onClick={open}><IconAttach /></button>
                <button className="chat-send-btn" onClick={handleSend} disabled={!draft.trim() && attachedFiles.length === 0}>
                  <IconSend /> 전송
                </button>
              </div>
              {sendError && <div className="chat-inline-error">{sendError}</div>}
            </div>
          </>
        ) : (
          <div className="chat-empty-state">채팅방을 선택하거나 새 채팅을 시작하세요.</div>
        )}
      </section>

      {isPickerOpen && (
        <EmployeeSearchModal
          multiSelect
          onConfirm={handlePickEmployees}
          onClose={() => setIsPickerOpen(false)}
        />
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