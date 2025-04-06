
const universityList = document.getElementById("university-list");

async function fetchUniversities() {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    alert("You must log in before selecting a university.");
    window.location.href = "index.html";
    return;
  }

  if (localStorage.getItem("universityId")) {
    window.location.href = "home.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:5500/api/universities/joinable?page=1", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    

    const result = await res.json();
    console.log("Universities API response:", result);

    const universities = result.data;

    if (!Array.isArray(universities)) {
      throw new Error("Expected an array of universities, got: " + JSON.stringify(universities));
    }

    universities.forEach((uni) => {
      const li = document.createElement("li");
      li.classList.add("university-item");
      li.innerHTML = `
        <span>${uni.uni_name}</span>
        <button class="join-btn" data-id="${uni.uni_id}">Join</button>
      `;
      universityList.appendChild(li);
    });

    document.querySelectorAll(".join-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const button = e.currentTarget;
        const uniId = button.dataset.id;

        try {
          const joinRes = await fetch(`http://localhost:5500/api/universities/${uniId}/join`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });

          if (!joinRes.ok) {
            throw new Error(`Join request failed with status ${joinRes.status}`);
          }

          const joinData = await joinRes.json();

          if (joinData.success) {
            localStorage.setItem("universityId", uniId);
            localStorage.setItem("universityName", button.previousElementSibling.textContent);
            alert("Joined university successfully. Proceeding to home...");
            window.location.href = "home.html";
          } else {
            alert(joinData.message || "Failed to join university.");
          }
        } catch (err) {
          console.error("Join failed:", err);
          alert("Error joining university: " + err.message);
        }
      });
    });
  } catch (err) {
    console.error("Error loading universities:", err);
    universityList.innerHTML = "<li>Failed to load universities.</li>";
  }
}

fetchUniversities();
