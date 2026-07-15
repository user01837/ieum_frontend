import { useMutation } from '@tanstack/react-query';
import { postLegalChat } from '../../api/chatbot';

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