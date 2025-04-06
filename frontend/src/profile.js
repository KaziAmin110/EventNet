// src/profile.js

// Load basic user info from localStorage
const name = localStorage.getItem("name") || "Unknown";
const email = localStorage.getItem("email") || "Unknown";
const role = localStorage.getItem("userRole") || "student";
const userId = localStorage.getItem("userId");

document.getElementById("profile-name").textContent = name;
document.getElementById("profile-email").textContent = email;
document.getElementById("profile-role").textContent = role;

// Fetch university and RSO info for the profile
async function fetchUserExtras() {
  try {
    const res = await fetch(`http://localhost:5500/api/users/${userId}/extras`); // route needs to be implemented in backend
    const data = await res.json();
    if (data.success) {
      document.getElementById("profile-university").textContent = data.university || "N/A";
      document.getElementById("profile-rsos").textContent = data.rsos?.join(", ") || "None";
    }
  } catch (err) {
    console.error("Error fetching profile extras:", err);
    document.getElementById("profile-university").textContent = "Unavailable";
    document.getElementById("profile-rsos").textContent = "Unavailable";
  }
}

if (userId) fetchUserExtras();

// Handle super admin promotion
const promoteBtn = document.getElementById("superadmin-promote");
const result = document.getElementById("superadmin-result");

promoteBtn.addEventListener("click", async () => {
  const secret_token = document.getElementById("superadmin-secret").value;
  if (!secret_token || !userId) return;

  try {
    const res = await fetch("http://localhost:5500/api/users/roles/super_admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, secret_token })
    });

    const data = await res.json();
    result.textContent = data.message;
    result.style.color = data.success ? "green" : "red";

    if (data.success) {
      localStorage.setItem("userRole", "super_admin");
      document.getElementById("profile-role").textContent = "super_admin";
    }
  } catch (err) {
    console.error("Promotion failed:", err);
    result.textContent = "Server error";
    result.style.color = "red";
  }
});

// Log out
const logoutBtn = document.getElementById("logout-button");
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});
