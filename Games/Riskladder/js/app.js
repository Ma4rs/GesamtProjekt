document.addEventListener("DOMContentLoaded", async function () {
    await fetchBankValue();
    renderLadder();
});

let bet = 0;
let currentStep = 0;
let maxStep = 0;
let balance = 0;
let gameStarted = false;

const multipliers = [0, 1.0, 1.2, 1.5, 1.8, 2.2, 2.5];

async function fetchBankValue() {
    const token = localStorage.getItem("token");
    try {
        const response = await axios.get('http://localhost:5105/api/user/getData', {
            headers: { Authorization: `Bearer ${token}` }
        });
        balance = Number(response.data.credits);
        document.querySelector("#balanceDisplay").innerHTML = balance;
        return balance;
    } catch (error) {
        console.error("Fehler beim Laden des Bankwerts:", error);
        return 0;
    }
}

async function updateCredits(amount) {
    const token = localStorage.getItem("token");
    try {
        const response = await axios.post('http://localhost:5105/api/user/updateCredits', {
            creditsToAdd: amount
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        balance = response.data.newCredits;
        document.querySelector("#balanceDisplay").innerHTML = balance;
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Credits:", error);
    }
}

function updateBetDisplay() {
    document.querySelector("#betDisplay").innerHTML = bet;
}

function renderLadder() {
    const ladder = document.getElementById("ladder");
    ladder.innerHTML = "";
    for (let i = 0; i < multipliers.length; i++) {
        const value = i === 0 ? 0 : Math.floor(bet * multipliers[i]);
        const step = document.createElement("div");
        step.className = "ladder-step";

        // Wenn Spiel gestartet ist, hebe aktuelle Stufe hervor
        if (i === currentStep && gameStarted) {
            step.classList.add("active");
        } else if (!gameStarted) {
            step.classList.add("inactive"); // grau, wenn Spiel nicht läuft
        }

        step.innerText = `${value} Credits`;
        ladder.appendChild(step);
    }
}


async function addBet(amount) {
    if (balance >= amount) {
        bet += amount;
        await updateCredits(-amount);
        renderLadder();
        updateBetDisplay();
    }
}

async function clearBet() {
    if (bet > 0) {
        await updateCredits(bet);
        bet = 0;
        renderLadder();
        updateBetDisplay();
    }
}

async function betAll() {
    if (balance > 0) {
        bet += balance;
        await updateCredits(-balance);
        renderLadder();
        updateBetDisplay();
    }
}

function startGame() {
    if (bet <= 0) return alert("Bitte Einsatz platzieren!");
    currentStep = 0;
    maxStep = Math.floor(Math.random() * (multipliers.length - 1)) + 1;
    gameStarted = true;
    renderLadder();
    document.getElementById("riskBtn").disabled = false;
    document.getElementById("collectBtn").disabled = false;
}


async function risk() {
    if (bet === 0) return;

    if (currentStep < maxStep) {
        currentStep++;
        renderLadder();
        if (currentStep === multipliers.length - 1) {
            await collect(true);
        }
    } else {
        await collect(false);
    }
}

async function collect(won = true) {
    const win = Math.floor(bet * multipliers[currentStep]);
    const einsatz = bet;
    bet = 0;
    currentStep = 0;

    gameStarted = false;
    document.getElementById("riskBtn").disabled = true;
    document.getElementById("collectBtn").disabled = true;
    if (won) {
        await updateCredits(win);
        showNotification(`Gewonnen: ${win} Credits!`, "Nochmal spielen", window.location.pathname);
    } else {
        // await updateCredits(-einsatz);
        const newBalance = await fetchBankValue();
        if (newBalance <= 0) {
            showNotification("Keine Credits mehr!", "Credits kaufen", "../Interface/credits.html");
        } else {
            showNotification("Verloren!", "Nochmal spielen", window.location.pathname);
        }
    }

    renderLadder();
    updateBetDisplay();
}

// 🧠 Zeigt Gewinn/Verlust-Overlay
function showNotification(msg, btnTxt, redirectUrl) {
    let oldContainer = document.getElementById('container');
    if (oldContainer) oldContainer.remove();

    let notification = document.createElement('div');
    notification.setAttribute('id', 'notification');
    let nSpan = document.createElement('span');
    nSpan.setAttribute('class', 'nSpan');
    nSpan.innerText = msg;
    notification.append(nSpan);

    let nBtn = document.createElement('div');
    nBtn.setAttribute('class', 'nBtn');
    nBtn.innerText = btnTxt;
    nBtn.onclick = function () {
        if (redirectUrl === "../Interface/credits.html") {
            window.top.location.href = redirectUrl;
        } else {
            window.location.href = redirectUrl;
        }
    };

    let container = document.createElement('div');
    container.setAttribute('id', 'container');
    document.body.append(container);
    notification.append(nBtn);
    container.prepend(notification);
}
