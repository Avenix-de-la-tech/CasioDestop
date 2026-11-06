// -------------------------------------------------------------
// Exercice 3 : La fonction requeteJSON et les erreurs HTTP
// -------------------------------------------------------------

async function requeteJSON(url, options = {}) {
  // a. Ajouter l'en-tête Content-Type aux options
  if (!options.headers) {
    options.headers = {};
  }
  options.headers["Content-Type"] = "application/json";

  // b. Envoyer la requête avec fetch
  const reponse = await fetch(url, options);

  // c. Renvoyer null si le statut est 204 (pas de contenu)
  if (reponse.status === 204) {
    return null;
  }

  // d. Lire le corps de la réponse en JSON
  const donnees = await reponse.json();

  // e. Si la réponse n'est pas "ok" (ex: 404, 500...), on lève une erreur
  if (!reponse.ok) {
    const erreur = new Error(donnees.message || "Erreur du serveur");
    erreur.statut = reponse.status;
    erreur.details = donnees;
    throw erreur; // Envoie l'erreur directement dans le bloc catch
  }

  // f. Sinon, on renvoie les données récupérées
  return donnees;
}


async function chargerCatalogue() {
  try {
    statut.textContent = "Chargement...";

    const params = new URLSearchParams();
    const texteRecherche = recherche.value.trim();
    if (texteRecherche !== "") {
      params.append("q", texteRecherche);
    }
    if (filtreDispo.checked) {
      params.append("disponible", "1");
    }

    // On utilise notre nouvelle fonction requeteJSON à la place de fetch
    const livres = await requeteJSON(`/api/livres?${params}`);

    afficherCatalogue(livres);
    statut.textContent = "";

    if (livres.length === 0) {
      aucunResultat.classList.remove("masque");
    } else {
      aucunResultat.classList.add("masque");
    }

  } catch (error) {
    // Si l'erreur possède une propriété "statut", c'est une erreur renvoyée par l'API (ex: 404)
    if (error.statut) {
      statut.textContent = error.message;
    } else {
      // Sinon, c'est une coupure de réseau (serveur éteint)
      statut.textContent = "Impossible de joindre le serveur.";
    }
  }
}