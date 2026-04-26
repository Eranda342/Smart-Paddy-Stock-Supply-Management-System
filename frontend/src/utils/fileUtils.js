import { BASE_URL } from "../api/api";

export const getFileUrl = (value) => {
  if (!value) return "/placeholder.png";

  if (value.startsWith("http")) {
    return value;
  }

  return "/placeholder.png";
};
