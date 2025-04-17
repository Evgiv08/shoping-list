import { db } from './firebase-config.js';
import {
  ref,
  onDisconnect,
  set,
  remove,
  onValue,
  push,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// Создаем уникальный ID пользователя
const userId = `user_${Math.random().toString(36).substring(2, 10)}`;

// Ссылка на присутствие
const presenceRef = ref(db, `presence/${userId}`);

// Отмечаем, что пользователь онлайн
set(presenceRef, {
  online: true,
  timestamp: serverTimestamp()
});

// Удаляем при отключении
onDisconnect(presenceRef).remove();

// Слушаем общее количество пользователей онлайн
const onlineCounterRef = ref(db, 'presence');
const counterElement = document.createElement('div');
counterElement.className = 'online-counter';
counterElement.textContent = '👥 Онлайн: ...';
document.body.prepend(counterElement);

onValue(onlineCounterRef, (snapshot) => {
  const data = snapshot.val();
  const count = data ? Object.keys(data).length : 0;
  counterElement.textContent = `👥 Онлайн: ${count}`;
});
