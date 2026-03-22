import { db } from "./firebaseconfig.js";

import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const resultText = document.getElementById("result");

let html5QrCode; // ✅ global for stop/restart


// 🔹 QR SCAN SUCCESS
async function onScanSuccess(decodedText) {

  try {
    const parsed = JSON.parse(decodedText);

    const token = parsed.token;
    const expiry = parsed.expiry;

    await verifyToken(token, expiry);

  } catch (error) {

    console.error(error);

    resultText.innerHTML = "❌ Invalid QR Format";
    resultText.style.color = "red";
  }
}


// 🔹 VERIFY TOKEN
async function verifyToken(token, expiryFromQR) {

  try {

    const q = query(
      collection(db, "outpassRequests"),
      where("barcodeToken", "==", token)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      resultText.innerHTML = "❌ Invalid Pass";
      resultText.style.color = "red";
      return;
    }

    const docSnap = snapshot.docs[0];
    const data = docSnap.data();

    const now = Date.now();

    // ❌ Already used
    if (data.used) {
      resultText.innerHTML = "⚠️ Pass Already Used";
      resultText.style.color = "orange";
      return;
    }

    // ❌ Expired
    if (data.expiryTime < now || expiryFromQR < now) {
      resultText.innerHTML = "❌ Pass Expired";
      resultText.style.color = "red";
      return;
    }

    // ❌ Not approved
    if (data.status !== "approved") {
      resultText.innerHTML = "❌ Not Approved";
      resultText.style.color = "red";
      return;
    }

    // ✅ Mark as used
    await updateDoc(doc(db, "outpassRequests", docSnap.id), {
      used: true
    });

    // 🔥 SAVE ENTRY LOG
    await addDoc(collection(db, "entryLogs"), {
      registerId: data.registerId,
      studentEmail: data.studentEmail,
      reason: data.reason,
      exitTime: serverTimestamp()
    });

    // ✅ SUCCESS UI
    resultText.innerHTML = `
      ✅ Exit Allowed <br>
      <small>${data.registerId}</small>
    `;
    resultText.style.color = "green";

    // 🔊 SOUND
    new Audio("https://www.soundjay.com/buttons/sounds/button-3.mp3").play();

    // 🔥 STOP CAMERA
    await html5QrCode.stop();
    console.log("Camera stopped");

  } catch (error) {

    console.error(error);

    resultText.innerHTML = "❌ Error verifying pass";
    resultText.style.color = "red";
  }
}


// 🔹 START CAMERA
function startScanner() {

  html5QrCode = new Html5Qrcode("reader");

  Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {

      html5QrCode.start(
        devices[0].id,
        {
          fps: 10,
          qrbox: 250
        },
        onScanSuccess
      );

    } else {
      resultText.innerHTML = "❌ No Camera Found";
    }
  });
}


// 🔹 RESTART SCANNER
window.restartScanner = async function () {

  resultText.innerHTML = "📷 Scanning...";
  resultText.style.color = "black";

  startScanner();
};


// 🔹 INIT
startScanner();