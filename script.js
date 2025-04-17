import {
  db,
  ref,
  onValue,
  push,
  remove,
  update
} from './firebase-config.js';

const listsContainer = document.getElementById('lists-container');
const newListForm = document.getElementById('new-list-form');
const newListInput = document.getElementById('new-list-name');
let currentSelect = null;

// Добавление нового списка
newListForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = newListInput.value.trim();
  if (name) {
      push(ref(db, 'lists'), {
          name
      });
      newListInput.value = '';
  }
});

let allLists = {};

// Слушаем все списки
onValue(ref(db, 'lists'), (snapshot) => {
  const lists = snapshot.val();
  listsContainer.innerHTML = '';

  if (lists) {
      allLists = lists;
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
  <input type="text" class="item-add-input" placeholder="Додати товар" />
  <button type="submit" class="item-add-btn">Додати</button>
`;
  form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('.item-add-input');
      const value = input.value.trim();
      if (value) {
          push(ref(db, `items/${listId}`), {
              name: value,
              bought: false
          });
          input.value = '';
      }
  });
  listWrapper.appendChild(form);

  // Слушаем товары в списке
  onValue(ref(db, `items/${listId}`), (snapshot) => {
      ul.innerHTML = '';
      const items = snapshot.val();
      if (items) {
          // Сортируем: сначала некупленные, потом купленные
          const sorted = Object.entries(items).sort(([, a], [, b]) => {
              return a.bought - b.bought;
          });

          sorted.forEach(([itemId, item]) => {
              const li = document.createElement('li');
              li.className = `item ${item.bought ? 'bought' : ''}`;
              li.dataset.itemId = itemId;

              const nameSpan = document.createElement('span');
              nameSpan.textContent = item.name;
              nameSpan.className = 'item-name';
              li.appendChild(nameSpan);

              const actionWrapper = document.createElement('div');
              actionWrapper.className = 'item-actions-wrapper';

              const actionBtn = document.createElement('button');
              actionBtn.className = 'item-action-toggle';
              actionBtn.textContent = '⋮';
              actionWrapper.appendChild(actionBtn);

              const dropdown = document.createElement('div');
              dropdown.className = 'item-dropdown hidden';

              const createAction = (text, handler) => {
                  const btn = document.createElement('button');
                  btn.textContent = text;
                  btn.onclick = handler;
                  dropdown.appendChild(btn);
              };

              createAction('Змінити', () => {
                  const newName = prompt('Нова назва:', item.name);
                  if (newName && newName.trim()) {
                      update(ref(db, `items/${listId}/${itemId}`), {
                          name: newName.trim()
                      });
                  }
              });
              createAction('Додати до...', (e) => {
                  if (currentSelect) {
                      currentSelect.remove();
                      currentSelect = null;
                  }

                  const select = document.createElement('select');
                  select.className = 'copy-select';
                  select.innerHTML = `<option disabled selected>Выбрать список</option>`;

                  Object.entries(allLists).forEach(([otherListId, otherListData]) => {
                      if (otherListId !== listId) {
                          const option = document.createElement('option');
                          option.value = otherListId;
                          option.textContent = otherListData.name;
                          select.appendChild(option);
                      }
                  });

                  select.onchange = () => {
                      const targetListId = select.value;
                      push(ref(db, `items/${targetListId}`), {
                          name: item.name,
                          bought: false
                      });
                      select.remove();
                      currentSelect = null;
                  };

                  li.appendChild(select);
                  currentSelect = select;

                  // Остановить всплытие, чтобы не сработал document.onclick
                  e.stopPropagation();
              });
              createAction(item.bought ? 'Відмінити' : 'Куплено', () => {
                  update(ref(db, `items/${listId}/${itemId}`), {
                      bought: !item.bought
                  });
              });
              createAction('Видалити', () => remove(ref(db, `items/${listId}/${itemId}`)));

              actionWrapper.appendChild(dropdown);
              li.appendChild(actionWrapper);

              // Показ/скрытие выпадающего меню
              actionBtn.onclick = (e) => {
                  e.stopPropagation();
                  dropdown.classList.toggle('hidden');
              };

              // Скрыть меню, если кликнули вне его
              document.addEventListener('click', (e) => {
                  if (!actionWrapper.contains(e.target)) {
                      dropdown.classList.add('hidden');
                  }
              });
              ul.appendChild(li);
          });
      }
  });

  listsContainer.appendChild(listWrapper);
}

document.addEventListener('click', (e) => {
  if (currentSelect && !currentSelect.contains(e.target)) {
      currentSelect.remove();
      currentSelect = null;
  }
});