import axios from 'axios';
export const api = axios.create({
  baseURL: process.enve.API_URL,
  withCredentials: true
});
