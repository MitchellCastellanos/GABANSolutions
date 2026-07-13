// ============================================================
// FREE WEBSITE MOCKUP BUILDER (main GABAN business)
// Same "instant fake preview -> strong CTA" pattern as
// js/mi-tarjeta.js, adapted for a website-style browser-frame
// preview instead of a phone card, and trilingual (EN/FR/ES)
// to match the main site instead of being Spanish-only.
// ============================================================

(function () {
  const $ = (id) => document.getElementById(id);

  const elName     = $("wmName");
  const elTagline  = $("wmTagline");
  const elIndustry = $("wmIndustry");
  const elGenerate = $("wmGenerate");

  const elEmpty   = $("wmEmpty");
  const elLoading = $("wmLoading");
  const elResult  = $("wmResult");
  const elLoadingTitle = $("wmLoadingTitle");
  const elLoadingSub   = $("wmLoadingSub");

  const elSite       = $("wmSite");
  const elSiteBrand  = $("wmSiteBrand");
  const elUrlFake    = $("wmUrlFake");
  const elNavCta     = $("wmNavCta");
  const elHeroName   = $("wmHeroName");
  const elHeroTagline= $("wmHeroTagline");
  const elHeroCta    = $("wmHeroCta");
  const elFeat1 = $("wmFeat1");
  const elFeat2 = $("wmFeat2");
  const elFeat3 = $("wmFeat3");
  const elResultCTA = $("wmResultCTA");
  const elCtaBtn = $("wmCtaBtn");

  if (!elGenerate) return; // not on this page

  function currentLang() {
    const lang = localStorage.getItem("siteLang") || "en";
    return ["en", "fr", "es"].includes(lang) ? lang : "en";
  }

  // ----- industry palettes + copy -----
  const industries = {
    restaurant: {
      bg: "linear-gradient(160deg, #2a140a 0%, #4a1f0e 100%)",
      accent: "#ffb347",
      font: "'Georgia', serif",
      cta: { en: "Reserve a Table", fr: "Réserver une table", es: "Reservar mesa" },
      features: {
        en: ["Menu", "Reservations", "Reviews"],
        fr: ["Menu", "Réservations", "Avis"],
        es: ["Menú", "Reservaciones", "Reseñas"]
      }
    },
    contractor: {
      bg: "linear-gradient(160deg, #0a1a2a 0%, #14243a 100%)",
      accent: "#6ab0ff",
      font: "'Inter', sans-serif",
      cta: { en: "Get a Free Quote", fr: "Obtenir une soumission", es: "Cotización gratis" },
      features: {
        en: ["Free Quote", "Service Areas", "Before & After"],
        fr: ["Soumission gratuite", "Zones desservies", "Avant / Après"],
        es: ["Cotización gratis", "Zonas de servicio", "Antes y después"]
      }
    },
    beauty: {
      bg: "linear-gradient(160deg, #2a1420 0%, #3a1c2b 100%)",
      accent: "#d4b86a",
      font: "'Cormorant Garamond', serif",
      cta: { en: "Book an Appointment", fr: "Prendre rendez-vous", es: "Agendar cita" },
      features: {
        en: ["Book Online", "Services & Pricing", "Gallery"],
        fr: ["Réserver en ligne", "Services & Tarifs", "Galerie"],
        es: ["Reservar en línea", "Servicios y precios", "Galería"]
      }
    },
    professional: {
      bg: "linear-gradient(160deg, #0a0f1a 0%, #131c2e 100%)",
      accent: "#8fb3ff",
      font: "'Inter', sans-serif",
      cta: { en: "Book a Consultation", fr: "Réserver une consultation", es: "Agendar consulta" },
      features: {
        en: ["Book a Consultation", "Our Services", "Testimonials"],
        fr: ["Réserver une consultation", "Nos services", "Témoignages"],
        es: ["Agendar consulta", "Nuestros servicios", "Testimonios"]
      }
    },
    retail: {
      bg: "linear-gradient(160deg, #111 0%, #1d1d1d 100%)",
      accent: "#c9a227",
      font: "'Inter', sans-serif",
      cta: { en: "Shop Now", fr: "Magasiner", es: "Comprar ahora" },
      features: {
        en: ["Shop Now", "New Arrivals", "Reviews"],
        fr: ["Magasiner", "Nouveautés", "Avis"],
        es: ["Comprar ahora", "Novedades", "Reseñas"]
      }
    },
    other: {
      bg: "linear-gradient(160deg, #111 0%, #1d1d1d 100%)",
      accent: "#c9a227",
      font: "'Inter', sans-serif",
      cta: { en: "Get Started", fr: "Commencer", es: "Empezar" },
      features: {
        en: ["Get Started", "Our Services", "Contact Us"],
        fr: ["Commencer", "Nos services", "Nous contacter"],
        es: ["Empezar", "Nuestros servicios", "Contáctanos"]
      }
    }
  };

  function slugForUrl(name) {
    return (name || "yourbusiness")
      .toString()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 24) || "yourbusiness";
  }

  function applyIndustry(key) {
    const ind = industries[key] || industries.other;
    elSite.style.background = ind.bg;
    elSite.style.fontFamily = ind.font;
    elSite.style.setProperty("--wm-accent", ind.accent);
    return ind;
  }

  // ----- loading copy rotation (trilingual) -----
  const loadingSteps = {
    en: [
      { t: "Scanning your industry...", s: "Looking for the right layout" },
      { t: "Applying your colors...", s: "Matching a palette to your brand" },
      { t: "Building your homepage...", s: "Nav, hero, and feature sections" },
      { t: "Almost ready...", s: "Handing off to a real designer" }
    ],
    fr: [
      { t: "Analyse de votre secteur...", s: "Recherche de la bonne mise en page" },
      { t: "Application de vos couleurs...", s: "Choix d'une palette pour votre marque" },
      { t: "Construction de votre page d'accueil...", s: "Navigation, section principale et fonctionnalités" },
      { t: "Presque prêt...", s: "Transmission à un vrai designer" }
    ],
    es: [
      { t: "Analizando tu giro...", s: "Buscando el mejor diseño" },
      { t: "Aplicando tus colores...", s: "Eligiendo una paleta para tu marca" },
      { t: "Construyendo tu página principal...", s: "Navegación, portada y secciones" },
      { t: "Casi listo...", s: "Pasándolo a un diseñador real" }
    ]
  };

  function runLoadingSequence(onDone) {
    elEmpty.classList.add("d-none");
    elResult.classList.add("d-none");
    elLoading.classList.remove("d-none");
    elResultCTA.classList.add("d-none");

    const steps = loadingSteps[currentLang()] || loadingSteps.en;
    let i = 0;
    elLoadingTitle.textContent = steps[0].t;
    elLoadingSub.textContent = steps[0].s;

    const interval = setInterval(() => {
      i++;
      if (i >= steps.length) {
        clearInterval(interval);
        setTimeout(onDone, 500);
        return;
      }
      elLoadingTitle.textContent = steps[i].t;
      elLoadingSub.textContent = steps[i].s;
    }, 750);
  }

  function renderResult() {
    const lang = currentLang();
    const name = elName.value.trim() || (
      lang === "fr" ? "Votre entreprise" : lang === "es" ? "Tu Negocio" : "Your Business"
    );
    const tagline = elTagline.value.trim() || (
      lang === "fr" ? "Votre phrase d'accroche ici" : lang === "es" ? "Tu frase corta aquí" : "Your tagline goes here"
    );
    const industryKey = elIndustry.value || "other";
    const ind = applyIndustry(industryKey);
    const ctaLabel = ind.cta[lang] || ind.cta.en;
    const feats = ind.features[lang] || ind.features.en;

    elSiteBrand.textContent = name;
    elHeroName.textContent = name;
    elHeroTagline.textContent = tagline;
    elHeroCta.textContent = ctaLabel;
    elNavCta.textContent = ctaLabel;
    elFeat1.textContent = feats[0];
    elFeat2.textContent = feats[1];
    elFeat3.textContent = feats[2];
    elUrlFake.textContent = `${slugForUrl(name)}.com`;

    // Carry the visitor's inputs into the contact CTA so the request
    // that follows isn't a blank slate.
    const params = new URLSearchParams({
      ref: "mockup-website",
      need: "New website"
    });
    if (elName.value.trim()) params.set("business", elName.value.trim());
    elCtaBtn.setAttribute("href", `./contact.html?${params.toString()}`);

    elLoading.classList.add("d-none");
    elResult.classList.remove("d-none");
    elResultCTA.classList.remove("d-none");

    if (window.innerWidth < 992) {
      elResultCTA.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  elGenerate.addEventListener("click", (e) => {
    e.preventDefault();

    if (!elName.value.trim()) {
      elName.focus();
      elName.classList.add("is-invalid");
      setTimeout(() => elName.classList.remove("is-invalid"), 1200);
      return;
    }

    runLoadingSequence(renderResult);
  });

  [elName, elTagline].forEach((el) => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); elGenerate.click(); }
    });
  });
})();
