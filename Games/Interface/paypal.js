const offers = [
    { id: "paypal-button-100", credits: 100, amount: "1.99" },
    { id: "paypal-button-500", credits: 500, amount: "8.99" },
    { id: "paypal-button-750", credits: 750, amount: "12.99" },
    { id: "paypal-button-1000", credits: 1000, amount: "16.99" },
    { id: "paypal-button-2500", credits: 2500, amount: "39.99" },
    { id: "paypal-button-5000", credits: 5000, amount: "69.99" },
    { id: "paypal-button-10000", credits: 10000, amount: "90.99" }
];

// Optional: Username dynamisch holen
function getUsername() {
    // Ersetze das mit deinem Nutzer-Login-Mechanismus!
    return "testuser";
}

// Erstellt für jedes Angebot den PayPal-Button am passenden Platz
function renderAllPaypalButtons() {
    offers.forEach(offer => {
        const container = document.getElementById(offer.id);
        if (container && window.paypal) {
            // Render PayPal-Button in das entsprechende DIV
            window.paypal.Buttons({
                createOrder: function (data, actions) {
                    return actions.order.create({
                        purchase_units: [{
                            amount: { value: offer.amount }
                        }]
                    });
                },
                onApprove: function (data, actions) {
                    return actions.order.capture().then(function (details) {
                        // Nach erfolgreicher Zahlung: Weiterleiten mit Credits & Username als GET-Parameter
                        const username = getUsername();
                        localStorage.setItem('credits', offer.credits);
                        window.location.href = `zahlung.html`;
                    });
                }
            }).render(`#${offer.id}`);
        }
    });
}

// PayPal-Buttons rendern, sobald SDK geladen ist
if (window.paypal) {
    renderAllPaypalButtons();
} else {
    // Fallback: Event Listener für den Fall, dass PayPal SDK später geladen wird
    window.addEventListener("load", () => {
        if (window.paypal) renderAllPaypalButtons();
    });
}