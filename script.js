import { db, ref, onValue, push, set, remove, update } from "./firebase-config.js";

let currentListId = null;

const listDropdown = document.getElementById("listDropdown");
const itemsList = document.getElementById("itemsList");
const itemsSection = document.getElementById("itemsSection");

document.getElementById("createList").onclick = () => {
  const name = document.getElementById("newListName").value.trim();
  if (!name) return;
  const listRef = push(ref(db, "lists"));
  set(listRef, { name });
  document.getElementById("newListName").value = "";
};

listDropdown.onchange = () => {
  currentListId = listDropdown.value;
  itemsSection.style.display = currentListId ? "block" : "none";
  if (currentListId) loadItems();
};

document.getElementById("addItem").onclick = () => {
  const name = document.getElementById("itemName").value.trim();
  if (!name || !currentListId) return;
  const itemRef = push(ref(db, `items/${currentListId}`));
  set(itemRef, { name, bought: false });
  document.getElementById("itemName").value = "";
};

function loadLists() {
  const listsRef = ref(db, "lists");
  onValue(listsRef, (snapshot) => {
    listDropdown.innerHTML = '<option value="">Выбери список</option>';
    snapshot.forEach(child => {
      const { name } = child.val();
      const opt = document.createElement("option");
      opt.value = child.key;
      opt.textContent = name;
      listDropdown.appendChild(opt);
    });
  });
}

function loadItems() {
  const itemsRef = ref(db, `items/${currentListId}`);
  onValue(itemsRef, (snapshot) => {
    itemsList.innerHTML = "";
    snapshot.forEach(child => {
      const item = child.val();
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="${item.bought ? "bought" : ""}">${item.name}</span>
        <div>
          <button onclick="toggleBought('${child.key}', ${!item.bought})">${item.bought ? "↩️" : "✅"}</button>
          <button onclick="deleteItem('${child.key}')">🗑️</button>
        </div>
      `;
      itemsList.appendChild(li);
    });
  });
}

window.toggleBought = (id, bought) => {
  update(ref(db, `items/${currentListId}/${id}`), { bought });
};

window.deleteItem = (id) => {
  remove(ref(db, `items/${currentListId}/${id}`));
};

loadLists();