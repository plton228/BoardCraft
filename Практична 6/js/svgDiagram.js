

document.addEventListener('DOMContentLoaded', () => {
  initSvgDiagram();
});

const LAYER_DETAILS = {
  ui: {
    title: 'Шар інтерфейсу користувача (UI)',
    activeName: 'UI / Presentation',
    desc: 'Цей шар відповідає за безпосереднє візуальне представлення даних та взаємодію з користувачем. Він побудований на базі React-компонентів, стилізованих за допомогою Vanilla CSS. Клієнтська частина повністю ізольована від прямого доступу до бази даних чи бізнес-логіки сервера. Коли користувач ініціює дію (наприклад, клікає "Видалити"), UI-компонент перехоплює подію та викликає відповідний метод координації через користувацькі хуки.',
    paths: ['path-ui-state']
  },
  state: {
    title: 'Шар управління станом (State)',
    activeName: 'State / Coordination',
    desc: 'Центральний архітектурний артефакт клієнтської частини. У першій частині Практичної 5 він реалізується через связку useContext + useReducer (розподілена модель), а у другій частині  через Redux Toolkit (єдине джерело істини). Стан координує процеси завантаження, зберігає дані користувачів, активні фільтри пошуку та індексує пагінацію. Всі UI-компоненти підключаються лише до цього шару, а не до API безпосередньо. Зміни в стані синхронізуються з локальним сховищем (localStorage).',
    paths: ['path-ui-state', 'path-state-ui', 'path-state-api']
  },
  api: {
    title: 'Шар API клієнта та маршрутів',
    activeName: 'API / Routes',
    desc: 'Інкапсулює всі мережеві запити до Express-сервера через REST endpoints. На клієнті цей шар представлений модулем UserApi (використовує fetch), а на серверній частині  Express-маршрутизатором та контролерами (Controllers). Тут відбувається валідація вхідних HTTP-запитів за допомогою схем Zod, декодування параметрів пошуку, сортування та пагінації, а також початковий перехоплювач помилок клієнта.',
    paths: ['path-state-api', 'path-api-storage']
  },
  storage: {
    title: 'Шар збереження та баз даних (Storage)',
    activeName: 'Database / Storage',
    desc: 'Серверна інфраструктура збереження даних. Складається з реляційної бази даних PostgreSQL та Prisma ORM (Prisma Client). Prisma інкапсулює SQL-запити, забезпечуючи типізований доступ до таблиць. Тут діє реляційна модель "User". На сервері також реалізований сервісний шар (Services), який безпосередньо взаємодіє з Prisma та забезпечує транзакційність та унікальність записів (наприклад, унікальність email).',
    paths: ['path-api-storage']
  }
};

function initSvgDiagram() {
  const nodes = {
    ui: document.getElementById('node-ui'),
    state: document.getElementById('node-state'),
    api: document.getElementById('node-api'),
    storage: document.getElementById('node-storage')
  };

  const paths = {
    'path-ui-state': document.getElementById('path-ui-state'),
    'path-state-ui': document.getElementById('path-state-ui'),
    'path-state-api': document.getElementById('path-state-api'),
    'path-api-storage': document.getElementById('path-api-storage')
  };

  const titleEl = document.getElementById('svg-title');
  const descEl = document.getElementById('svg-desc');
  const activeNameEl = document.getElementById('active-layer-name');

  
  Object.keys(nodes).forEach(layerKey => {
    const node = nodes[layerKey];
    if (!node) return;

    node.addEventListener('click', () => {
      
      Object.values(nodes).forEach(n => {
        n.querySelector('rect').setAttribute('stroke-width', '2');
        n.querySelector('rect').removeAttribute('filter');
      });
      const rect = node.querySelector('rect');
      rect.setAttribute('stroke-width', '4');
      rect.setAttribute('stroke', '#ffffff');
      rect.setAttribute('filter', 'url(#glow)');

      
      
      Object.values(paths).forEach(p => {
        if (p) p.className.baseVal = '';
      });

      
      const details = LAYER_DETAILS[layerKey];
      details.paths.forEach(pathId => {
        const p = paths[pathId];
        if (p) {
          p.className.baseVal = 'pulsing-path-active';
        }
      });

      
      Object.keys(paths).forEach(pathId => {
        if (!details.paths.includes(pathId)) {
          const p = paths[pathId];
          if (p) p.className.baseVal = 'pulsing-path';
        }
      });

      
      titleEl.textContent = details.title;
      descEl.textContent = details.desc;
      activeNameEl.textContent = details.activeName;
    });
  });
}
