/* Aarhus Iso, al JavaScript på siden.
   Ret FIRMA her, så opdateres telefon, e-mail og adresse alle steder på siden. */

const FIRMA = {
  navn: "Aarhus Iso",
  cvr: "45788040",
  telefon: "+45 00 00 00 00",     // TODO: ret til rigtigt nummer
  telefonLink: "+4500000000",     // TODO: samme nummer uden mellemrum
  email: "info@aarhusiso.dk",     // TODO: ret til rigtig e-mail
  adresse: "Engbakken 48, 8471 Sabro"
};

/* Indsætter firmaoplysninger alle steder, der er markeret med data-field. */
function indsaetFirmaData() {
  document.querySelectorAll("[data-field]").forEach((el) => {
    const felt = el.dataset.field;
    if (felt === "telefon") {
      el.textContent = FIRMA.telefon;
      if (el.tagName === "A") el.href = "tel:" + FIRMA.telefonLink;
    }
    if (felt === "email") {
      el.textContent = FIRMA.email;
      if (el.tagName === "A") el.href = "mailto:" + FIRMA.email;
    }
    if (felt === "adresse") {
      el.textContent = FIRMA.adresse;
    }
  });

  document.querySelectorAll('a[href^="tel:"]').forEach((a) => {
    a.href = "tel:" + FIRMA.telefonLink;
  });
}

/* Mobilmenu */
function opsaetMenu() {
  const knap = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");
  if (!knap || !nav) return;

  knap.addEventListener("click", () => {
    const aaben = nav.classList.toggle("is-open");
    knap.setAttribute("aria-expanded", String(aaben));
  });

  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      knap.setAttribute("aria-expanded", "false");
    });
  });
}

/* Årstal i footeren */
function opsaetAarstal() {
  const el = document.getElementById("aar");
  if (el) el.textContent = String(new Date().getFullYear());
}

/* Kontaktformular.
   Der er ingen server bag siden endnu, så formularen åbner en færdig e-mail.
   TODO: udskift med rigtig endpoint (fx Formspree, Netlify Forms eller egen PHP-handler). */
function opsaetFormular() {
  const form = document.getElementById("tilbudsformular");
  const note = document.getElementById("form-note");
  if (!form || !note) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      note.dataset.state = "fejl";
      note.textContent = "Udfyld navn, e-mail og en kort beskrivelse af opgaven.";
      form.querySelectorAll(":invalid")[0]?.focus();
      return;
    }

    const data = new FormData(form);
    const emne = "Forespørgsel fra aarhusiso.dk";
    const krop = [
      "Navn: " + (data.get("navn") || ""),
      "E-mail: " + (data.get("email") || ""),
      "Telefon: " + (data.get("telefon") || ""),
      "",
      "Opgave:",
      data.get("opgave") || ""
    ].join("\n");

    note.dataset.state = "ok";
    note.textContent = "Åbner dit mailprogram med forespørgslen.";
    window.location.href =
      "mailto:" + FIRMA.email +
      "?subject=" + encodeURIComponent(emne) +
      "&body=" + encodeURIComponent(krop);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  indsaetFirmaData();
  opsaetMenu();
  opsaetAarstal();
  opsaetFormular();
});
