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

const addGuestForm = document.getElementById("addGuestForm");
const showAddFormBtn = document.getElementById("showAddFormBtn");
const cancelAdd = document.getElementById("cancelAdd");
const typeSelect = document.getElementById("type");
const familyFields = document.getElementById("familyFields");

// показать форму
showAddFormBtn.addEventListener("click", () => {
  addGuestForm.classList.remove("hidden");
  showAddFormBtn.classList.add("hidden");
});

// отмена
cancelAdd.addEventListener("click", () => {
  addGuestForm.reset();
  familyFields.classList.add("hidden");
  addGuestForm.classList.add("hidden");
  showAddFormBtn.classList.remove("hidden");
});

// отображение доп. полей
typeSelect.addEventListener("change", () => {
  if (typeSelect.value === "семьянин") {
    familyFields.classList.remove("hidden");
  } else {
    familyFields.classList.add("hidden");
  }
});

async function addGuestSubmitHandler(e) {
  e.preventDefault();

  const guestData = {
    firstName: document.getElementById("firstName").value.trim(),
    lastName: document.getElementById("lastName").value.trim(),
    idName: document.getElementById("idName").value.trim(),
    sex: document.getElementById("sex").value,
    type: document.getElementById("type").value,
    partnerFirstName: document.getElementById("partnerFirstName").value.trim() || null,
    partnerLastName: document.getElementById("partnerLastName").value.trim() || null,
    childrenCount: parseInt(document.getElementById("childrenCount").value) || 0,
    isColleague: document.getElementById("isColleague").checked, // ✅ новый флаг

    // поля для заполнения гостем
    status: null,
    transfer: false,
    guestsCount: 0,
    comment: "",
  };

  try {
    await db.collection("guests").doc(guestData.idName).set(guestData);
    alert("Гость успешно добавлен!");
    addGuestForm.reset();
    familyFields.classList.add("hidden");
    addGuestForm.classList.add("hidden");
    showAddFormBtn.classList.remove("hidden");
  } catch (error) {
    console.error("Ошибка при добавлении гостя:", error);
    alert("Ошибка при сохранении данных.");
  }
}

addGuestForm.onsubmit = addGuestSubmitHandler;

const guestsList = document.getElementById("guestsList");

