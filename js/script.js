function getWordForm(num, forms) {
  num = Math.abs(num) % 100;
  let n1 = num % 10;
  if (num > 10 && num < 20) return forms[2];
  if (n1 > 1 && n1 < 5) return forms[1];
  if (n1 === 1) return forms[0];
  return forms[2];
}

function updateCountdown() {
  const weddingDate = new Date("2025-10-24T16:00:00");
  const now = new Date();
  const diff = weddingDate - now;

  if (diff <= 0) return;

  let days = Math.floor(diff / (1000 * 60 * 60 * 24));
  let hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  let minutes = Math.floor((diff / (1000 * 60)) % 60);
  let seconds = Math.floor((diff / 1000) % 60);

  document.getElementById("days").textContent = days;
  document.getElementById("hours").textContent = hours;
  document.getElementById("minutes").textContent = minutes;
  document.getElementById("seconds").textContent = seconds;

  document.getElementById("days-label").textContent = getWordForm(days, ["день", "дня", "дней"]);
  document.getElementById("hours-label").textContent = getWordForm(hours, ["час", "часа", "часов"]);
  document.getElementById("minutes-label").textContent = getWordForm(minutes, ["минута", "минуты", "минут"]);
  document.getElementById("seconds-label").textContent = getWordForm(seconds, ["секунда", "секунды", "секунд"]);
}

setInterval(updateCountdown, 1000);
updateCountdown();

document.getElementById("toggleFormBtn").addEventListener("click", function () {
  const form = document.getElementById("rsvpForm");
  form.classList.toggle("hidden");

  // Меняем текст кнопки
  if (form.classList.contains("hidden")) {
    this.textContent = "Анкетирование";
  } else {
    this.textContent = "Скрыть анкету";
  }
});


function generateInviteText(guest) {
  const guestName = guest.firstName;
  const col = guest.isColleague;
  const guestSex = guest.sex; // "Мужчина" или "Женщина"
  //const partnerName = guest.partnerFirstName ? `${guest.partnerFirstName} ${guest.partnerLastName || ""}` : null;
  const partnerName = guest.partnerFirstName;

  if (col){
    if (partnerName) {
      return `Уважаемые ${guestName} и ${partnerName}!`;
    } else {
      if (guestSex === "Мужчина") return `Уважаемый ${guestName}!`;
      if (guestSex === "Женщина") return `Уважаемая ${guestName}! `;
      return `Дорогой гость ${guestName}!`;
    }
  } 
  else {
    if (partnerName) {
      return `Дорогие ${guestName} и ${partnerName}!`;
    } else {
      if (guestSex === "Мужчина") return `Дорогой ${guestName}!`;
      if (guestSex === "Женщина") return `Дорогая ${guestName}! `;
      return `Дорогой гость ${guestName}!`;
    }
  }
}

// ====== Firebase и загрузка данных ======
document.addEventListener("DOMContentLoaded", () => {
  const firebaseConfig = {
    apiKey: "AIzaSyDC_xiedaOoZapGvBBbIKRqw0D2ItRLTck",
    authDomain: "weddingsite-2112a.firebaseapp.com",
    projectId: "weddingsite-2112a",
    storageBucket: "weddingsite-2112a.firebasestorage.app",
    messagingSenderId: "1031545728278",
    appId: "1:1031545728278:web:821ea5df38556617b4f437"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  const idName = new URLSearchParams(window.location.search).get("idName");
  const inviteTextEl = document.getElementById("invite-text");
  const rsvpForm = document.getElementById("rsvpForm");

  // Блок для сообщений
  const messageBox = document.createElement("div");
  messageBox.id = "form-message";
  messageBox.style.marginTop = "20px";
  rsvpForm.appendChild(messageBox);

  if (!idName) {
    inviteTextEl.textContent = "Дорогой Гость";
    rsvpForm.style.display = "none";
    return;
  }

  db.collection("guests").doc(idName).get()
    .then(doc => {
      if (!doc.exists) {
        inviteTextEl.textContent = "Гость не найден!";
        rsvpForm.style.display = "none";
        return;
      }

      const data = doc.data();
      inviteTextEl.textContent = generateInviteText(data);

      // Предзаполнение формы
      if (data.status) {
        const attendInput = document.querySelector(`#rsvpForm input[name="attendance"][value="${data.status}"]`);
        if (attendInput) attendInput.checked = true;
      }
      if (data.transfer) {
        const transferInput = document.querySelector(`#rsvpForm input[name="transfer"][value="${data.transfer}"]`);
        if (transferInput) transferInput.checked = true;
      }
      if (data.guestsCount) document.getElementById("guests").value = data.guestsCount;
      if (data.childrenCount !== undefined) document.getElementById("children").value = data.childrenCount;
    })
    .catch(err => {
      console.error(err);
      inviteTextEl.textContent = "Ошибка при загрузке данных";
      rsvpForm.style.display = "none";
    });

  // Отправка формы
  rsvpForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const status = rsvpForm.querySelector('input[name="attendance"]:checked')?.value || null;
    const transfer = rsvpForm.querySelector('input[name="transfer"]:checked')?.value || null;
    const guestsCount = parseInt(document.getElementById("guests").value) || 0;
    const childrenCount = parseInt(document.getElementById("children").value) || 0;

    db.collection("guests").doc(idName).update({
      status,
      transfer,
      guestsCount,
      childrenCount
    })
    .then(() => {
      messageBox.textContent = "✅ Ваш ответ сохранён! Спасибо ❤️";
      messageBox.style.color = "green";
    })
    .catch(err => {
      console.error(err);
      messageBox.textContent = "❌ Ошибка при сохранении данных. Попробуйте ещё раз.";
      messageBox.style.color = "red";
    });
  });
});
