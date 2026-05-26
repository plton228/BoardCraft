

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  
  
  if (window.initCanvasSimulator) {
    window.initCanvasSimulator();
  }
});

function initNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target');

      
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      
      contents.forEach(section => {
        if (section.id === targetId) {
          section.classList.add('active');
          
          
          if (targetId === 'canvas-section') {
            window.dispatchEvent(new Event('resize'));
          }
        } else {
          section.classList.remove('active');
        }
      });
    });
  });
}
