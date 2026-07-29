import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '../../api/notification';

export const useNotificationsQuery = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 30000,
  });
};
