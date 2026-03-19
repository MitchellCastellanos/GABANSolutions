// =========================
// GLOBAL (NAV / FOOTER)
// =========================
const globalI18n = {
  en: {
    nav_home: "Home",
    nav_services: "Services",
    nav_express: "Launch 72H",
    nav_work: "Work",
    nav_about: "About",
    nav_contact: "Contact",
    nav_cta: "Free Consultation"
  },
  fr: {
    nav_home: "Accueil",
    nav_services: "Services",
    nav_express: "Lancement 72H",
    nav_work: "Réalisations",
    nav_about: "À propos",
    nav_contact: "Contact",
    nav_cta: "Consultation gratuite"
  },
  es: {
    nav_home: "Inicio",
    nav_services: "Servicios",
    nav_express: "Lanzamiento 72H",
    nav_work: "Portafolio",
    nav_about: "Nosotros",
    nav_contact: "Contacto",
    nav_cta: "Consulta gratis"
  }
};

// =========================
// PAGES
// =========================
const pageI18n = {
  portfolio: {
    en: {
      work_h1: "Our Work",
      work_sub: "Real projects built for local businesses — focused on clarity, branding, and practical results.",
      work_header_btn: "Start Your Project",

      featured_tag: "Featured Project",

      // ===== RCR =====
      rcr_intro: "Multi-page website for a local barbershop brand with booking integration, service presentation, and trust-focused structure.",
      rcr_need_t: "Client need",
      rcr_need_d: "RCR needed a professional online presence that matched its premium identity and made it easier for clients to explore services, view hours, and book appointments.",
      rcr_build_t: "What we built",
      rcr_build_d: "A branded multi-page website including homepage, services page, location and hours page, booking integration, gallery, and review-driven engagement sections.",
      rcr_high_t: "Project highlights",
      rcr_h1: "Mobile-first layout",
      rcr_h2: "Booking integration",
      rcr_h3: "Pricing page",
      rcr_h4: "Gallery section",
      rcr_h5: "Google Maps embed",
      rcr_h6: "Review funnel",
      rcr_btn_live: "Visit Website",
      rcr_btn_start: "Start Your Project",

      stat_1t: "Multi-page structure",
      stat_1d: "Home, services, location, and booking-ready flow.",
      stat_2t: "Mobile-focused",
      stat_2d: "Built to look strong on phones and tablets.",
      stat_3t: "Booking-ready",
      stat_3d: "Clear CTA path to appointment booking.",
      stat_4t: "Strong branding",
      stat_4d: "Premium black and gold visual identity.",

      // ===== ACA =====
      aca_tag: "Featured Project",
      aca_intro: "Premium promotional website for a regional Mexican cantina focused on events, reservations, nightlife atmosphere, and a brand experience that feels memorable before customers even arrive.",
      aca_need_t: "Client need",
      aca_need_d: "Acá Entre Nos needed a high-impact digital presence that matched its elegant nightlife identity while making it easy for visitors to discover events, explore promotions, view the location, and reserve a table.",
      aca_build_t: "What we built",
      aca_build_d: "A visually rich one-page experience with an immersive hero section, events showcase, reservation form, promotions carousel, location block with map, gallery, and strong calls to action connected to real customer intent.",
      aca_high_t: "Project highlights",
      aca_h1: "Nightlife branding",
      aca_h2: "Events section",
      aca_h3: "Reservation form",
      aca_h4: "Promotions carousel",
      aca_h5: "Google Maps embed",
      aca_h6: "Instagram integration",
      aca_btn_live: "Visit Website",
      aca_btn_start: "Start Your Project",

      aca_stat_1t: "Immersive brand feel",
      aca_stat_1d: "Built to communicate atmosphere, style, and nightlife energy from the first screen.",
      aca_stat_2t: "Event-ready structure",
      aca_stat_2d: "Clear layout for promoting upcoming nights, featured experiences, and weekend traffic.",
      aca_stat_3t: "Reservation-focused",
      aca_stat_3d: "Designed to guide visitors toward booking a table with less friction.",
      aca_stat_4t: "Local discovery",
      aca_stat_4d: "Location, map, Instagram and promo content help turn attention into real visits.",

      // ===== REDWOOD =====
      redwood_tag: "Client Project",
      redwood_intro: "Strategic website for a business focused on sales process structure, follow-up systems, and clearer visibility into daily activity.",
      redwood_need_t: "Client need",
      redwood_need_d: "Redwood needed a clearer way to explain its offer and show how its system helps businesses organize leads, improve follow-up, reduce missed opportunities, and understand what is happening in the sales pipeline.",
      redwood_build_t: "What we built",
      redwood_build_d: "A clean service website with a strong problem / solution narrative, implementation steps, testimonials, pricing presentation, and consultation-based calls to action.",
      redwood_high_t: "Project highlights",
      redwood_h1: "Service landing page",
      redwood_h2: "Offer clarity",
      redwood_h3: "Problem / solution flow",
      redwood_h4: "Implementation steps",
      redwood_h5: "Testimonials",
      redwood_h6: "Consultation CTA",
      redwood_btn_live: "Visit Website",
      redwood_btn_services: "View Services",

      redwood_stat_1t: "Lead flow clarity",
      redwood_stat_1d: "Clear explanation of how leads move through the sales process.",
      redwood_stat_2t: "Structured process",
      redwood_stat_2d: "Organized service flow that makes the offer easier to understand.",
      redwood_stat_3t: "Consultation-focused",
      redwood_stat_3d: "Built to guide visitors toward booking a call or consultation.",
      redwood_stat_4t: "Growth-oriented messaging",
      redwood_stat_4d: "Content designed around follow-up, visibility, and sales improvement.",

      work_cta_t: "Want a similar result for your business?",
      work_cta_d: "Tell us what you do and what you need. We’ll propose a simple plan and a clear next step.",
      work_cta_btn: "Start Your Project"
    },

    fr: {
      work_h1: "Réalisations",
      work_sub: "Des projets réels créés pour des entreprises locales — axés sur la clarté, le branding et des résultats concrets.",
      work_header_btn: "Démarrer votre projet",

      featured_tag: "Projet en vedette",

      // RCR
      rcr_intro: "Site web multipage pour une barberie locale avec intégration de réservation et présentation des services.",
      rcr_need_t: "Besoin du client",
      rcr_need_d: "RCR avait besoin d’une présence en ligne professionnelle reflétant son image premium et facilitant la réservation.",
      rcr_build_t: "Ce que nous avons créé",
      rcr_build_d: "Un site multipage complet avec services, localisation, galerie et intégration de réservation.",
      rcr_high_t: "Points clés",
      rcr_h1: "Design mobile-first",
      rcr_h2: "Réservation intégrée",
      rcr_h3: "Page des prix",
      rcr_h4: "Galerie",
      rcr_h5: "Google Maps",
      rcr_h6: "Collecte d’avis",
      rcr_btn_live: "Voir le site",
      rcr_btn_start: "Démarrer votre projet",

      stat_1t: "Structure multipage",
      stat_1d: "Accueil, services et parcours optimisé.",
      stat_2t: "Mobile-first",
      stat_2d: "Optimisé pour téléphone et tablette.",
      stat_3t: "Prêt pour réservation",
      stat_3d: "Parcours clair vers prise de rendez-vous.",
      stat_4t: "Branding fort",
      stat_4d: "Identité visuelle premium noir et or.",

      // ACA
      aca_tag: "Projet en vedette",
      aca_intro: "Site promotionnel premium pour une cantina mexicaine axé sur les événements et réservations.",
      aca_need_t: "Besoin du client",
      aca_need_d: "Créer une présence digitale forte alignée avec une identité nocturne élégante.",
      aca_build_t: "Ce que nous avons créé",
      aca_build_d: "Une expérience immersive avec événements, réservation et contenu visuel riche.",
      aca_high_t: "Points clés",
      aca_h1: "Branding nocturne",
      aca_h2: "Section événements",
      aca_h3: "Formulaire de réservation",
      aca_h4: "Promotions",
      aca_h5: "Carte Google",
      aca_h6: "Instagram",
      aca_btn_live: "Voir le site",
      aca_btn_start: "Démarrer votre projet",

      aca_stat_1t: "Expérience immersive",
      aca_stat_1d: "Atmosphère dès la première impression.",
      aca_stat_2t: "Structure événementielle",
      aca_stat_2d: "Optimisé pour attirer du trafic.",
      aca_stat_3t: "Réservation",
      aca_stat_3d: "Facilite la conversion visiteurs → clients.",
      aca_stat_4t: "Découverte locale",
      aca_stat_4d: "Transforme l’intérêt en visites réelles.",

      // REDWOOD
      redwood_tag: "Projet client",
      redwood_intro: "Site stratégique pour structurer les processus de vente.",
      redwood_need_t: "Besoin du client",
      redwood_need_d: "Clarifier l’offre et le processus de vente.",
      redwood_build_t: "Ce que nous avons créé",
      redwood_build_d: "Un site clair avec narrative problème / solution.",
      redwood_high_t: "Points clés",
      redwood_h1: "Landing page",
      redwood_h2: "Clarté de l’offre",
      redwood_h3: "Structure logique",
      redwood_h4: "Étapes",
      redwood_h5: "Témoignages",
      redwood_h6: "CTA consultation",
      redwood_btn_live: "Voir le site",
      redwood_btn_services: "Voir services",

      redwood_stat_1t: "Clarté des leads",
      redwood_stat_1d: "Compréhension du pipeline.",
      redwood_stat_2t: "Processus structuré",
      redwood_stat_2d: "Offre facile à comprendre.",
      redwood_stat_3t: "Consultation",
      redwood_stat_3d: "Encourage la prise de contact.",
      redwood_stat_4t: "Croissance",
      redwood_stat_4d: "Axé sur amélioration des ventes.",

      work_cta_t: "Vous voulez un résultat similaire?",
      work_cta_d: "Parlez-nous de votre projet.",
      work_cta_btn: "Démarrer votre projet"
    },

    es: {
      work_h1: "Nuestros trabajos",
      work_sub: "Proyectos reales para negocios locales enfocados en claridad, branding y resultados.",
      work_header_btn: "Iniciar tu proyecto",

      featured_tag: "Proyecto destacado",

      // RCR
      rcr_intro: "Sitio web multipágina para barbería con sistema de citas y presentación de servicios.",
      rcr_need_t: "Necesidad del cliente",
      rcr_need_d: "RCR necesitaba una presencia profesional que reflejara su nivel premium.",
      rcr_build_t: "Qué construimos",
      rcr_build_d: "Un sitio completo con servicios, galería y sistema de reservas.",
      rcr_high_t: "Highlights del proyecto",
      rcr_h1: "Diseño mobile-first",
      rcr_h2: "Sistema de citas",
      rcr_h3: "Página de precios",
      rcr_h4: "Galería",
      rcr_h5: "Google Maps",
      rcr_h6: "Reseñas",
      rcr_btn_live: "Ver sitio",
      rcr_btn_start: "Iniciar proyecto",

      stat_1t: "Estructura multipágina",
      stat_1d: "Flujo completo optimizado.",
      stat_2t: "Mobile-first",
      stat_2d: "Optimizado para celular.",
      stat_3t: "Listo para citas",
      stat_3d: "Camino claro a conversión.",
      stat_4t: "Branding fuerte",
      stat_4d: "Estilo premium negro y dorado.",

      // ACA
      aca_tag: "Proyecto destacado",
      aca_intro: "Sitio premium para cantina enfocado en eventos y reservas.",
      aca_need_t: "Necesidad del cliente",
      aca_need_d: "Presencia digital fuerte alineada a su identidad nocturna.",
      aca_build_t: "Qué construimos",
      aca_build_d: "Experiencia visual con eventos, reservas y promociones.",
      aca_high_t: "Highlights",
      aca_h1: "Branding nocturno",
      aca_h2: "Eventos",
      aca_h3: "Reservas",
      aca_h4: "Promociones",
      aca_h5: "Mapa",
      aca_h6: "Instagram",
      aca_btn_live: "Ver sitio",
      aca_btn_start: "Iniciar proyecto",

      aca_stat_1t: "Experiencia inmersiva",
      aca_stat_1d: "Impacto desde el inicio.",
      aca_stat_2t: "Eventos",
      aca_stat_2d: "Diseñado para atraer clientes.",
      aca_stat_3t: "Reservas",
      aca_stat_3d: "Facilita conversiones.",
      aca_stat_4t: "Descubrimiento local",
      aca_stat_4d: "Convierte visitas en clientes.",

      // REDWOOD
      redwood_tag: "Proyecto cliente",
      redwood_intro: "Sitio estratégico enfocado en ventas.",
      redwood_need_t: "Necesidad del cliente",
      redwood_need_d: "Claridad en su proceso comercial.",
      redwood_build_t: "Qué construimos",
      redwood_build_d: "Sitio con narrativa clara problema/solución.",
      redwood_high_t: "Highlights",
      redwood_h1: "Landing page",
      redwood_h2: "Claridad",
      redwood_h3: "Flujo lógico",
      redwood_h4: "Pasos",
      redwood_h5: "Testimonios",
      redwood_h6: "CTA",
      redwood_btn_live: "Ver sitio",
      redwood_btn_services: "Ver servicios",

      redwood_stat_1t: "Flujo de leads",
      redwood_stat_1d: "Visibilidad del proceso.",
      redwood_stat_2t: "Proceso claro",
      redwood_stat_2d: "Fácil de entender.",
      redwood_stat_3t: "Consultas",
      redwood_stat_3d: "Genera contactos.",
      redwood_stat_4t: "Crecimiento",
      redwood_stat_4d: "Enfoque en ventas.",

      work_cta_t: "¿Quieres algo similar?",
      work_cta_d: "Cuéntanos tu proyecto.",
      work_cta_btn: "Iniciar proyecto"
    }
  }
};

// =========================
// ENGINE
// =========================
function applyTranslations(lang, page) {
  const globalDict = globalI18n[lang] || globalI18n.en;
  const pageDict = pageI18n[page]?.[lang] || pageI18n[page]?.en || {};

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");

    if (pageDict[key]) el.textContent = pageDict[key];
    else if (globalDict[key]) el.textContent = globalDict[key];
  });

  localStorage.setItem("siteLang", lang);
}

function initI18n(page) {
  const lang = localStorage.getItem("siteLang") || "en";

  applyTranslations(lang, page);

  document.getElementById("btnEN")?.addEventListener("click", () => applyTranslations("en", page));
  document.getElementById("btnFR")?.addEventListener("click", () => applyTranslations("fr", page));
  document.getElementById("btnES")?.addEventListener("click", () => applyTranslations("es", page));
}