import api from './axios';

export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const registerDeviceToken = async (fcmToken) => {
  await api.post('/notifications/device-token', { fcm_token: fcmToken });
};

export const unregisterDeviceToken = async (fcmToken) => {
  await api.delete('/notifications/device-token', { data: { fcm_token: fcmToken } });
};
