import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, //백엔드 주소를 env파일에서 설정된 내용으로 가지고옴
});

export default api;

// 3. API 파일에서 사용

// 예를 들어 로그인 API를 만든다면

// src/api/auth.js

// import api from "./axios";

// export const login = (data) => {
//   return api.post("/login", data);
// };

// 회원가입

// export const signup = (data) => {
//   return api.post("/signup", data);
// };
// 4. 컴포넌트에서 호출

// 예를 들어 Login.jsx

// import { login } from "../../api/auth";

// const handleLogin = async () => {
//   try {
//     const res = await login({
//       username: id,
//       password: pw,
//     });

//     console.log(res.data);
//   } catch (err) {
//     console.error(err);
//   }
// };

// 그러면 실제 요청은

// POST http://localhost:8000/login

// 으로 나간다.

// 5. 게시글 API라면

// src/api/document.js

// import api from "./axios";

// export const getDocuments = () => {
//   return api.get("/documents");
// };

// export const getDocument = (id) => {
//   return api.get(`/documents/${id}`);
// };

// export const createDocument = (data) => {
//   return api.post("/documents", data);
// };

// 컴포넌트에서는

// import { getDocuments } from "../../api/document";

// const loadData = async () => {
//   const res = await getDocuments();
//   console.log(res.data);
// };