function renderGuest(doc) {
  const data = doc.data();
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${data.idName}</td>
    <td>${data.firstName}</td>
    <td>${data.lastName}</td>
    <td>${data.sex}</td>
    <td>${data.type}</td>
    <td>${data.childrenCount || 0}</td>
    <td>${data.status ?? "—"}</td>
    <td>${data.transfer ?? "_"}</td>
    <td>${data.guestsCount || 0}</td>
    <td>${data.comment || "—"}</td>
    <td>${data.isColleague ? "✅" : "—"}</td>
    <td>
      <button class="editBtn" data-id="${doc.id}">✏️</button>
      <button class="deleteBtn" data-id="${doc.id}">🗑️</button>
    </td>
  `;

  guestsList.appendChild(row);

  // ===== Кнопка редактирования =====
  row.querySelector(".editBtn").addEventListener("click", () => {
    const guest = data;

    addGuestForm.classList.remove("hidden");
    showAddFormBtn.classList.add("hidden");
    if (guest.type === "семьянин") familyFields.classList.remove("hidden");
    else familyFields.classList.add("hidden");

    document.getElementById("firstName").value = guest.firstName;
    document.getElementById("lastName").value = guest.lastName;
    document.getElementById("idName").value = guest.idName;
    document.getElementById("sex").value = guest.sex;
    document.getElementById("type").value = guest.type;
    document.getElementById("partnerFirstName").value = guest.partnerFirstName || "";
    document.getElementById("partnerLastName").value = guest.partnerLastName || "";
    document.getElementById("childrenCount").value = guest.childrenCount || 0;
    document.getElementById("isColleague").checked = !!guest.isColleague; // ✅ подставляем

    addGuestForm.onsubmit = async (e) => {
      e.preventDefault();
      const updatedData = {
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        idName: document.getElementById("idName").value.trim(),
        sex: document.getElementById("sex").value,
        type: document.getElementById("type").value,
        partnerFirstName: document.getElementById("partnerFirstName").value.trim() || null,
        partnerLastName: document.getElementById("partnerLastName").value.trim() || null,
        childrenCount: parseInt(document.getElementById("childrenCount").value) || 0,
        isColleague: document.getElementById("isColleague").checked // ✅ обновляем
      };

      try {
        await db.collection("guests").doc(doc.id).update(updatedData);
        alert("Данные гостя обновлены!");
        addGuestForm.reset();
        familyFields.classList.add("hidden");
        addGuestForm.classList.add("hidden");
        showAddFormBtn.classList.remove("hidden");
        addGuestForm.onsubmit = addGuestSubmitHandler;
      } catch (error) {
        console.error("Ошибка при обновлении:", error);
        alert("Ошибка обновления данных.");
      }
    };
  });

  // ===== Кнопка удаления =====
  row.querySelector(".deleteBtn").addEventListener("click", async () => {
    if (confirm(`Вы уверены, что хотите удалить гостя ${data.firstName} ${data.lastName}?`)) {
      try {
        await db.collection("guests").doc(doc.id).delete();
        alert("Гость удалён!");
      } catch (error) {
        console.error("Ошибка при удалении:", error);
        alert("Ошибка при удалении гостя.");
      }
    }
  });
}

// ====== Сводная статистика ======
const totalGuestsEl = document.getElementById("totalGuests");
const confirmedGuestsEl = document.getElementById("confirmedGuests");
const confirmedChildEl = document.getElementById("confirmedСhild");
const singleGuestsEl = document.getElementById("singleGuests");
const familyGuestsEl = document.getElementById("familyGuests");

const ctx = document.getElementById("guestChart").getContext("2d");
let guestChart = null;

function updateSummary(guests) {
  let total = 0;
  let confirmed = 0;
  let confirmedChild = 0;
  let confirmedAdult = 0;
  let canAdult = 0;
  let thinkAdult = 0;
  let single = 0;
  let family = 0;
  let totalChildren = 0;

  guests.forEach(g => {
    const adults = g.guestsCount || 0;
    const children = g.childrenCount || 0;
    const guestCount = adults + children;

    total += guestCount;
    totalChildren += children;

    if (g.status === 'подтвердил' || g.status === 'Буду') {
      confirmed += guestCount;
      confirmedChild += children;
      confirmedAdult += adults;
    }

    if (g.status === 'Не буду') {
      canAdult += adults + children;
    }

    if (g.status === 'В размышлениях') {
      thinkAdult += adults + children;
    }

    if (g.type === 'одиночка') {
      single += guestCount;
    } else if (g.type === 'семьянин') {
      family += guestCount;
    }
  });

  totalGuestsEl.innerText = total;
  confirmedGuestsEl.innerText = confirmed;
  confirmedChildEl.innerText = confirmedChild;
  singleGuestsEl.innerText = single;
  familyGuestsEl.innerText = family;

  if (guestChart) guestChart.destroy();

  guestChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Всего гостей', 'Подтвердили визит (взрослые)', 'Подтвердили визит (дети)', "В размышлениях", "Отказ"],
      datasets: [{
        label: 'Количество гостей',
        data: [total, confirmedAdult, confirmedChild, thinkAdult, canAdult],
        backgroundColor: ['#800020', '#1c7538ff', '#199023ff', '#878787ff', "#7d0000ff"],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#e0e0e0' }
        },
        x: {
          ticks: { color: '#e0e0e0' }
        }
      }
    }
  });
}

// ====== Получение гостей и обновление статистики ======
db.collection("guests").onSnapshot(snapshot => {
  const guests = [];
  guestsList.innerHTML = "";
  snapshot.forEach(doc => {
    const data = doc.data();
    guests.push(data);
    renderGuest(doc);
  });

  updateSummary(guests);
});

document.getElementById("downloadExcel").addEventListener("click", () => {
  // Пример: берем данные из массива guests
  // guests = [{ name: "Иван", status: "Буду", guestsCount: 2, childrenCount: 1, type: "семьянин" }, ... ]
  if (!window.guests || guests.length === 0) {
    alert("Нет данных для выгрузки");
    return;
  }

  // Формируем массив объектов для Excel
  const dataForExcel = guests.map(g => ({
    "Имя": g.name || "",
    "Статус": g.status || "",
    "Взрослые": g.guestsCount || 0,
    "Дети": g.childrenCount || 0,
    "Тип": g.type || ""
  }));

  // Создаем лист
  const ws = XLSX.utils.json_to_sheet(dataForExcel);

  // Создаем книгу
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Гости");

  // Сохраняем файл
  XLSX.writeFile(wb, "guests.xlsx");
});