import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAnnouncements, getAnnouncementDetail, createAnnouncement, updateAnnouncement, deleteAnnouncement, readAnnouncementNotifications } from '../../api/announcement';

export const useAnnouncementsQuery = (params) => useQuery({
    queryKey: ['announcements', params],
    queryFn: () => getAnnouncements(params),
});

export const useAnnouncementDetailQuery = (id) => useQuery({
    queryKey: ['announcement', id],
    queryFn: () => getAnnouncementDetail(id),
    enabled: !!id,
});

export const useCreateAnnouncementMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createAnnouncement,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
    });
};

export const useUpdateAnnouncementMutation = (id) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body) => updateAnnouncement(id, body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['announcements'] });
            qc.invalidateQueries({ queryKey: ['announcement', id] });
        },
    });
};

export const useDeleteAnnouncementMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteAnnouncement,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
    });
};

export const useReadAnnouncementNotificationsMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: readAnnouncementNotifications,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    });
};