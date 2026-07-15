import api from './axios';

/**
 * 법률 챗봇에게 질문을 보냅니다.
 * @param {object} payload - 질문 데이터
 * @param {string} payload.question - 사용자의 질문
 * @returns {Promise<object>} - AI의 답변 ({ answer: string, referenced_articles: ...[] })
 */
export const postLegalChat = async ({ question }) => {
  const { data } = await api.post('/ai/legal-chat', { question });
  return data;
};