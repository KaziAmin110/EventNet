const token = localStorage.getItem("accessToken");
const joinedList = document.getElementById("your-rsos");
const availableList = document.getElementById("available-rsos");

if (!token) {
  alert("Please log in.");
  window.location.href = "index.html";
}

async function getUserUniversities() {
  const res = await fetch("http://localhost:5500/api/universities/me", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const result = await res.json();
  return result.data.map(u => u.uni_id); // return array of uni_ids
}

async function getJoinedRSOs() {
  const res = await fetch("http://localhost:5500/api/universities/rsos/me", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const result = await res.json();
  return result.data || [];
}

async function getRSOsAtUniversity(uniId) {
  const res = await fetch(`http://localhost:5500/api/universities/${uniId}/rsos`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const result = await res.json();
  return result.data || [];
}

function renderRSOList(container, rsos, buttonLabel = null, clickHandler = null) {
  container.innerHTML = "";

  if (!rsos.length) {
    const emptyMsg = document.createElement("p");
    emptyMsg.textContent = "No RSOs to show.";
    container.appendChild(emptyMsg);
    return;
  }

  rsos.forEach(rso => {
    const li = document.createElement("li");
    li.className = "rso-card"; // Apply your card style

    // Card content
    li.innerHTML = `
      <h3>${rso.rso_name}</h3>
      <p>Members: ${rso.num_members ?? 0}</p>
      <p>Status: ${rso.rso_status ?? "unknown"}</p>
    `;

    // Add action button if needed (e.g., Join)
    if (buttonLabel && clickHandler) {
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.textContent = buttonLabel;
      btn.addEventListener("click", () => clickHandler(rso));
      li.appendChild(btn);
    }

    container.appendChild(li);
  });
}

async function initRSOPage() {
  const universityIds = await getUserUniversities();
  const joinedRSOs = await getJoinedRSOs();
  const joinedRSOIds = new Set(joinedRSOs.map(rso => rso.rso_id));

  renderRSOList(joinedList, joinedRSOs);

  const allAvailable = [];

  for (const uniId of universityIds) {
    const rsos = await getRSOsAtUniversity(uniId);
    const unjoined = rsos.filter(rso => !joinedRSOIds.has(rso.rso_id));
    console.log(`University ${uniId} returned RSOs:`, rsos);
    console.log("Unjoined RSOs:", unjoined);


    
    allAvailable.push(...unjoined);
  }

  renderRSOList(availableList, allAvailable, "Join", async (rso) => {
    try {
      const res = await fetch(`http://localhost:5500/api/universities/${rso.uni_id}/rsos/${rso.rso_id}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const result = await res.json();
      if (res.ok && result.success) {
        alert(`Joined ${rso.rso_name}`);
        initRSOPage(); // Refresh list
      } else {
        alert(result.message || "Failed to join.");
      }
    } catch (err) {
      console.error("Join failed:", err);
      alert("Join request failed.");
    }
  });
}

initRSOPage();
