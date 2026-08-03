import { useMutation } from '@tanstack/react-query';
import { postLegalChat, postKnowledgeChat } from '../../api/chatbot';

/**
 * 법률 챗봇 질문을 위한 Mutation
 * @param {object} options - react-query useMutation options
 */
export const useLegalChatMutation = (options) => {
  return useMutation({
    mutationFn: postLegalChat,
    ...options,
  });
};

/**
 * 노하우(지식베이스) 챗봇 질문을 위한 Mutation
 * @param {object} options - react-query useMutation options
 */
export const useKnowledgeChatMutation = (options) => {
  return useMutation({
    mutationFn: postKnowledgeChat,
    ...options,
  });
};