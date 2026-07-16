import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask, deleteTask, addAssignee } from '../../api/task';

export const useCreateTaskMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departmentTasks'] });
        },
    });
};

export const useDeleteTaskMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departmentTasks'] });
        },
    });
};

export const useAddAssigneeMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addAssignee,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departmentTasks'] });
        },
    });
};