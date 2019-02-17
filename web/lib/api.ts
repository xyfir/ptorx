import { API } from 'constants/config';
import axios from 'axios';

export const api = axios.create({
  baseURL: `${API}/api/6`,
  withCredentials: true
});
