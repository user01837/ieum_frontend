import api from './axios';

export const getAnnouncements = async (params) => {
  const { keyword, departmentCode, ...rest } = params;
  const queryParams = {
    ...rest,
    ...(keyword ? { keyword } : {}),
    ...(departmentCode ? { department_code: departmentCode } : {}),
  };
  const { data } = await api.get('/announcements', { params: queryParams });
  return data;
};

export const getAnnouncementDetail = async (id) => {
    const { data } = await api.get(`/announcements/${id}`);
    return data;
};

export const createAnnouncement = async (body) => {
    const { data } = await api.post('/announcements', body);
    return data;
};

export const updateAnnouncement = async (id, body) => {
    const { data } = await api.patch(`/announcements/${id}`, body);
    return data;
};

export const deleteAnnouncement = async (id) => {
    const { data } = await api.delete(`/announcements/${id}`);
    return data;
};

export const readAnnouncementNotifications = async () => {
    const { data } = await api.post('/announcements/read-notifications');
    return data;
};