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
}
