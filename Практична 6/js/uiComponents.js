

document.addEventListener('DOMContentLoaded', () => {
  initDropdown();
  initTabs();
  initAccordion();
  initTooltips();
  initModal();
});


function initDropdown() {
  const dropdown = document.getElementById('room-dropdown');
  if (!dropdown) return;

  const trigger = dropdown.querySelector('.dropdown-trigger');
  const items = dropdown.querySelectorAll('.dropdown-item');

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('is-open');
  });

  items.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      
      
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      
      trigger.textContent = item.textContent;

      
      dropdown.classList.remove('is-open');

      
      const val = item.getAttribute('data-val');
      console.log(`Room changed to: ${val}`);
      simulateRoomChange(val);
    });
  });

  
  document.addEventListener('click', () => {
    dropdown.classList.remove('is-open');
  });
}

function simulateRoomChange(room) {
  
  const mainTitle = document.querySelector('#subsystem-lighting h3');
  if (mainTitle) {
    let name = 'Освітлення';
    if (room === 'living') name = 'Вітальня';
    else if (room === 'kitchen') name = 'Кухня';
    else if (room === 'bedroom') name = 'Спальня';
    else if (room === 'office') name = 'Кабінет';
    mainTitle.textContent = `Освітлення: ${name}`;
  }
}


function initTabs() {
  
  const subTabs = document.querySelectorAll('.sub-tab');
  const subContents = document.querySelectorAll('.sub-content');

  subTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetSub = tab.getAttribute('data-sub');

      
      subTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      
      subContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `subsystem-${targetSub}`) {
          content.add('active'); 
        }
      });
    });
  });
}


function initTabs() {
  const subTabs = document.querySelectorAll('.sub-tab');
  const subContents = document.querySelectorAll('.sub-content');

  subTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetSub = tab.getAttribute('data-sub');

      subTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      subContents.forEach(content => {
        if (content.id === `subsystem-${targetSub}`) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });
}


function initAccordion() {
  const headers = document.querySelectorAll('.accordion-header');

  headers.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('is-active');

      
      document.querySelectorAll('.accordion-item').forEach(i => {
        i.classList.remove('is-active');
      });

      if (!isActive) {
        item.classList.add('is-active');
      }
    });
  });
}


function initTooltips() {
  
  const elements = document.querySelectorAll('[data-tooltip]');

  elements.forEach(el => {
    
    el.classList.add('tooltip-element');

    
    const tooltipText = el.getAttribute('data-tooltip');
    const box = document.createElement('div');
    box.className = 'tooltip-box';
    box.textContent = tooltipText;

    el.appendChild(box);
  });
}


function initModal() {
  const modal = document.getElementById('settings-modal');
  const openBtn = document.getElementById('open-settings-btn');
  const closeBtn = document.getElementById('close-modal-x');
  const cancelBtn = document.getElementById('btn-cancel-settings');
  const form = document.getElementById('settings-form');
  const sensitivity = document.getElementById('settings-sensitivity');
  const sensVal = document.getElementById('sensitivity-val');

  if (!modal) return;

  const openModal = () => {
    modal.classList.add('is-active');
  };

  const closeModal = () => {
    modal.classList.remove('is-active');
  };

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
      closeModal();
    }
  });

  
  sensitivity.addEventListener('input', (e) => {
    sensVal.textContent = `${e.target.value}%`;
  });

  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ecoMode = document.getElementById('settings-eco').value;
    alert(`Налаштування збережено!\nРежим енергозбереження: ${ecoMode}\nЧутливість датчиків: ${sensitivity.value}%`);
    closeModal();
  });
}
