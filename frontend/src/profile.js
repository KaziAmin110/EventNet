import api from "./api/axiosInstance.js";

// Load user info from backend using axiosInstance
async function loadUserInfo() {
  try {
    const res = await api.get("/users/me");
    const user = res.data.data;

    document.getElementById("profile-name").textContent = user.name;
    document.getElementById("profile-email").textContent = user.email;
    document.getElementById("profile-role").textContent = user.role || "student";

    fetchUserExtras(user.user_id);
  } catch (err) {
    console.error("Error fetching user info:", err);
  }
}


// Fetch university and RSO info for the profile
async function fetchUserExtras(userId) {
  try {
    const res = await api.get(`/users/${userId}/extras`);
    const data = res.data;
    console.log("User extras response:", data);

    // Check if the response format includes the info inside a data field
    const university = data.data?.university || data.university || "Unavailable";
    const rsos = data.data?.rsos || data.rsos || [];

    document.getElementById("profile-university").textContent = uni_name || "N/A";
    document.getElementById("profile-rsos").textContent = rsos.length ? rsos.join(", ") : "None";
  } catch (err) {
    console.error("Error fetching profile extras:", err);
    document.getElementById("profile-university").textContent = "Unavailable";
    document.getElementById("profile-rsos").textContent = "Unavailable";
  }
}

// Log out
const logoutBtn = document.getElementById("logout-button");
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";  
});

// Start loading
loadUserInfo();
