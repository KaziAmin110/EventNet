// profile.js
import api from "./api/axiosInstance.js";

// 🔒 Block access if no token is present
const token = localStorage.getItem("accessToken");
if (!token) {
  console.warn("No token found — redirecting to login.");
  window.location.href = "index.html";
}

// Load user info from backend
async function loadUserInfo() {
  try {
    const res = await api.get("/users/me");
    const user = res.data.data;

    document.getElementById("profile-name").textContent = user.name;
    document.getElementById("profile-email").textContent = user.email;
    document.getElementById("profile-role").textContent = user.role || "student";

    localStorage.setItem("userId", user.user_id);
    localStorage.setItem("userRole", user.role);
    fetchUserExtras(user.user_id);
  } catch (err) {
    console.error("Error fetching user info:", err);
    window.location.href = "index.html";
  }
}

// Fetch university and RSO info for the profile
async function fetchUserExtras(userId) {
  try {
    const res = await api.get(`/users/${userId}/extras`);
    const data = res.data;
    console.log("User extras response:", data);

    const university = data.data?.university || "Unavailable";
    const rsos = data.data?.rsos || [];

    document.getElementById("profile-university").textContent = university;
    document.getElementById("profile-rsos").textContent = rsos.length ? rsos.join(", ") : "None";
  } catch (err) {
    console.error("Error fetching profile extras:", err);
    document.getElementById("profile-university").textContent = "Unavailable";
    document.getElementById("profile-rsos").textContent = "Unavailable";
  }
}


      const selector = document.getElementById('theme-selector');
    
      function setTheme(theme) {
        // Remove any existing theme classes
        document.body.className = '';
    
        // Add the selected theme class if it's not default
        if (theme) {
          document.body.classList.add(theme);
        }
    
        // Save choice to localStorage
        localStorage.setItem('theme', theme);
      }
    
      // When the dropdown changes
      selector.addEventListener('change', (e) => {
        const selectedTheme = e.target.value;
        setTheme(selectedTheme);
      });
    
      // On page load, apply saved theme
      window.addEventListener('DOMContentLoaded', () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
          document.body.classList.add(savedTheme);
          selector.value = savedTheme;
        }
      });
    

// Log out
const logoutBtn = document.getElementById("logout-button");
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});
const backBtn = document.getElementById("back-button");
backBtn.addEventListener("click", () => {
  window.location.href = "universities.html";
});


// Start loading
loadUserInfo();
