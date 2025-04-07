const universityList = document.getElementById("yourRSOContainer");

async function fetchUserRSOs() {
  const token = localStorage.getItem("accessToken");
    console.log(token);
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
    const res = await fetch("http://localhost:5500/api/universities/rsos/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const result = await res.json();
    console.log("Universities API response:", result);

    const universities = result.data;

    // if (!Array.isArray(universities)) {
    //   throw new Error("Expected an array of universities, got: " + JSON.stringify(universities));
    // }
    console.log(universities);
    universities.forEach((uni) => {
        const li = document.createElement("li");
        const inviteButton = document.createElement("button");
        li.classList.add("university-item");
        li.innerHTML = `
          ${uni.rso_name}
        `;
        
        inviteButton.textContent = "Invite";
        inviteButton.classList.add("invite-button");
        universityList.appendChild(li);
        universityList.appendChild(inviteButton);
        const inputBox = document.createElement("input");
        inputBox.type = "text";
        inputBox.placeholder = "Enter invite email";
        inputBox.style.display = "none"; // start hidden
        inputBox.classList.add("invite-input");
        const sendButton = document.createElement("button");
        sendButton.textContent = "Send";
        sendButton.classList.add("send-button");
        sendButton.style.display = "none";
        attachToggleInput(inviteButton, inputBox, sendButton);
        sendInvite(sendButton, inputBox);
        li.appendChild(inputBox);
        li.appendChild(sendButton);

      });

    document.querySelectorAll(".join-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const button = e.currentTarget;
        const uniId = button.dataset.id;

        console.log("Attempting to join university ID:", uniId);
        console.log("Using token:", token);

        try {
          const joinRes = await fetch(`http://localhost:5500/api/universities/rsos/me`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });

          if (!joinRes.ok) {
            const errorText = await joinRes.text();
            throw new Error(`Join request failed with status ${joinRes.status}: ${errorText}`);
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

function attachToggleInput(button, input, sendBtn) {
    button.addEventListener("click", () => {
      input.style.display = input.style.display === "none" ? "block" : "none";
      sendBtn.style.display = sendBtn.style.display === "none" ? "block" : "none";

    });
}

function sendInvite(button, inputBox) {
    button.addEventListener("click", async () => {
      const email = inputBox.value.trim();
  
      if (!email) {
        alert("Please enter an email.");
        return;
      }
  
      const token = localStorage.getItem("accessToken");
      
      try {
        const res = await fetch("http://localhost:5500/api/universities/16/rsos/2120/invite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            inviteEmail: email,
          })
        });
  
        const result = await res.json();
  
        if (res.ok && result.success) {
          alert("Invite sent!");
          inputBox.value = ""; // clear input after success
        } else {
          alert(result.message || "Failed to send invite.");
        }
      } catch (error) {
        console.error("Invite error:", error);
        alert("Error sending invite: " + error.message);
      }
    });
  }
  

fetchUserRSOs();
