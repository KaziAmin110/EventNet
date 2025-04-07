import api from "./axiosInstance.js";
import { getUserInfo } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const currentUser = await getUserInfo();
    const allRSOs = await getUniversityRSOs();

    const yourRSOs = [];
    const availableRSOs = [];

    for (const rso of allRSOs) {
      if (rso.admin_user_id === currentUser.id) {
        yourRSOs.push({ ...rso, role: "admin" });
      } else {
        // If API expands, check members list too — here just separating
        availableRSOs.push(rso);
      }
    }

    renderYourRSOs(yourRSOs);
    renderAvailableRSOs(availableRSOs);
  } catch (err) {
    console.error("Error loading RSOs:", err);
  }

  // Home button routing fix
  const homeNavLink = document.querySelector('nav.taskbar a[href="#"]');
  if (homeNavLink) {
    homeNavLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "home.html";
    });
  }
});

async function getUniversityRSOs() {
  const response = await api.get("/rsos/university"); // Adjust to match your actual endpoint path
  return response.data.data;
}

function renderYourRSOs(rsos) {
  const container = document.getElementById("your-rsos");
  if (!rsos.length) {
    container.innerHTML = "<p>You are not part of any RSOs yet.</p>";
    return;
  }

  container.innerHTML = rsos.map(rso => `
    <div class="rso-card">
      <h3>${rso.rso_name}</h3>
      <button class="btn" onclick="inviteMember(${rso.rso_id})">Invite by Email</button>
      <button class="btn" onclick="leaveRSO(${rso.rso_id})">Leave RSO</button>
    </div>
  `).join("");
}

function renderAvailableRSOs(rsos) {
  const container = document.getElementById("available-rsos");
  if (!rsos.length) {
    container.innerHTML = "<p>No RSOs available to join.</p>";
    return;
  }

  container.innerHTML = rsos.map(rso => `
    <div class="rso-card">
      <h3>${rso.rso_name}</h3>
      <button class="btn" onclick="joinRSO(${rso.rso_id})">Join</button>
    </div>
  `).join("");
}

window.inviteMember = async function (rsoId) {
  const email = prompt("Enter email to invite:");
  if (!email) return;

  try {
    await api.post(`/rsos/${rsoId}/invite`, { email });
    alert("Invitation sent!");
  } catch (err) {
    alert("Failed to send invite.");
  }
};

window.leaveRSO = async function (rsoId) {
  if (!confirm("Are you sure you want to leave this RSO?")) return;

  try {
    await api.post(`/rsos/${rsoId}/leave`);
    window.location.reload();
  } catch (err) {
    alert("Could not leave RSO.");
  }
};

window.joinRSO = async function (rsoId) {
  try {
    await api.post(`/rsos/${rsoId}/join`);
    window.location.reload();
  } catch (err) {
    alert("Could not join RSO.");
  }
};
