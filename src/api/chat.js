import api from './axios';

export const createChatRoom = async ({ memberIds, name }) => {
  const response = await api.post('/chat/rooms', { member_ids: memberIds, name });
  return response.data;
};

export const getChatRooms = async () => {
  const response = await api.get('/chat/rooms');
  return response.data;
};

export const getChatRoomMessages = async ({ roomId, beforeMessageId, size = 30 }) => {
  const params = { size };
  if (beforeMessageId) params.before_message_id = beforeMessageId;
  const response = await api.get(`/chat/rooms/${roomId}/messages`, { params });
  return response.data;
};

export const markChatRoomRead = async (roomId) => {
  await api.post(`/chat/rooms/${roomId}/read`);
};

export const addChatRoomMembers = async ({ roomId, memberIds }) => {
  const response = await api.post(`/chat/rooms/${roomId}/members`, { member_ids: memberIds });
  return response.data;
};

export const leaveChatRoom = async (roomId) => {
  await api.delete(`/chat/rooms/${roomId}`);
};

export const renameChatRoom = async ({ roomId, name }) => {
  const response = await api.patch(`/chat/rooms/${roomId}`, { name });
  return response.data;
};
