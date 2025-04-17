import { db, ref, onValue, push, remove, update } from './firebase-config.js';

const listsContainer = document.getElementById('lists-container');
const newListForm = document.getElementById('new-list-form');
const newListInput = document.getElementById('new-list-name');

// Добавление нового списка
newListForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = newListInput.value.trim();
  if (name) {
    push(ref(db, 'lists'), { name });
    newListInput.value = '';
  }
});

// Слушаем все списки
onValue(ref(db, 'lists'), (snapshot) => {
  const lists = snapshot.val();
  listsContainer.innerHTML = '';

  if (lists) {
    Object.entries(lists).forEach(([listId, listData]) => {
      renderList(listId, listData.name);
    });
  }
});

function renderList(listId, listName) {
  const listWrapper = document.createElement('div');
  listWrapper.className = 'shopping-list list-wrapper';
  listWrapper.dataset.listId = listId;

  const title = document.createElement('h3');
  title.className = 'list-title';
  title.textContent = listName;
  listWrapper.appendChild(title);

  const deleteListBtn = document.createElement('button');
  deleteListBtn.textContent = 'Видалити список';
  deleteListBtn.className = 'list-delete-btn';
  deleteListBtn.onclick = () => {
    remove(ref(db, `lists/${listId}`));
    remove(ref(db, `items/${listId}`));
  };
  listWrapper.appendChild(deleteListBtn);

  const ul = document.createElement('ul');
  ul.className = 'item-list';
  listWrapper.appendChild(ul);

  const form = document.createElement('form');
  form.className = 'item-add-form';
  form.innerHTML = `
    <input type="text" class="item-add-input" placeholder="Добавить товар..." />
    <button type="submit" class="item-add-btn">Додати</button>
  `;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('.item-add-input');
    const value = input.value.trim();
    if (value) {
      push(ref(db, `items/${listId}`), { name: value, bought: false });
      input.value = '';
    }
  });
  listWrapper.appendChild(form);

  // Слушаем товары в списке
  onValue(ref(db, `items/${listId}`), (snapshot) => {
    ul.innerHTML = '';
    const items = snapshot.val();
    if (items) {
      Object.entries(items).forEach(([itemId, item]) => {
        const li = document.createElement('li');
        li.className = `item ${item.bought ? 'bought' : ''}`;
        li.dataset.itemId = itemId;
        li.textContent = item.name;

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'item-toggle-btn';
        toggleBtn.textContent = item.bought ? 'Відмінити' : 'Куплено';
        toggleBtn.onclick = () => {
          update(ref(db, `items/${listId}/${itemId}`), { bought: !item.bought });
        };

        const delBtn = document.createElement('button');
        delBtn.className = 'item-delete-btn';
        delBtn.textContent = 'Видалити';
        delBtn.onclick = () => {
          remove(ref(db, `items/${listId}/${itemId}`));
        };

        li.appendChild(toggleBtn);
        li.appendChild(delBtn);
        ul.appendChild(li);
      });
    }
  });

  listsContainer.appendChild(listWrapper);
}
