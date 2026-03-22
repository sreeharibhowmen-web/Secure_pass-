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

const container = document.getElementById("hodRequests");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  loadHODRequests();
});


// 🔹 LOAD REQUESTS
async function loadHODRequests() {

  container.innerHTML = "";

  const q = query(
    collection(db, "outpassRequests"),
    where("status", "==", "pendingHOD")
  );

  const snapshot = await getDocs(q);

  snapshot.forEach((docSnap) => {

    const data = docSnap.data();

    const div = document.createElement("div");

    div.innerHTML = `
      <p><strong>Register ID:</strong> ${data.registerId}</p>
      <p><strong>Reason:</strong> ${data.reason}</p>
      <button onclick="approveHOD('${docSnap.id}')">
        Approve & Generate Pass
      </button>
      <hr>
    `;

    container.appendChild(div);
  });
}


// 🔹 APPROVE + QR GENERATE
window.approveHOD = async function (id) {

  try {

    const token = Math.random().toString(36).substring(2, 10);
    const expiry = Date.now() + (2 * 60 * 60 * 1000);

    const qrData = JSON.stringify({
      token: token,
      expiry: expiry
    });

    // ✅ QR generation
    const qrImage = await QRCode.toDataURL(qrData);

    await updateDoc(doc(db, "outpassRequests", id), {
      status: "approved",
      barcodeToken: token,
      expiryTime: expiry,
      qrCode: qrImage,
      used: false
    });

    alert("✅ Pass Approved & QR Generated!");

    loadHODRequests();

  } catch (error) {
    console.error(error);
    alert("Error generating pass");
  }
};