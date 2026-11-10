import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const apiRoot = import.meta.env.VITE_API_ROOT_URL;

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const getCsrfCookie = async () => {
  try {
    await axios.get(`${apiRoot}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
  } catch (error) {
    console.error("Error getting CSRF cookie:", error);
  }
};
