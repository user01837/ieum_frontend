import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  updateKnowledge,
  createKnowledge,
  deleteKnowledgeAttachment,
  deleteKnowledge,
  createKnowledgeTag,
  createKnowledgeLog,
  updateKnowledgeLog,
  deleteKnowledgeLog,
} from '../../api/knowledge';

/**
 * 지식베이스 정보를 수정하는 뮤테이션
 */
export const useUpdateKnowledgeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateKnowledge,
    onSuccess: (data, variables) => {
      // 수정 성공 시, 해당 지식 상세 정보 쿼리를 무효화하여 최신 데이터로 갱신
      queryClient.invalidateQueries({ queryKey: ['knowledgeDetail', variables.knowledgeId] });
      // 목록 쿼리도 무효화할 수 있음
      queryClient.invalidateQueries({ queryKey: ['knowledgeList'] });
      alert('지식베이스가 성공적으로 수정되었습니다.');
    },
    onError: (error) => {
      alert(`수정 중 오류가 발생했습니다: ${error.response?.data?.detail || error.message}`);
    },
  });
};

/**
 * 지식베이스 항목을 삭제하는 뮤테이션
 */
export const useDeleteKnowledgeMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ knowledgeId }) => deleteKnowledge(knowledgeId),
    onSuccess: () => {
      // 목록 쿼리를 무효화하여 목록 페이지를 최신 상태로 만듭니다.
      queryClient.invalidateQueries({ queryKey: ['knowledgeList'] });
      alert('지식베이스가 삭제되었습니다.');
      navigate('/knowledge'); // 목록 페이지로 이동
    },
    onError: (error) => {
      alert(`삭제 중 오류가 발생했습니다: ${error.response?.data?.detail || error.message}`);
    },
  });
};

/**
 * 새 지식베이스를 생성하는 뮤테이션
 */
export const useCreateKnowledgeMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createKnowledge,
    onSuccess: (data) => {
      // 목록 쿼리를 무효화하여 최신 데이터로 갱신
      queryClient.invalidateQueries({ queryKey: ['knowledgeList'] });
      alert('새로운 지식베이스가 성공적으로 생성되었습니다.');
      // 생성된 지식 상세 페이지로 이동
      navigate(`/knowledge/${data.knowledge_id}`);
    },
    onError: (error) => {
      alert(`생성 중 오류가 발생했습니다: ${error.response?.data?.detail || error.message}`);
    },
  });
};

/**
 * 지식베이스 첨부파일을 삭제하는 뮤테이션
 */
export const useDeleteKnowledgeAttachmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attachmentId }) => deleteKnowledgeAttachment(attachmentId),
    onSuccess: (data, { knowledgeId }) => {
      // 상세 정보 쿼리를 무효화하여 첨부파일 목록을 갱신합니다.
      queryClient.invalidateQueries({ queryKey: ['knowledgeDetail', knowledgeId] });
      alert('첨부파일이 삭제되었습니다.');
    },
    onError: (error) => {
      alert(`첨부파일 삭제 중 오류가 발생했습니다: ${error.response?.data?.detail || error.message}`);
    },
  });
};

/**
 * 새 지식 태그를 생성하는 뮤테이션
 */
export const useCreateKnowledgeTagMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createKnowledgeTag,
    onSuccess: (data, variables) => {
      // 이 부서의 태그 목록 쿼리를 무효화하여 갱신
      queryClient.invalidateQueries({ queryKey: ['knowledgeTags', variables.department_code] });
    },
    onError: (error) => {
      // 409 Conflict 에러는 특별히 처리
      if (error.response?.status === 409) {
        alert('이미 존재하는 태그입니다.');
      } else {
        alert(`태그 생성 중 오류가 발생했습니다: ${error.response?.data?.detail || error.message}`);
      }
      // 에러를 다시 던져서 `mutateAsync`의 catch 블록에서 처리할 수 있도록 함
      throw error;
    },
  });
};

/**
 * 새 노하우 로그를 생성하는 뮤테이션
 */
export const useCreateKnowledgeLogMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createKnowledgeLog,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeDetail', variables.knowledgeId] });
      alert('노하우가 성공적으로 등록되었습니다.');
    },
    onError: (error) => {
      alert(`노하우 등록 중 오류가 발생했습니다: ${error.response?.data?.detail || error.message}`);
    },
  });
};

/**
 * 노하우 로그를 수정하는 뮤테이션
 */
export const useUpdateKnowledgeLogMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateKnowledgeLog,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeDetail', variables.knowledgeId] });
      alert('노하우가 성공적으로 수정되었습니다.');
    },
    onError: (error) => {
      alert(`노하우 수정 중 오류가 발생했습니다: ${error.response?.data?.detail || error.message}`);
    },
  });
};

/**
 * 노하우 로그를 삭제하는 뮤테이션
 */
export const useDeleteKnowledgeLogMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ logId }) => deleteKnowledgeLog(logId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeDetail', variables.knowledgeId] });
      alert('노하우가 삭제되었습니다.');
    },
    onError: (error) => {
      alert(`노하우 삭제 중 오류가 발생했습니다: ${error.response?.data?.detail || error.message}`);
    },
  });
};