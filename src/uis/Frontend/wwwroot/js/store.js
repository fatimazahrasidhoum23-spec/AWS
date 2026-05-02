import settings from "./settings.js";
import common from "./common.js";

// Emoji automatique selon le nom du produit
function getEmoji(name) {
    const n = name.toLowerCase();
    if (n.includes("laptop") || n.includes("computer") || n.includes("pc")) return "💻";
    if (n.includes("phone") || n.includes("mobile") || n.includes("iphone")) return "📱";
    if (n.includes("shirt") || n.includes("clothes") || n.includes("veste")) return "👕";
    if (n.includes("shoe") || n.includes("chaussure")) return "👟";
    if (n.includes("book") || n.includes("livre")) return "📚";
    if (n.includes("watch") || n.includes("montre")) return "⌚";
    if (n.includes("camera") || n.includes("photo")) return "📷";
    if (n.includes("headphone") || n.includes("casque")) return "🎧";
    if (n.includes("tv") || n.includes("television")) return "📺";
    if (n.includes("game") || n.includes("jeu")) return "🎮";
    if (n.includes("food") || n.includes("pizza") || n.includes("burger")) return "🍕";
    return "🛍️";
}

window.onload = () => {
    "use strict";

    const auth = JSON.parse(localStorage.getItem("auth"));
    if (!auth) {
        location.href = "/index.html";
    }

    common.get(
        settings.uri + "identity/validate?email=" + encodeURIComponent(auth.email) + "&token=" + encodeURIComponent(auth.token),
        (userId) => {

            common.get(settings.uri + "catalog", (data) => {
                const catalogItems = JSON.parse(data);
                const catalog = document.querySelector(".catalog");

                // Vider le contenu existant
                catalog.innerHTML = "";

                if (catalogItems.length === 0) {
                    catalog.innerHTML = `
                        <div style="text-align:center; margin-top:80px; color:#888;">
                            <div style="font-size:60px">📦</div>
                            <p style="font-size:20px; margin-top:15px">Aucun produit disponible pour le moment.</p>
                        </div>`;
                    return;
                }

                // Créer une carte pour chaque produit
                for (const item of catalogItems) {
                    const card = document.createElement("div");
                    card.className = "product-card";
                    card.innerHTML = `
                        <div class="product-img">${getEmoji(item.name)}</div>
                        <div class="product-body">
                            <div class="id" style="display:none">${item.id}</div>
                            <div class="product-name">${item.name}</div>
                            <div class="product-desc">${item.description}</div>
                            <div class="product-price">${item.price}</div>
                            <button class="btn-add">🛒 Ajouter au panier</button>
                        </div>
                    `;

                    // Bouton Ajouter au panier
                    card.querySelector(".btn-add").onclick = () => {
                        const cartItem = {
                            catalogItemId: item.id,
                            name: item.name,
                            price: Number.parseFloat(item.price),
                            quantity: 1
                        };
                        common.post(
                            settings.uri + "cart?u=" + encodeURIComponent(userId),
                            () => { alert("✅ Produit ajouté au panier !"); },
                            () => { alert("❌ Erreur lors de l'ajout au panier."); },
                            cartItem,
                            auth.token
                        );
                    };

                    catalog.appendChild(card);
                }

            }, () => {
                alert("Erreur lors du chargement du catalogue.");
            }, auth.token);

            document.getElementById("logout").onclick = () => {
                localStorage.removeItem("auth");
                location.href = "/index.html";
            };

        },
        () => { location.href = "/index.html"; }
    );
};