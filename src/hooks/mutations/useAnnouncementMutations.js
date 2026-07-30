import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  readAnnouncementNotifications,
} from '../../api/announcement';

// 공지사항 생성
export const useCreateAnnouncementMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      alert('공지사항이 등록되었습니다.');
    },
    onError: (error) => {
      alert(`등록 중 오류가 발생했습니다: ${error.response?.data?.detail || error.message}`);
    },
  });
};

// 공지사항 수정
export const useUpdateAnnouncementMutation = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => updateAnnouncement({ id, formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcementDetail', id] });
      alert('공지사항이 수정되었습니다.');
    },
    onError: (error) => {
      alert(`수정 중 오류가 발생했습니다: ${error.response?.data?.detail || error.message}`);
    },
  });
};

// 공지사항 삭제
export const useDeleteAnnouncementMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      // 삭제 성공 시 alert는 사용하는 컴포넌트에서 직접 처리합니다.
    },
    onError: (error) => {
      alert(`삭제 중 오류가 발생했습니다: ${error.response?.data?.detail || error.message}`);
    },
  });
};

// 공지사항 알림 읽음 처리
export const useReadAnnouncementNotificationsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: readAnnouncementNotifications,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
        onError: (error) => {
          console.error("Failed to mark announcement notifications as read", error);
        }
    });
};