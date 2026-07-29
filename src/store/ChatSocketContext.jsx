import React, { createContext, useContext } from 'react';
import { useChatSocket } from '../hooks/useChatSocket';

const ChatSocketContext = createContext(null);

export function ChatSocketProvider({ children }) {
  const socket = useChatSocket();
  return (
    <ChatSocketContext.Provider value={socket}>
      {children}
    </ChatSocketContext.Provider>
  );
}

export function useChatSocketContext() {
  const ctx = useContext(ChatSocketContext);
  if (!ctx) {
    throw new Error('useChatSocketContext는 ChatSocketProvider 내부에서만 사용할 수 있습니다.');
  }
  return ctx;
}
