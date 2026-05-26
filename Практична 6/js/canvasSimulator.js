

class Particle {
  constructor(id, x, y, radius, color) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.radius = radius;
    
    this.mass = radius * radius;
    this.color = color;
    
    
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
  }

  draw(ctx, isSelected) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    
    
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fill();
    
    
    ctx.shadowBlur = 0;

    if (isSelected) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  update(width, height, speedMultiplier, useGravity) {
    if (useGravity) {
      this.vy += 0.1 * speedMultiplier; 
    }

    this.x += this.vx * speedMultiplier;
    this.y += this.vy * speedMultiplier;

    
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx = -this.vx;
    } else if (this.x + this.radius > width) {
      this.x = width - this.radius;
      this.vx = -this.vx;
    }

    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy = -this.vy;
    } else if (this.y + this.radius > height) {
      this.y = height - this.radius;
      this.vy = -this.vy * 0.9; 
      this.vx *= 0.98; 
    }
  }
}

function initCanvasSimulator() {
  const canvas = document.getElementById('simulator-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const btnToggle = document.getElementById('btn-toggle-sim');
  const btnClear = document.getElementById('btn-clear-sim');
  const btnAdd = document.getElementById('btn-add-particles');
  const speedSlider = document.getElementById('sim-speed-slider');
  const speedVal = document.getElementById('sim-speed-val');
  const gravityToggle = document.getElementById('sim-gravity-toggle');
  const fpsCounter = document.getElementById('fps-counter');
  const countCounter = document.getElementById('particle-counter');
  const inspectorContent = document.getElementById('inspector-content');

  let particles = [];
  let particleIdCounter = 0;
  let isRunning = true;
  let speedMultiplier = 1.0;
  let useGravity = false;
  let selectedParticle = null;

  const colors = [
    '#f43f5e', 
    '#3b82f6', 
    '#10b981', 
    '#eab308', 
    '#a855f7', 
    '#f97316', 
    '#06b6d4', 
    '#ec4899'  
  ];

  
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  
  function spawnParticles(count) {
    for (let i = 0; i < count; i++) {
      const radius = Math.random() * 15 + 8; 
      const x = Math.random() * (canvas.width - radius * 2) + radius;
      const y = Math.random() * (canvas.height - radius * 2) + radius;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particles.push(new Particle(particleIdCounter++, x, y, radius, color));
    }
  }
  spawnParticles(20);

  
  function resolveCollisions() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDist = p1.radius + p2.radius;

        if (distance < minDist) {
          
          const overlap = minDist - distance;
          const nx = dx / distance;
          const ny = dy / distance;

          
          const totalMass = p1.mass + p2.mass;
          p1.x -= nx * overlap * (p2.mass / totalMass);
          p1.y -= ny * overlap * (p2.mass / totalMass);
          p2.x += nx * overlap * (p1.mass / totalMass);
          p2.y += ny * overlap * (p1.mass / totalMass);

          
          const kx = p1.vx - p2.vx;
          const ky = p1.vy - p2.vy;
          const vn = kx * nx + ky * ny; 

          
          if (vn > 0) continue;

          
          const impulse = (2 * vn) / totalMass;

          
          p1.vx -= impulse * p2.mass * nx;
          p1.vy -= impulse * p2.mass * ny;
          p2.vx += impulse * p1.mass * nx;
          p2.vy += impulse * p1.mass * ny;
        }
      }
    }
  }

  
  function updateInspector() {
    if (!selectedParticle) {
      inspectorContent.innerHTML = 'Клацніть на будь-яку частку на полотні, щоб зафіксувати її у інспекторі та відстежувати її кінетичні характеристики в реальному часі.';
      return;
    }

    
    const p = particles.find(part => part.id === selectedParticle.id);
    if (!p) {
      selectedParticle = null;
      return;
    }

    const velocity = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    inspectorContent.innerHTML = `
      <div class="info-stat" style="margin-bottom: 0.5rem;">
        <strong>ID частки:</strong>
        <span>#${p.id}</span>
      </div>
      <div class="info-stat" style="margin-bottom: 0.5rem;">
        <strong>Радіус / Маса:</strong>
        <span>${p.radius.toFixed(1)} px / ${p.mass.toFixed(0)}</span>
      </div>
      <div class="info-stat" style="margin-bottom: 0.5rem;">
        <strong>Координати (X, Y):</strong>
        <span>(${p.x.toFixed(0)}, ${p.y.toFixed(0)})</span>
      </div>
      <div class="info-stat" style="margin-bottom: 0.5rem;">
        <strong>Швидкість:</strong>
        <span style="color: var(--color-success)">${velocity.toFixed(2)} px/f</span>
      </div>
      <div class="info-stat">
        <strong>Напрямок (Vx, Vy):</strong>
        <span>(${p.vx.toFixed(2)}, ${p.vy.toFixed(2)})</span>
      </div>
      <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
        <button class="btn btn-danger btn-sm" id="btn-delete-inspected" style="flex: 1;">Видалити</button>
        <button class="btn btn-secondary btn-sm" id="btn-kick-inspected" style="flex: 1;">Штовхнути</button>
      </div>
    `;

    
    document.getElementById('btn-delete-inspected').onclick = () => {
      particles = particles.filter(part => part.id !== p.id);
      selectedParticle = null;
    };
    document.getElementById('btn-kick-inspected').onclick = () => {
      p.vx = (Math.random() - 0.5) * 15;
      p.vy = (Math.random() - 0.5) * 15;
    };
  }

  
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    
    let clicked = null;
    for (const p of particles) {
      const dx = clickX - p.x;
      const dy = clickY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= p.radius) {
        clicked = p;
        break;
      }
    }

    selectedParticle = clicked;
    updateInspector();
  });

  
  btnToggle.addEventListener('click', () => {
    isRunning = !isRunning;
    btnToggle.textContent = isRunning ? 'Пауза' : 'Запустити';
    btnToggle.className = isRunning ? 'btn btn-primary' : 'btn btn-secondary';
  });

  btnClear.addEventListener('click', () => {
    particles = [];
    selectedParticle = null;
    updateInspector();
  });

  btnAdd.addEventListener('click', () => {
    spawnParticles(10);
  });

  speedSlider.addEventListener('input', (e) => {
    speedMultiplier = parseFloat(e.target.value);
    speedVal.textContent = `${speedMultiplier.toFixed(1)}x`;
  });

  gravityToggle.addEventListener('change', (e) => {
    useGravity = e.target.checked;
  });

  
  let lastTime = performance.now();
  let frames = 0;

  
  function loop() {
    const now = performance.now();
    frames++;

    if (now > lastTime + 1000) {
      fpsCounter.textContent = `FPS: ${Math.round((frames * 1000) / (now - lastTime))}`;
      frames = 0;
      lastTime = now;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isRunning) {
      resolveCollisions();
      particles.forEach(p => p.update(canvas.width, canvas.height, speedMultiplier, useGravity));
    }

    
    particles.forEach(p => {
      const isSelected = selectedParticle && selectedParticle.id === p.id;
      p.draw(ctx, isSelected);
    });

    countCounter.textContent = `Часток: ${particles.length}`;
    
    if (selectedParticle) {
      updateInspector();
    }

    requestAnimationFrame(loop);
  }

  
  requestAnimationFrame(loop);
}


window.initCanvasSimulator = initCanvasSimulator;
