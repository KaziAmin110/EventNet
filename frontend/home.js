import { signOut } from "./src/auth.js";

const signOutBtn = document.querySelector(".sign_out_btn");

signOutBtn.addEventListener("click", async () => {
  try {
    await signOut();
  } catch (err) {
    console.error(err);
    throw new Error("Sign Out Unsuccessful");
  }
});
