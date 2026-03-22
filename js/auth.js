import { auth, db } from "./firebaseconfig.js";

import { signInWithEmailAndPassword } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { doc, getDoc } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.login = async function () {

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  try {

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("Logged in UID:", user.uid);

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    // ❌ If Firestore doc missing
    if (!userDoc.exists()) {
      alert("User role not found in Firestore!");
      return;
    }

    const data = userDoc.data();

    // ❌ If role missing
    if (!data.role) {
      alert("Role field missing in Firestore!");
      return;
    }

    // ✅ Normalize role
    const role = data.role.toLowerCase().trim();

    console.log("User role:", role);

    // 🔐 Role-based redirect (ALL USERS)
    switch (role) {

      case "student":
        window.location.href = "student.html";
        break;

      case "faculty":
        window.location.href = "faculty.html";
        break;

      case "hod":
        window.location.href = "hod.html";
        break;

      case "security":
        window.location.href = "security.html";
        break;

      default:
        alert("Invalid role in Firestore!");
        console.log("Invalid role:", role);
    }

  } catch (error) {

    console.error("Login Error:", error);

    if (error.code === "auth/user-not-found") {
      alert("User not found!");
    } 
    else if (error.code === "auth/wrong-password") {
      alert("Incorrect password!");
    } 
    else if (error.code === "auth/invalid-email") {
      alert("Invalid email!");
    } 
    else {
      alert(error.message);
    }

  }
};