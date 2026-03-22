import { auth, db } from "./firebaseconfig.js";

import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const requestContainer = document.getElementById("requests");

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  loadRequests();
});

async function loadRequests() {

  requestContainer.innerHTML = "";

  const q = query(
    collection(db, "outpassRequests"),
    where("status", "==", "pendingFaculty")
  );

  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((docSnap) => {

    const data = docSnap.data();

    const div = document.createElement("div");

    div.innerHTML = `
  <p><strong>Register ID:</strong> ${data.registerId}</p>
  <p><strong>Reason:</strong> ${data.reason}</p>
  <p><strong>Parent Phone:</strong> ${data.parentPhone}</p>  <!-- 🔥 NEW -->
  <button onclick="approve('${docSnap.id}')">Approve</button>
  <hr>
`;

    requestContainer.appendChild(div);
  });
}

window.approve = async function (id) {

  await updateDoc(doc(db, "outpassRequests", id), {
    status: "pendingHOD"
  });

  alert("Forwarded to HOD");

  loadRequests();
};