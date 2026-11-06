'use strict'; // mode strict : détecte plus d'erreurs de code

// ---------- 1. Récupération des éléments HTML ----------
const elementResultat   = document.getElementById('resultat');
const elementHistorique = document.getElementById('ligne-historique');
const elementClavier    = document.querySelector('.clavier');

// ---------- 2. État de la calculatrice ----------
const OPERATEURS = ['+', '−', '×', '÷'];
let expression = '';           // ce que l'utilisateur est en train de saisir
let vientDeCalculer = false;   // vrai juste après avoir appuyé sur "="

// ---------- 3. Affichage ----------
function mettreAJourAffichage() {
  elementResultat.textContent = expression === '' ? '0' : expression;
}

// ---------- 4. Actions ----------
function ajouterChiffre(chiffre) {
  // Après un "=", taper un chiffre démarre un nouveau calcul
  if (vientDeCalculer) {
    expression = '';
    vientDeCalculer = false;
    elementHistorique.textContent = '';
  }
  expression += chiffre;
  mettreAJourAffichage();
}

function ajouterDecimale() {
  if (vientDeCalculer) {
    expression = '';
    vientDeCalculer = false;
    elementHistorique.textContent = '';
  }
  // On isole le nombre en cours de saisie (après le dernier opérateur)
  const nombreEnCours = expression.split(/[+−×÷]/).pop();
  if (nombreEnCours.includes('.')) return;      // un seul point par nombre
  if (nombreEnCours === '') expression += '0';  // ".5" devient "0.5"
  expression += '.';
  mettreAJourAffichage();
}

function ajouterOperateur(operateur) {
  vientDeCalculer = false; // on peut continuer à calculer avec le résultat

  // Expression vide : seul le "−" est permis (nombre négatif)
  if (expression === '') {
    if (operateur === '−') expression = '−';
    mettreAJourAffichage();
    return;
  }
  if (expression === '−') return;

  // Retire un point final ("5." + opérateur -> "5+")
  if (expression.endsWith('.')) expression = expression.slice(0, -1);

  // Si le dernier caractère est déjà un opérateur, on le remplace
  const dernierCaractere = expression.slice(-1);
  if (OPERATEURS.includes(dernierCaractere)) {
    expression = expression.slice(0, -1);
  }
  expression += operateur;
  mettreAJourAffichage();
}

function supprimerDernier() {
  if (vientDeCalculer) return;
  expression = expression.slice(0, -1);
  mettreAJourAffichage();
}

function toutEffacer() {
  expression = '';
  vientDeCalculer = false;
  elementHistorique.textContent = '';
  mettreAJourAffichage();
}

// ---------- 5. Calcul ----------
function evaluer(expressionAffichee) {
  // On convertit les symboles d'affichage en symboles JavaScript
  const expressionJs = expressionAffichee
    .replaceAll('×', '*')
    .replaceAll('÷', '/')
    .replaceAll('−', '-');

  // Sécurité : on n'accepte QUE chiffres, opérateurs et point
  if (!/^[0-9+\-*/.]+$/.test(expressionJs)) {
    throw new Error('Expression invalide');
  }
  return Function(`"use strict"; return (${expressionJs});`)();
}

function calculer() {
  if (expression === '' || expression === '−') return;

  // Retire un opérateur ou un point final ("5+" -> "5")
  let expressionNettoyee = expression;
  while (OPERATEURS.includes(expressionNettoyee.slice(-1)) || expressionNettoyee.endsWith('.')) {
    expressionNettoyee = expressionNettoyee.slice(0, -1);
  }

  try {
    const valeur = evaluer(expressionNettoyee);
    if (!Number.isFinite(valeur)) throw new Error('Division par zéro');

    // toPrecision corrige les erreurs de flottants : 0.1 + 0.2 = 0.3
    const valeurPropre = parseFloat(valeur.toPrecision(12));

    elementHistorique.textContent = `${expressionNettoyee} =`;
    expression = String(valeurPropre).replace('-', '−'); // garde le même "−" d'affichage
    vientDeCalculer = true;
    mettreAJourAffichage();
  } catch (erreur) {
    elementHistorique.textContent = '';
    expression = '';
    elementResultat.textContent = 'Erreur';
  }
}

// ---------- 6. Gestion des clics (un seul écouteur pour tout le clavier) ----------
elementClavier.addEventListener('click', (evenement) => {
  const bouton = evenement.target.closest('button');
  if (!bouton) return;

  const { action, valeur } = bouton.dataset;

  switch (action) {
    case 'nombre':    ajouterChiffre(valeur);    break;
    case 'decimale':  ajouterDecimale();         break;
    case 'operateur': ajouterOperateur(valeur);  break;
    case 'egal':      calculer();                break;
    case 'supprimer': supprimerDernier();        break;
    case 'effacer':   toutEffacer();             break;
  }
});

mettreAJourAffichage(); // affichage initial : "0"