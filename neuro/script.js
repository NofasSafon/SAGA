const abacus = document.getElementById('abacus');
const totalDisplay = document.getElementById('total-value');
const targetDisplay = document.getElementById('target-number');
const statusDisplay = document.getElementById('mission-status');
const difficultyWrapper = document.getElementById('difficulty-wrapper');
const necklacePanel = document.getElementById('necklace-panel');
const necklaceContainer = document.getElementById('necklace-container');
const pointsDisplay = document.getElementById('current-points');
const grandVictoryScreen = document.getElementById('grand-victory');

// --- ЗВУК ---
const bgMusic = document.getElementById('bg-music');
const victorySound = document.getElementById('victory-sound');
const soundBtn = document.getElementById('sound-btn');
let isSoundOn = false;

bgMusic.volume = 0.3;
victorySound.volume = 0.8;

soundBtn.addEventListener('click', () => {
    isSoundOn = !isSoundOn;
    if (isSoundOn) {
        bgMusic.play().catch(e => console.log("Audio blocked"));
        soundBtn.innerText = "🎵";
        soundBtn.classList.add('playing');
    } else {
        bgMusic.pause();
        soundBtn.innerText = "🔇";
        soundBtn.classList.remove('playing');
    }
});

// --- ЗМІННІ ГРИ ---
const columnsCount = 7;
let currentTarget = 0;
let currentMode = 'training'; // 'training' або 'game'
let currentPoints = 0;
let collectedPearls = 0;
const POINTS_FOR_PEARL = 12;
const TOTAL_PEARLS_TO_WIN = 10;

// --- ІНІЦІАЛІЗАЦІЯ ---
function initGame() {
    initAbacus();
    initNecklace();
    setMode('training');
}

function initAbacus() {
    abacus.innerHTML = '';
    for (let i = 0; i < columnsCount; i++) {
        const colValue = Math.pow(10, columnsCount - 1 - i);
        const column = document.createElement('div');
        column.className = 'column';
        column.dataset.multiplier = colValue;

        const upper = document.createElement('div');
        upper.className = 'upper';
        createBead(upper, 5, true); 
        column.appendChild(upper);

        const lower = document.createElement('div');
        lower.className = 'lower';
        for (let j = 0; j < 4; j++) {
            createBead(lower, 1, false, j);
        }
        column.appendChild(lower);
        abacus.appendChild(column);
    }
}

function createBead(parent, value, isUpper, index = 0) {
    const bead = document.createElement('div');
    bead.className = 'bead';
    bead.dataset.value = value;
    bead.dataset.index = index;
    
    const interact = (e) => {
        e.preventDefault();
        handleBeadInteraction(bead, isUpper);
    };

    bead.addEventListener('click', interact);
    bead.addEventListener('touchstart', interact, { passive: false });
    parent.appendChild(bead);
}

function handleBeadInteraction(beadElement, isUpper) {
    if (isUpper) {
        beadElement.classList.toggle('active');
    } else {
        const column = beadElement.closest('.column');
        const lowerBeads = Array.from(column.querySelectorAll('.lower .bead'));
        const clickedIndex = parseInt(beadElement.dataset.index);
        const isCurrentlyActive = beadElement.classList.contains('active');

        lowerBeads.forEach((b, idx) => {
            if (!isCurrentlyActive) {
                if (idx <= clickedIndex) b.classList.add('active');
            } else {
                if (idx >= clickedIndex) b.classList.remove('active');
            }
        });
    }
    calculateTotal();
}

function calculateTotal() {
    let total = 0;
    document.querySelectorAll('.column').forEach(col => {
        const multiplier = parseInt(col.dataset.multiplier);
        let colSum = 0;
        col.querySelectorAll('.bead.active').forEach(bead => {
            colSum += parseInt(bead.dataset.value);
        });
        total += colSum * multiplier;
    });
    totalDisplay.innerText = total.toLocaleString();

    if (currentTarget !== 0 && total === currentTarget) {
        handleVictory();
    }
}

