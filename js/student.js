import { auth, db } from "./firebaseconfig.js";

import { 
  collection, 
  addDoc, 
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { onAuthStateChanged } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    loadApprovedPass();   // ✅ FIXED (important)
  } else {
    window.location.href = "index.html";
  }
});


// 🔹 SUBMIT REQUEST
window.submitRequest = async function () {

  const reason = document.getElementById("reason").value.trim();
  const parentPhone = document.getElementById("parentPhone").value.trim();

  const user = auth.currentUser;

  if (!user) {
    alert("User not logged in!");
    return;
  }

  if (!reason || !parentPhone) {
    alert("Please fill all fields!");
    return;
  }

  try {

    await addDoc(collection(db, "outpassRequests"), {
      registerId: user.email,
      reason: reason,
      parentPhone: parentPhone,
      studentEmail: user.email,
      status: "pendingFaculty"
    });

    alert("Request submitted!");
    
    document.getElementById("reason").value = "";
    document.getElementById("parentPhone").value = "";

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};


// 🔹 LOAD APPROVED PASS
async function loadApprovedPass() {

  const user = auth.currentUser;

  const container = document.getElementById("approvedPass");
  container.innerHTML = ""; // ✅ clear old UI

  const q = query(
    collection(db, "outpassRequests"),
    where("studentEmail", "==", user.email),
    where("status", "==", "approved")
  );

  const snapshot = await getDocs(q);

  snapshot.forEach((docSnap) => {

    const data = docSnap.data();

    const div = document.createElement("div");

    div.innerHTML = `
      <h3>✅ Approved Pass</h3>
      <p><strong>Reason:</strong> ${data.reason}</p>
      <img src="${data.qrCode}" width="200"/>
      <br><br>
      <button onclick="downloadPass('${data.qrCode}', '${data.reason}')">
        Download Pass
      </button>
      <hr>
    `;

    container.appendChild(div);
  });
}


// 🔹 DOWNLOAD PDF
window.downloadPass = function (qrCode, reason) {

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("SECURE PASS", 70, 20);

  doc.setFontSize(12);
  doc.text("Reason: " + reason, 20, 40);

  doc.addImage(qrCode, "PNG", 60, 60, 80, 80);

  doc.text("Show this QR at the gate", 40, 150);

  doc.save("Outpass.pdf");
};