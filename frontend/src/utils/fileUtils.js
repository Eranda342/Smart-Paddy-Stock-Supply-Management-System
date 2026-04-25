import { BASE_URL } from "../api/api";

export const getFileUrl = (value) => {
  if (!value) return '';

  if (value.startsWith('http')) return value;

  if (value.startsWith('/uploads/')) {
    return `${BASE_URL}${value}`;
  }

  return `${BASE_URL}/uploads/${value}`;
};
