let chart;

// Charger total épargne depuis localStorage
let totalEpargne = parseFloat(localStorage.getItem("totalEpargne")) || 0;

// Charger historique depuis localStorage
let historique = JSON.parse(localStorage.getItem("historique")) || [];

// Pourcentages Mode Pro
let pctDepenses = parseFloat(localStorage.getItem("pctDepenses")) || 55;
let pctDivertissement = parseFloat(localStorage.getItem("pctDivertissement")) || 10;
let pctEpargne = parseFloat(localStorage.getItem("pctEpargne")) || 15;
let pctReste = parseFloat(localStorage.getItem("pctReste")) || 20;

// Chargement automatique
window.onload = () => {
    if (document.getElementById("totalEpargne")) {
        document.getElementById("totalEpargne").textContent = totalEpargne.toFixed(2);
    }
    if (document.querySelector("#historiqueEpargneTable tbody")) {
        afficherHistorique();
    }
    mettreAJourProgressionObjectif();
};

// CALCUL DU BUDGET
function calculerBudget() {
    const salaire = parseFloat(document.getElementById("salaire").value);

    if (!salaire) {
        alert("Entre ton salaire !");
        return;
    }

    const depenses = salaire * (pctDepenses / 100);
    const divertissement = salaire * (pctDivertissement / 100);
    const epargneAuto = salaire * (pctEpargne / 100);
    const reste = salaire * (pctReste / 100);

    document.getElementById("depenses").textContent = depenses.toFixed(2);
    document.getElementById("divertissement").textContent = divertissement.toFixed(2);
    document.getElementById("epargne").textContent = epargneAuto.toFixed(2);
    document.getElementById("reste").textContent = reste.toFixed(2);

    document.getElementById("salaire").addEventListener("input", () => {
        if (document.getElementById("salaire").value === "") {
            document.getElementById("depenses").textContent = "0";
            document.getElementById("divertissement").textContent = "0";
            document.getElementById("epargne").textContent = "0";
            document.getElementById("reste").textContent = "0";
            mettreAJourGraphique(0, 0, 0, 0);
        }
    });

    mettreAJourGraphique(depenses, divertissement, epargneAuto, reste);

    totalEpargne += epargneAuto;
    localStorage.setItem("totalEpargne", totalEpargne);
    document.getElementById("totalEpargne").textContent = totalEpargne.toFixed(2);

    const date = new Date().toLocaleDateString("fr-FR");

    historique.push({
        date: date,
        salaire: salaire,
        epargne: epargneAuto,
        total: totalEpargne
    });

    localStorage.setItem("historique", JSON.stringify(historique));

    afficherHistorique();
    mettreAJourProgressionObjectif();
}

// GRAPHIQUE
function mettreAJourGraphique(depenses, divertissement, epargne, reste) {
    const ctx = document.getElementById('budgetChart').getContext('2d');

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Dépenses', 'Divertissement', 'Épargne', 'Reste'],
            datasets: [{
                data: [depenses, divertissement, epargne, reste],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8BC34A']
            }]
        }
    });
}

