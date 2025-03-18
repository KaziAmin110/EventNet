// auth.js
import supabase from "./supabaseClient.js";
import api, { setAccessToken } from "./api/axiosInstance.js";

// Sign In Functionality with Access Token Storage in LocalStorage
export async function signUp(name, email, password) {
  try {
    const response = await api.post("/auth/sign-up", {
      name: name,
      email: email,
      password: password,
    });

    setAccessToken(response.data.accessToken);
    return response.data;
  } catch (error) {
    console.error("Sign In Error: ", error);
    throw error;
  }
}

// Sign In Functionality with Access Token Storage in LocalStorage
export async function signIn(email, password) {
  try {
    const response = await api.post("/auth/sign-in", {
      email: email,
      password: password,
    });

    setAccessToken(response.data.accessToken); // Sets Access Token In Local Storage
    return response.data;
  } catch (error) {
    console.error("Sign In Error: ", error);
    throw error;
  }
}

// Automatically Refreshes Access Token Upon Token Expiration
export const refreshAccessToken = async () => {
  try {
    const response = await api.get("/auth/refresh"); // Cookie-based refresh
    setAccessToken(response.accessToken); // Sets New Access Token in Local Storage
    return response.data;
  } catch (error) {
    console.error("Token refresh error:", error);
    throw error;
  }
};

// Gets User Information API Endpoint Call
export const getUserInfo = async () => {
  try {
    const response = await api.get("/users/me");
    return response.data;
  } catch (error) {
    console.error("Get User Information Error:", error);
    throw error;
  }
};
