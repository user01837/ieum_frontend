import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProject, updateProject, approveProject, deleteProject, changeProjectOwner } from '../../api/project';

/**
 * 새 프로젝트 생성 뮤테이션 Hook
 */
export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

/**
 * 프로젝트 저장 (수정) 뮤테이션 Hook
 */
export const useUpdateProjectMutation = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body) => updateProject(projectId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

/**
 * 기획서 승인완료 뮤테이션 Hook
 */
export const useApproveProjectMutation = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => approveProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
};

/**
 * 프로젝트 삭제 뮤테이션 Hook
 */
export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

/**
 * 사업 주관자 변경 뮤테이션 Hook
 */
export const useChangeProjectOwnerMutation = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newOwnerUserId) => changeProjectOwner(projectId, newOwnerUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
};