// --- ЛОГІКА РЕЖИМІВ ---
function setMode(mode) {
    currentMode = mode;
    currentTarget = 0;
    totalDisplay.innerText = "0";
    resetAbacus();

    // UI оновлення кнопок
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.mode-btn[onclick="setMode('${mode}')"]`).classList.add('active');

    if (mode === 'training') {
        difficultyWrapper.classList.remove('hidden');
        necklacePanel.classList.add('hidden');
        statusDisplay.innerText = "Оберіть розряд і тисніть Старт";
        targetDisplay.innerText = "Тренування";
    } else {
        difficultyWrapper.classList.add('hidden');
        necklacePanel.classList.remove('hidden');
        statusDisplay.innerText = "Збирайте бали для перлин";
        targetDisplay.innerText = "Гра";
    }
}

function initNecklace() {
    necklaceContainer.innerHTML = '';
    for(let i=0; i<TOTAL_PEARLS_TO_WIN; i++) {
        const slot = document.createElement('div');
        slot.className = 'pearl-slot';
        slot.id = `pearl-${i}`;
        necklaceContainer.appendChild(slot);
    }
}

function generateMission() {
    resetAbacus();
    let digits;

    if (currentMode === 'training') {
        // Режим Тренування: беремо значення з селектора
        digits = parseInt(document.getElementById('digit-select').value);
    } else {
        // Режим Гри: випадкова розрядність від 2 до 7
        // Шанси можна налаштувати, зараз рівномірно
        digits = Math.floor(Math.random() * 6) + 2; 
    }

    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    currentTarget = Math.floor(Math.random() * (max - min + 1)) + min;

    targetDisplay.innerText = currentTarget.toLocaleString();
    statusDisplay.innerText = currentMode === 'game' ? `Розрядність: ${digits}` : "Набирайте число!";
    
    // Візуальний ефект зміни числа
    targetDisplay.style.transform = "scale(1.2)";
    setTimeout(() => targetDisplay.style.transform = "scale(1)", 200);
}

function handleVictory() {
    // Ефекти перемоги (спільні)
    const flash = document.querySelector('.pearl-flash');
    const pearlContainer = document.getElementById('victory-pearl');
    
    pearlContainer.classList.remove('hidden');
    flash.classList.add('animate-flash');
    if (isSoundOn) {
        victorySound.currentTime = 0; 
        victorySound.play().catch(e => {});
    }

    // Логіка залежно від режиму
    if (currentMode === 'training') {
        statusDisplay.innerText = "Чудово! Наступне число...";
        statusDisplay.style.color = "#00d4ff";
        
        setTimeout(() => {
            flash.classList.remove('animate-flash');
            pearlContainer.classList.add('hidden');
            statusDisplay.style.color = "white";
            generateMission(); // Одразу нове число
        }, 1000);
        
    } else {
        // РЕЖИМ ГРИ
        processGameScore();
        
        setTimeout(() => {
            flash.classList.remove('animate-flash');
            pearlContainer.classList.add('hidden');
            if(collectedPearls < TOTAL_PEARLS_TO_WIN) {
                generateMission();
            }
        }, 1000);
    }
}

function processGameScore() {
    const digits = currentTarget.toString().length;
    let pointsEarned = 0;

    // 2, 3, 4 розряди = 1 бал
    if (digits <= 4) pointsEarned = 1;
    // 5, 6 розряди = 2 бали
    else if (digits <= 6) pointsEarned = 2;
    // 7 розрядів = 3 бали
    else pointsEarned = 3;

    currentPoints += pointsEarned;
    statusDisplay.innerText = `+${pointsEarned} балів!`;
    statusDisplay.style.color = "#ff9d00";

    // Перевірка на отримання перлини
    if (currentPoints >= POINTS_FOR_PEARL) {
        addPearlToNecklace();
        currentPoints = currentPoints - POINTS_FOR_PEARL; // Залишок переноситься (або скидається в 0, якщо хочете)
        // currentPoints = 0; // Якщо хочете скидати залишок
    }

    // Оновлення UI
    pointsDisplay.innerText = currentPoints;
    setTimeout(() => statusDisplay.style.color = "white", 1000);
}

function addPearlToNecklace() {
    if (collectedPearls >= TOTAL_PEARLS_TO_WIN) return;

    const slot = document.getElementById(`pearl-${collectedPearls}`);
    slot.classList.add('filled');
    // Додаємо випадковий колірний клас
    const colorIndex = Math.floor(Math.random() * 5);
    slot.classList.add(`p-color-${colorIndex}`);
    
    collectedPearls++;
    statusDisplay.innerText = "✨ ОТРИМАНО ПЕРЛИНУ! ✨";

    if (collectedPearls === TOTAL_PEARLS_TO_WIN) {
        setTimeout(showGrandVictory, 1000);
    }
}

function showGrandVictory() {
    grandVictoryScreen.classList.remove('hidden');
    if (isSoundOn) {
        // Можна додати довший звук перемоги
        victorySound.play();
    }
}

function restartGame() {
    grandVictoryScreen.classList.add('hidden');
    collectedPearls = 0;
    currentPoints = 0;
    pointsDisplay.innerText = "0";
    initNecklace(); // Очистити візуально
    setMode('game');
    generateMission();
}

function resetAbacus() {
    document.querySelectorAll('.bead').forEach(bead => bead.classList.remove('active'));
    calculateTotal();
}

// Запуск
createBackgroundBubbles();
initGame();

// Фон (бульбашки з минулого коду)
function createBackgroundBubbles() {
    const container = document.body;
    for (let i = 0; i < 15; i++) {
        const bubble = document.createElement('div');
        bubble.style.position = 'absolute';
        bubble.style.bottom = '-20px';
        bubble.style.left = Math.random() * 100 + 'vw';
        bubble.style.width = bubble.style.height = Math.random() * 10 + 5 + 'px';
        bubble.style.background = 'rgba(255, 255, 255, 0.1)';
        bubble.style.borderRadius = '50%';
        bubble.style.pointerEvents = 'none';
        bubble.style.zIndex = '-1';
        
        const duration = Math.random() * 10 + 5;
        bubble.animate([
            { transform: 'translateY(0) translateX(0)', opacity: 0.5 },
            { transform: `translateY(-110vh) translateX(${Math.random() * 50 - 25}px)`, opacity: 0 }
        ], {
            duration: duration * 1000,
            iterations: Infinity,
            delay: Math.random() * 5000
        });
        container.appendChild(bubble);
    }
}:root {
    --ocean-deep: #0a192f;
    --neon-blue: #00d4ff;
    --neon-orange: #ff9d00;
    --pearl-white: #e0f7fa;
    --glass-bg: rgba(255, 255, 255, 0.1);
    --active-btn: #00bcd4;
    --inactive-btn: rgba(255, 255, 255, 0.1);
    
    /* Абакус */
    --bead-width: 40px;
    --bead-height: 30px;
    --col-width: 40px;
    --col-height: 280px;
    --shift-upper: 35px;
    --shift-lower: -45px;
    --col-gap: 15px;
}

body.neuro-ocean {
    background: radial-gradient(circle at center, #112240 0%, #0a192f 100%);
    color: white;
    font-family: 'Segoe UI', sans-serif;
    margin: 0;
    touch-action: manipulation; 
    overflow-x: hidden;
}

.mobile-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    min-height: 100vh;
}

/* --- ПЕРЕМИКАЧ РЕЖИМІВ --- */
.mode-switcher {
    display: flex;
    background: rgba(0,0,0,0.3);
    border-radius: 20px;
    padding: 5px;
    margin-bottom: 10px;
    border: 1px solid var(--neon-blue);
}

.mode-btn {
    background: transparent;
    border: none;
    color: #8892b0;
    padding: 8px 15px;
    border-radius: 15px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s;
}

.mode-btn.active {
    background: var(--active-btn);
    color: var(--ocean-deep);
    box-shadow: 0 0 10px rgba(0, 188, 212, 0.4);
}

/* --- НАМИСТО --- */
.necklace-panel {
    width: 95%;
    max-width: 400px;
    background: rgba(10, 25, 47, 0.6);
    border-radius: 15px;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px dashed var(--neon-blue);
}

.necklace-container {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 5px;
    flex-wrap: wrap;
}

.pearl-slot {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    border: 2px solid #555;
    background: rgba(0,0,0,0.5);
    transition: all 0.5s ease;
}

.pearl-slot.filled {
    border-color: #fff;
    box-shadow: 0 0 10px currentColor;
    transform: scale(1.1);
}

/* Кольори для різних перлин */
.p-color-0 { background: radial-gradient(circle at 30%, #fff, #ff9a9e); color: #ff9a9e; }
.p-color-1 { background: radial-gradient(circle at 30%, #fff, #a18cd1); color: #a18cd1; }
.p-color-2 { background: radial-gradient(circle at 30%, #fff, #84fab0); color: #84fab0; }
.p-color-3 { background: radial-gradient(circle at 30%, #fff, #fbc2eb); color: #fbc2eb; }
.p-color-4 { background: radial-gradient(circle at 30%, #fff, #f6d365); color: #f6d365; }

.progress-info {
    font-size: 0.8rem;
    color: var(--neon-blue);
    text-align: center;
}

/* --- СТАНДАРТНІ ЕЛЕМЕНТИ --- */
header .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    width: 100%;
    box-sizing: border-box;
}

.logo { font-size: 1.2rem; color: var(--neon-blue); font-weight: bold; }
.sound-toggle { background: transparent; border: 1px solid var(--neon-blue); color: var(--neon-blue); border-radius: 50%; width: 36px; height: 36px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.sound-toggle.playing { background: rgba(0, 212, 255, 0.2); box-shadow: 0 0 10px var(--neon-blue); }

.daily-mission { width: 100%; display: flex; justify-content: center; margin: 5px 0; }
.mission-box { background: rgba(10, 25, 47, 0.85); backdrop-filter: blur(10px); border: 1px solid var(--neon-blue); border-radius: 15px; padding: 15px; text-align: center; width: 95%; max-width: 400px; }

.hidden { display: none !important; }

.difficulty-selector { margin-bottom: 10px; }
.target-display { font-size: 1.8rem; font-weight: bold; color: var(--pearl-white); text-shadow: 0 0 10px var(--neon-blue); }

.abacus-system { flex-grow: 1; display: flex; flex-direction: column; align-items: center; width: 100%; margin-top: 10px;}
.abacus-frame { background: rgba(0,0,0,0.6); padding: 15px 5px; border: 3px solid #5d4037; border-radius: 12px; width: 95vw; max-width: 600px; overflow-x: auto; display: flex; justify-content: center; }
.abacus { display: flex; gap: var(--col-gap); padding: 0 10px; }
.column { display: flex; flex-direction: column; align-items: center; position: relative; width: var(--col-width); height: var(--col-height); flex-shrink: 0; }
.column::before { content: ""; position: absolute; height: 100%; width: 4px; background: linear-gradient(to bottom, transparent, var(--neon-blue), transparent); z-index: 0; }
.column::after { content: ""; position: absolute; top: calc(var(--col-height) * 0.25); width: calc(var(--col-width) + 10px); height: 8px; background: #5d4037; z-index: 1; border-radius: 2px; }

.bead { width: var(--bead-width); height: var(--bead-height); background: radial-gradient(circle at 30% 30%, #444, #111); border-radius: 50%; cursor: pointer; z-index: 2; transition: transform 0.2s; position: relative; touch-action: none; }
.bead.active { background: radial-gradient(circle at 30% 30%, #fff, var(--neon-orange)); box-shadow: 0 0 15px var(--neon-orange); }

.upper { height: calc(var(--col-height) * 0.25); display: flex; align-items: flex-start; }
.upper .bead.active { transform: translateY(var(--shift-upper)); }
.lower { height: calc(var(--col-height) * 0.70); display: flex; flex-direction: column; justify-content: flex-end; gap: 2px; }
.lower .bead.active { transform: translateY(var(--shift-lower)); }

.energy-panel { margin-top: 15px; padding: 5px 30px; border-radius: 30px; background: var(--glass-bg); border: 1px solid var(--neon-orange); }
.neuro-value { font-size: 32px; color: var(--neon-orange); font-weight: bold; }

.controls-panel { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; }
.mission-btn { background: var(--neon-blue); color: var(--ocean-deep); border: none; padding: 12px; border-radius: 8px; font-weight: bold; }
.reset-btn { background: rgba(255, 62, 62, 0.2); color: #ff3e3e; border: 1px solid #ff3e3e; padding: 12px; border-radius: 8px; font-weight: bold;}

/* Перлина перемоги (анімація) */
.pearl-container { height: 60px; display: flex; justify-content: center; align-items: center; position: relative; margin-bottom: 10px;}
.pearl { width: 40px; height: 40px; background: radial-gradient(circle at 30% 30%, #fff, gold); border-radius: 50%; box-shadow: 0 0 15px gold; }
.pearl-flash { position: absolute; width: 60px; height: 60px; background: white; border-radius: 50%; opacity: 0; }
.animate-flash { animation: flash 0.5s ease-out; }
@keyframes flash { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(3); opacity: 0; } }

/* Глобальна перемога */
.grand-victory { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.9); z-index: 999; display: flex; justify-content: center; align-items: center; }
.victory-content { text-align: center; color: var(--neon-orange); animation: popIn 0.5s; }
@keyframes popIn { 0%{transform: scale(0);} 80%{transform: scale(1.1);} 100%{transform: scale(1);} }

@media (max-width: 480px) {
    :root { --bead-width: 34px; --bead-height: 26px; --col-width: 34px; --col-height: 240px; --shift-upper: 30px; --shift-lower: -38px; --col-gap: 8px; }
    .abacus-frame { justify-content: flex-start; }
}