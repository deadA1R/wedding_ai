// DOM элементы
const loginScreen = document.getElementById("login-screen");
const adminScreen = document.getElementById("admin-screen");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginError = document.getElementById("loginError");
const guestsTable = document.querySelector("#guestsTable tbody");

// Вход в админку
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
  } catch (error) {
    loginError.textContent = "Ошибка: " + error.message;
  }
});

// Выход
logoutBtn.addEventListener("click", async () => {
  await firebase.auth().signOut();
});

// Следим за изменением статуса авторизации
firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    loginScreen.style.display = "none";
    adminScreen.style.display = "block";
    loadGuests();
  } else {
    loginScreen.style.display = "block";
    adminScreen.style.display = "none";
  }
});

// Функция загрузки гостей из Firestore
async function loadGuests() {
  guestsTable.innerHTML = "";
  try {
    const snapshot = await db.collection("guests").get();
    snapshot.forEach(doc => {
      const g = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${g.name || ""}</td>
        <td>${g.attendance || ""}</td>
        <td>${g.transfer || ""}</td>
        <td>${g.adults || 0}</td>
        <td>${g.children || 0}</td>
      `;
      guestsTable.appendChild(tr);
    });
  } catch (err) {
    console.error("Ошибка при загрузке гостей:", err);
  }
}
