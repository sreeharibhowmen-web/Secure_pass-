import { db } from "./firebaseconfig.js";

import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const container = document.getElementById("logs");

async function loadLogs() {

  container.innerHTML = "";

  const q = query(
    collection(db, "entryLogs"),
    orderBy("exitTime", "desc")
  );

  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {

    const data = docSnap.data();

    const time = data.exitTime?.toDate().toLocaleString();

    const div = document.createElement("div");

    div.className = "log";

    div.innerHTML = `
      <p><strong>ID:</strong> ${data.registerId}</p>
      <p><strong>Email:</strong> ${data.studentEmail}</p>
      <p><strong>Reason:</strong> ${data.reason}</p>
      <p><strong>Exit Time:</strong> ${time}</p>
    `;

    container.appendChild(div);
  });
}

loadLogs();