// AFFICHER HISTORIQUE
function afficherHistorique() {
    const tbody = document.querySelector("#historiqueEpargneTable tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    historique.forEach((item, index) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.date}</td>
            <td>${item.epargne.toFixed(2)}</td>
            <td>${item.total.toFixed(2)}</td>
            <td>
                <button onclick="eliminarEntrada(${index})"
                style="background:red; color:white; border:none; padding:4px 8px; border-radius:4px;">
                    X
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function eliminarEntrada(index) {
    totalEpargne -= historique[index].epargne;
    historique.splice(index, 1);

    localStorage.setItem("totalEpargne", totalEpargne);
    localStorage.setItem("historique", JSON.stringify(historique));

    document.getElementById("totalEpargne").textContent = totalEpargne.toFixed(2);
    afficherHistorique();
    mettreAJourProgressionObjectif();
}

// AJOUT ÉPARGNE MANUELLE
function ajouterEpargne() {
    const montant = parseFloat(document.getElementById("epargneMois").value);

    if (!montant) {
        alert("Entre un montant !");
        return;
    }

    totalEpargne += montant;
    localStorage.setItem("totalEpargne", totalEpargne);
    document.getElementById("totalEpargne").textContent = totalEpargne.toFixed(2);

    const date = new Date().toLocaleDateString("fr-FR");

    historique.push({
        date: date,
        salaire: 0,
        epargne: montant,
        total: totalEpargne
    });

    localStorage.setItem("historique", JSON.stringify(historique));

    afficherHistorique();
    mettreAJourProgressionObjectif();

    document.getElementById("epargneMois").value = "";
}

// ANALYSE INTELLIGENTE
function analyserHistorique() {
    if (!historique || historique.length === 0) return;

    let total = 0;
    let meilleur = historique[0];
    let pire = historique[0];

    historique.forEach(item => {
        total += item.epargne;
        if (item.epargne > meilleur.epargne) meilleur = item;
        if (item.epargne < pire.epargne) pire = item;
    });

    const moyenne = total / historique.length;

    document.getElementById("moyenneEpargne").textContent = moyenne.toFixed(2);
    document.getElementById("meilleurMois").textContent = `${meilleur.date} (${meilleur.epargne.toFixed(2)} €)`;
    document.getElementById("pireMois").textContent = `${pire.date} (${pire.epargne.toFixed(2)} €)`;
    document.getElementById("nbEntrees").textContent = historique.length;
}

// MODE PRO
function chargerReglages() {
    document.getElementById("pctDepenses").value = pctDepenses;
    document.getElementById("pctDivertissement").value = pctDivertissement;
    document.getElementById("pctEpargne").value = pctEpargne;
    document.getElementById("pctReste").value = pctReste;
}

function sauverReglages() {
    pctDepenses = parseFloat(document.getElementById("pctDepenses").value) || 55;
    pctDivertissement = parseFloat(document.getElementById("pctDivertissement").value) || 10;
    pctEpargne = parseFloat(document.getElementById("pctEpargne").value) || 15;
    pctReste = parseFloat(document.getElementById("pctReste").value) || 20;

    localStorage.setItem("pctDepenses", pctDepenses);
    localStorage.setItem("pctDivertissement", pctDivertissement);
    localStorage.setItem("pctEpargne", pctEpargne);
    localStorage.setItem("pctReste", pctReste);

    alert("Réglages sauvegardés !");
}

// OBJECTIFS
let objectif = parseFloat(localStorage.getItem("objectif")) || 0;

function creerObjectif() {
    const val = parseFloat(document.getElementById("objectifMontant").value);
    if (!val) return alert("Entre un montant d’objectif !");
    objectif = val;
    localStorage.setItem("objectif", objectif);
    document.getElementById("objectifActuel").textContent = objectif + " €";
    mettreAJourProgressionObjectif();
}

function mettreAJourProgressionObjectif() {
    if (!objectif) {
        document.getElementById("progressionObjectif").textContent = "0%";
        return;
    }
    const progression = Math.min(100, (totalEpargne / objectif) * 100);
    document.getElementById("progressionObjectif").textContent = progression.toFixed(1) + "%";
}

// SIMULATEUR
function simulerBudget() {
    const salaire = parseFloat(document.getElementById("simSalaire").value);
    if (!salaire) return alert("Entre un salaire simulé !");
    const dep = salaire * (pctDepenses / 100);
    const div = salaire * (pctDivertissement / 100);
    const epar = salaire * (pctEpargne / 100);
    const rest = salaire * (pctReste / 100);
    document.getElementById("simDepenses").textContent = dep.toFixed(2);
    document.getElementById("simDivertissement").textContent = div.toFixed(2);
    document.getElementById("simEpargne").textContent = epar.toFixed(2);
    document.getElementById("simReste").textContent = rest.toFixed(2);
}

// DÉFIS
let defiActuel = localStorage.getItem("defiActuel") || "";

function demarrerDefi() {
    const val = document.getElementById("defiSelect").value;
    defiActuel = val;
    localStorage.setItem("defiActuel", defiActuel);
    document.getElementById("defiEnCours").textContent = "Défi " + val + " (jours/semaines)";
}

// JOURNAL FINANCIER
function sauverNote() {
    const note = document.getElementById("noteFinanciere").value.trim();
    if (!note) return alert("Écris quelque chose !");
    localStorage.setItem("derniereNote", note);
    document.getElementById("derniereNote").textContent = note;
    document.getElementById("noteFinanciere").value = "";
}

// THÈMES
function changerTheme(theme) {
    if (theme === "clair") {
        document.body.style.background = "#f5f7fa";
        document.body.style.color = "#222";
    } else if (theme === "sombre") {
        document.body.style.background = "#121212";
        document.body.style.color = "#e5e5e5";
    } else if (theme === "bleu") {
        document.body.style.background = "#0D2EB8";
        document.body.style.color = "#ffffff";
    }
}

// MINI-JEU
const questionsJeu = [
    { texte: "Tu reçois 50 €. Tu fais quoi ?", bonne: "epargne" },
    { texte: "Promo sur un jeu vidéo, tu craques ?", bonne: "depense" },
    { texte: "Tu veux partir en vacances cet été ?", bonne: "epargne" }
];

let questionCourante = null;

function nouvelleQuestion() {
    questionCourante = questionsJeu[Math.floor(Math.random() * questionsJeu.length)];
    document.getElementById("questionJeu").textContent = questionCourante.texte;
    document.getElementById("resultatJeu").textContent = "";
}

function repondreJeu(choix) {
    if (!questionCourante) return;
    if (choix === questionCourante.bonne) {
        document.getElementById("resultatJeu").textContent = "Bien joué !";
    } else {
        document.getElementById("resultatJeu").textContent = "Pas le meilleur choix…";
    }
}
