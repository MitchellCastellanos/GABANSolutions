/*
  i18n = "internationalization"
  Se escribe así porque entre la i inicial y la n final hay 18 letras.
  Aquí lo centralizamos para no repetir traducciones en cada HTML.
  La idea es tener:
  1) textos globales compartidos (navbar, footer, botones comunes)
  2) textos específicos por página
  y combinarlos en un solo lugar.
*/

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
    nav_express: "Launch 72H",
    nav_work: "Réalisations",
    nav_about: "À propos",
    nav_contact: "Contact",
    nav_cta: "Consultation gratuite"
  },
  es: {
    nav_home: "Inicio",
    nav_services: "Servicios",
    nav_express: "Launch 72H",
    nav_work: "Trabajos",
    nav_about: "Nosotros",
    nav_contact: "Contacto",
    nav_cta: "Consulta gratuita"
  }
};

const pageI18n = {
  home: {
    en: {
      home_h1: "Smart Digital Solutions for Small Businesses",
      home_lead: "Websites, automation and custom software to help your business grow.",
      home_cta1: "Get a Free Consultation",
      home_cta2: "View Our Services",
      home_trust: "Montréal-based • Fast delivery • Clear communication",

      home_expect_title: "What you can expect",
      home_expect_1t: "Simple process",
      home_expect_1d: "Consultation → Build → Launch & support.",
      home_expect_2t: "Practical solutions",
      home_expect_2d: "We focus on what improves your business day-to-day.",
      home_expect_3t: "Local support",
      home_expect_3d: "Montréal, QC — reachable by phone or email.",

      star_tag: "Star Service",
      star_h2: "Launch 72H",
      star_lead: "Need a professional website fast? Launch 72H is our rapid website service designed for small businesses that need to get online quickly without sacrificing quality.",
      star_b1: "Professional website delivered in 72 hours",
      star_b2: "Mobile-friendly and conversion-focused",
      star_b3: "Ideal for businesses that need results fast",
      star_btn1: "Explore Launch 72H",
      star_btn2: "Start Your Project",
      star_card_1t: "Fast Launch",
      star_card_1d: "Go live in 72 hours.",
      star_card_2t: "Mobile Ready",
      star_card_2d: "Built for phones first.",
      star_card_3t: "SEO Basics",
      star_card_3d: "Clean structure for search.",
      star_card_4t: "Lead Capture",
      star_card_4d: "Turn visits into inquiries.",

      home_services_title: "Our Services",
      home_services_sub: "Practical digital solutions designed to help small businesses grow.",
      svc_card_1t: "Web Development",
      svc_card_1d: "Modern websites optimized for performance, SEO and user experience.",
      svc_card_2t: "Automation",
      svc_card_2d: "Smart systems that reduce repetitive work and save time.",
      svc_card_3t: "Digital Visibility",
      svc_card_3d: "Better structure, trust and discoverability for your business online.",
      svc_card_4t: "Custom Solutions",
      svc_card_4d: "Practical digital tools built around your real business needs.",
      home_services_btn: "Explore All Services",

      home_work_tag: "Featured Project",
      home_work_title: "Real work for real local businesses",
      home_work_text: "We build clean, practical websites that help local businesses look professional, earn trust and generate more inquiries.",
      home_work_case_title: "RCR Barber Shop",
      home_work_case_text: "Multi-page website with service presentation, booking support and a stronger digital presence for a local brand.",
      home_work_btn: "See case study",
      home_work_btn2: "Visit website",

      home_bottom_title: "Let’s build something that works for your business.",
      home_bottom_text: "Tell us what you need. We’ll recommend the simplest solution that gets results.",
      home_bottom_btn: "Contact Us"
    },

    fr: {
      home_h1: "Des solutions numériques intelligentes pour les petites entreprises",
      home_lead: "Sites web, automatisation et logiciels sur mesure pour faire grandir votre entreprise.",
      home_cta1: "Consultation gratuite",
      home_cta2: "Voir nos services",
      home_trust: "Basé à Montréal • Livraison rapide • Communication claire",

      home_expect_title: "À quoi vous attendre",
      home_expect_1t: "Processus simple",
      home_expect_1d: "Consultation → Développement → Lancement & support.",
      home_expect_2t: "Solutions pratiques",
      home_expect_2d: "On se concentre sur ce qui améliore réellement votre quotidien.",
      home_expect_3t: "Support local",
      home_expect_3d: "Montréal, QC — joignable par téléphone ou courriel.",

      star_tag: "Service vedette",
      star_h2: "Launch 72H",
      star_lead: "Besoin d’un site professionnel rapidement? Launch 72H est notre service de site web rapide conçu pour les petites entreprises qui doivent être en ligne vite sans sacrifier la qualité.",
      star_b1: "Site professionnel livré en 72 heures",
      star_b2: "Pensé mobile et orienté conversion",
      star_b3: "Idéal pour les entreprises qui ont besoin de résultats rapides",
      star_btn1: "Découvrir Launch 72H",
      star_btn2: "Démarrer votre projet",
      star_card_1t: "Lancement rapide",
      star_card_1d: "En ligne en 72 heures.",
      star_card_2t: "Prêt mobile",
      star_card_2d: "Conçu d’abord pour téléphone.",
      star_card_3t: "SEO de base",
      star_card_3d: "Structure propre pour la recherche.",
      star_card_4t: "Capture de prospects",
      star_card_4d: "Transformer les visites en demandes.",

      home_services_title: "Nos services",
      home_services_sub: "Des solutions numériques pratiques conçues pour aider les petites entreprises à grandir.",
      svc_card_1t: "Développement web",
      svc_card_1d: "Sites modernes optimisés pour la performance, le SEO et l’expérience utilisateur.",
      svc_card_2t: "Automatisation",
      svc_card_2d: "Des systèmes intelligents qui réduisent le travail répétitif et font gagner du temps.",
      svc_card_3t: "Visibilité numérique",
      svc_card_3d: "Meilleure structure, confiance et découvrabilité pour votre entreprise en ligne.",
      svc_card_4t: "Solutions sur mesure",
      svc_card_4d: "Des outils numériques pratiques construits autour des vrais besoins de votre entreprise.",
      home_services_btn: "Voir tous les services",

      home_work_tag: "Projet en vedette",
      home_work_title: "Du vrai travail pour de vraies entreprises locales",
      home_work_text: "Nous construisons des sites propres et pratiques qui aident les entreprises locales à paraître professionnelles, inspirer confiance et générer plus de demandes.",
      home_work_case_title: "RCR Barber Shop",
      home_work_case_text: "Site multi-page avec présentation des services, support de réservation et présence numérique renforcée pour une marque locale.",
      home_work_btn: "Voir l’étude de cas",
      home_work_btn2: "Visiter le site",

      home_bottom_title: "Construisons quelque chose d’utile pour votre entreprise.",
      home_bottom_text: "Expliquez-nous votre besoin. On recommandera la solution la plus simple et efficace.",
      home_bottom_btn: "Nous contacter"
    },

    es: {
      home_h1: "Soluciones digitales inteligentes para pequeños negocios",
      home_lead: "Sitios web, automatización y software a la medida para ayudar a crecer tu negocio.",
      home_cta1: "Obtén una consulta gratuita",
      home_cta2: "Ver nuestros servicios",
      home_trust: "Basados en Montréal • Entrega rápida • Comunicación clara",

      home_expect_title: "Qué puedes esperar",
      home_expect_1t: "Proceso simple",
      home_expect_1d: "Consulta → Desarrollo → Lanzamiento y soporte.",
      home_expect_2t: "Soluciones prácticas",
      home_expect_2d: "Nos enfocamos en lo que realmente mejora tu negocio día a día.",
      home_expect_3t: "Soporte local",
      home_expect_3d: "Montréal, QC — disponibles por teléfono o correo.",

      star_tag: "Servicio estrella",
      star_h2: "Launch 72H",
      star_lead: "¿Necesitas un sitio web profesional rápido? Launch 72H es nuestro servicio de desarrollo rápido diseñado para pequeños negocios que necesitan estar en línea pronto sin sacrificar calidad.",
      star_b1: "Sitio web profesional entregado en 72 horas",
      star_b2: "Adaptado a móvil y enfocado en conversión",
      star_b3: "Ideal para negocios que necesitan resultados rápidos",
      star_btn1: "Explorar Launch 72H",
      star_btn2: "Iniciar tu proyecto",
      star_card_1t: "Lanzamiento rápido",
      star_card_1d: "En línea en 72 horas.",
      star_card_2t: "Listo para móvil",
      star_card_2d: "Pensado primero para teléfonos.",
      star_card_3t: "SEO básico",
      star_card_3d: "Estructura limpia para buscadores.",
      star_card_4t: "Captación de leads",
      star_card_4d: "Convierte visitas en contactos.",

      home_services_title: "Nuestros servicios",
      home_services_sub: "Soluciones digitales prácticas diseñadas para ayudar a crecer a pequeños negocios.",
      svc_card_1t: "Desarrollo web",
      svc_card_1d: "Sitios modernos optimizados para rendimiento, SEO y experiencia de usuario.",
      svc_card_2t: "Automatización",
      svc_card_2d: "Sistemas inteligentes que reducen trabajo repetitivo y ahorran tiempo.",
      svc_card_3t: "Visibilidad digital",
      svc_card_3d: "Mejor estructura, confianza y capacidad de encontrarte en línea.",
      svc_card_4t: "Soluciones a medida",
      svc_card_4d: "Herramientas digitales prácticas construidas alrededor de las necesidades reales de tu negocio.",
      home_services_btn: "Explorar todos los servicios",

      home_work_tag: "Proyecto destacado",
      home_work_title: "Trabajo real para negocios locales reales",
      home_work_text: "Construimos sitios limpios y prácticos que ayudan a los negocios locales a verse profesionales, generar confianza y conseguir más contactos.",
      home_work_case_title: "RCR Barber Shop",
      home_work_case_text: "Sitio multipágina con presentación de servicios, soporte para reservas y una presencia digital más fuerte para una marca local.",
      home_work_btn: "Ver caso de estudio",
      home_work_btn2: "Visitar sitio web",

      home_bottom_title: "Construyamos algo que funcione para tu negocio.",
      home_bottom_text: "Cuéntanos qué necesitas. Te recomendaremos la solución más simple que dé resultados.",
      home_bottom_btn: "Contáctanos"
    }
  },

  services: {
    en: {
      svc_h1: "Services",
      svc_sub: "Practical digital solutions built for local businesses—websites, automation, and custom tools.",
      svc_header_btn: "Get a Free Consultation",

      svc1_title: "Professional Websites",
      svc1_desc: "Modern websites that build trust and bring customers.",
      svc1_b1: "Mobile-first, fast loading",
      svc1_b2: "Clear call-to-action (calls, forms, bookings)",
      svc1_b3: "SEO basics (titles, structure, speed)",
      svc1_b4: "Google Maps & reviews integration",

      svc2_title: "Business Automation",
      svc2_desc: "Reduce repetitive work and stay organized.",
      svc2_b1: "Appointment booking systems",
      svc2_b2: "Online forms & lead capture",
      svc2_b3: "Automatic confirmations / reminders",
      svc2_b4: "Simple workflows (email + tools)",

      svc3_title: "Management Systems",
      svc3_desc: "Custom tools for tracking and reporting.",
      svc3_b1: "Dashboards & reporting",
      svc3_b2: "Inventory / client tracking",
      svc3_b3: "Simple admin panels (secure)",
      svc3_b4: "Database-backed solutions",

      svc_help_t: "Not sure what you need?",
      svc_help_d: "Tell us your business type and your main problem. We’ll recommend the simplest solution that gets results.",
      svc_help_btn: "Request a Free Consultation",

      pkg_title: "Popular Packages",
      pkg_sub: "Simple starting points. We can customize anything.",

      pkg1_t: "Starter Website",
      pkg1_d: "Perfect for new businesses that need a clean and professional presence.",
      pkg1_b1: "Home + Services + Contact",
      pkg1_b2: "Mobile-first design",
      pkg1_b3: "Basic SEO setup",

      pkg2_t: "Business Website + Leads",
      pkg2_d: "Built to capture leads and turn visitors into customers.",
      pkg2_b1: "Forms + call-to-action",
      pkg2_b2: "Google Maps & reviews",
      pkg2_b3: "Contact workflow",

      pkg3_t: "Automation / Systems",
      pkg3_d: "For businesses that want to save time and stay organized.",
      pkg3_b1: "Appointment booking",
      pkg3_b2: "Admin dashboard",
      pkg3_b3: "Reporting & tracking",

      pkg_btn: "Request a Free Consultation"
    },

    fr: {
      svc_h1: "Services",
      svc_sub: "Des solutions numériques pratiques pour les entreprises locales — sites web, automatisation et outils sur mesure.",
      svc_header_btn: "Consultation gratuite",

      svc1_title: "Sites web professionnels",
      svc1_desc: "Des sites modernes qui inspirent confiance et attirent des clients.",
      svc1_b1: "Pensé mobile, chargement rapide",
      svc1_b2: "Appel à l’action clair (appels, formulaires, réservations)",
      svc1_b3: "Bases SEO (titres, structure, vitesse)",
      svc1_b4: "Intégration Google Maps & avis",

      svc2_title: "Automatisation",
      svc2_desc: "Réduisez le travail répétitif et restez organisé.",
      svc2_b1: "Systèmes de rendez-vous",
      svc2_b2: "Formulaires & capture de prospects",
      svc2_b3: "Confirmations / rappels automatiques",
      svc2_b4: "Flux simples (courriel + outils)",

      svc3_title: "Systèmes de gestion",
      svc3_desc: "Outils sur mesure pour le suivi et les rapports.",
      svc3_b1: "Tableaux de bord & rapports",
      svc3_b2: "Inventaire / suivi clients",
      svc3_b3: "Panneaux d’administration (sécurisés)",
      svc3_b4: "Solutions avec base de données",

      svc_help_t: "Vous ne savez pas quoi choisir?",
      svc_help_d: "Dites-nous votre type d’entreprise et votre problème principal. On vous proposera la solution la plus simple et efficace.",
      svc_help_btn: "Demander une consultation gratuite",

      pkg_title: "Forfaits populaires",
      pkg_sub: "Des points de départ simples. On peut tout personnaliser.",

      pkg1_t: "Site web de départ",
      pkg1_d: "Parfait pour une entreprise qui veut une présence propre et professionnelle.",
      pkg1_b1: "Accueil + Services + Contact",
      pkg1_b2: "Design mobile-first",
      pkg1_b3: "Configuration SEO de base",

      pkg2_t: "Site business + prospects",
      pkg2_d: "Conçu pour capter des demandes et transformer les visiteurs en clients.",
      pkg2_b1: "Formulaires + appel à l’action",
      pkg2_b2: "Google Maps & avis",
      pkg2_b3: "Flux de contact",

      pkg3_t: "Automatisation / Systèmes",
      pkg3_d: "Pour les entreprises qui veulent gagner du temps et mieux s’organiser.",
      pkg3_b1: "Système de rendez-vous",
      pkg3_b2: "Tableau de bord admin",
      pkg3_b3: "Rapports & suivi",

      pkg_btn: "Demander une consultation gratuite"
    },

    es: {
      svc_h1: "Servicios",
      svc_sub: "Soluciones digitales prácticas creadas para negocios locales: sitios web, automatización y herramientas a medida.",
      svc_header_btn: "Obtén una consulta gratuita",

      svc1_title: "Sitios web profesionales",
      svc1_desc: "Sitios modernos que generan confianza y atraen clientes.",
      svc1_b1: "Pensados para móvil, carga rápida",
      svc1_b2: "Llamado a la acción claro (llamadas, formularios, reservas)",
      svc1_b3: "SEO básico (títulos, estructura, velocidad)",
      svc1_b4: "Integración con Google Maps y reseñas",

      svc2_title: "Automatización de negocio",
      svc2_desc: "Reduce trabajo repetitivo y mantente organizado.",
      svc2_b1: "Sistemas de citas y reservas",
      svc2_b2: "Formularios en línea y captación de leads",
      svc2_b3: "Confirmaciones y recordatorios automáticos",
      svc2_b4: "Flujos simples (correo + herramientas)",

      svc3_title: "Sistemas de gestión",
      svc3_desc: "Herramientas personalizadas para seguimiento y reportes.",
      svc3_b1: "Dashboards y reportes",
      svc3_b2: "Inventario / seguimiento de clientes",
      svc3_b3: "Paneles de administración simples (seguros)",
      svc3_b4: "Soluciones con base de datos",

      svc_help_t: "¿No sabes qué necesitas?",
      svc_help_d: "Cuéntanos qué tipo de negocio tienes y cuál es tu problema principal. Te recomendaremos la solución más simple que dé resultados.",
      svc_help_btn: "Solicitar consulta gratuita",

      pkg_title: "Paquetes populares",
      pkg_sub: "Puntos de partida simples. Podemos personalizar lo que necesites.",

      pkg1_t: "Sitio web inicial",
      pkg1_d: "Perfecto para nuevos negocios que necesitan una presencia limpia y profesional.",
      pkg1_b1: "Inicio + Servicios + Contacto",
      pkg1_b2: "Diseño mobile-first",
      pkg1_b3: "Configuración SEO básica",

      pkg2_t: "Sitio web de negocio + leads",
      pkg2_d: "Creado para captar contactos y convertir visitantes en clientes.",
      pkg2_b1: "Formularios + llamado a la acción",
      pkg2_b2: "Google Maps y reseñas",
      pkg2_b3: "Flujo de contacto",

      pkg3_t: "Automatización / Sistemas",
      pkg3_d: "Para negocios que quieren ahorrar tiempo y mantenerse organizados.",
      pkg3_b1: "Sistema de citas",
      pkg3_b2: "Dashboard administrativo",
      pkg3_b3: "Reportes y seguimiento",

      pkg_btn: "Solicitar consulta gratuita"
    }
  },

  express: {
    en: {
      exp_tag: "Fast. Affordable. Built to launch.",
      exp_h1: "Launch Your Business Website in 72 Hours",
      exp_lead: "Launch 72H helps small businesses get online fast with a clean, modern, mobile-friendly website built to look professional and capture leads.",
      exp_cta1: "Start Your Launch",
      exp_cta2: "See Pricing",
      exp_trust: "Ideal for businesses that need a strong online presence fast — without a huge upfront investment.",

      exp_for_title: "Who Launch 72H Is For",
      exp_for_sub: "Designed for businesses that need speed, credibility, and a real online presence.",
      exp_for_1t: "New Businesses",
      exp_for_1d: "Get online quickly with a real professional presence.",
      exp_for_2t: "Contractors & Services",
      exp_for_2d: "Get leads faster with a website people trust.",
      exp_for_3t: "Salons & Barbershops",
      exp_for_3d: "Perfect for brands that need services, contact and booking-ready pages.",
      exp_for_4t: "Consultants",
      exp_for_4d: "Look established online without waiting weeks.",

      exp_inc_title: "What’s Included",
      exp_inc_sub: "Everything needed to launch fast and start building trust online.",
      exp_inc_1t: "Up to 5 Pages",
      exp_inc_1d: "Home, services, about, contact, and one extra page if needed.",
      exp_inc_2t: "Mobile Responsive",
      exp_inc_2d: "A clean website experience on phones and tablets.",
      exp_inc_3t: "Lead Capture",
      exp_inc_3d: "Forms and CTA sections that help turn visitors into inquiries.",
      exp_inc_4t: "Basic SEO Setup",
      exp_inc_4d: "Titles, descriptions, structure and local business foundations.",
      exp_inc_5t: "SSL & Setup",
      exp_inc_5d: "We connect the domain and make sure everything launches securely.",
      exp_inc_6t: "30 Days Support",
      exp_inc_6d: "Minor support after launch so you’re not left on your own.",

      exp_proc_title: "How It Works",
      exp_proc_sub: "A simple process designed to move fast without chaos.",
      exp_proc_1t: "Send Your Content",
      exp_proc_1d: "Logo, text, photos, services and basic business info.",
      exp_proc_2t: "We Build",
      exp_proc_2d: "We design and develop your site quickly and cleanly.",
      exp_proc_3t: "You Review",
      exp_proc_3d: "You review and request final small changes.",
      exp_proc_4t: "Launch",
      exp_proc_4d: "Your website goes live and starts working for your business.",

      exp_price_tag: "Launch 72H Package",
      exp_price: "$399 CAD",
      exp_price_sub: "Professional website delivered in 72 hours.",
      exp_price_b1: "Up to 5 custom pages",
      exp_price_b2: "Mobile-responsive design",
      exp_price_b3: "Contact forms & lead capture",
      exp_price_b4: "Basic SEO optimization",
      exp_price_b5: "SSL security included",
      exp_price_b6: "30 days support included",
      exp_price_btn: "Start Now",

      exp_compare_title: "Why Launch 72H Beats DIY",
      exp_compare_sub: "Website builders seem easy until they steal your time and still look average.",
      exp_tbl_feature: "Feature",
      exp_tbl_express: "Launch 72H",
      exp_tbl_diy: "DIY Builder",
      exp_tbl_1f: "Time to launch",
      exp_tbl_1e: "72 hours",
      exp_tbl_1d: "Weeks or months",
      exp_tbl_2f: "Design quality",
      exp_tbl_2e: "Professional",
      exp_tbl_2d: "Template-based",
      exp_tbl_3f: "Technical setup",
      exp_tbl_3e: "Done for you",
      exp_tbl_3d: "You do it",
      exp_tbl_4f: "Stress level",
      exp_tbl_4e: "Low",
      exp_tbl_4d: "High",
      exp_tbl_5f: "Built to convert",
      exp_tbl_5e: "Yes",
      exp_tbl_5d: "Usually not",

      exp_test_title: "What Business Owners Want",
      exp_test_sub: "The goal is simple: get online fast and look professional.",
      exp_test_1q: "“I just need a clean website that makes my business look real and professional.”",
      exp_test_1a: "— Typical local business owner",
      exp_test_2q: "“I don’t have time to learn a website builder. I need it done fast.”",
      exp_test_2a: "— Service provider",
      exp_test_3q: "“If clients search for me online, I need something solid they can trust.”",
      exp_test_3a: "— Small business owner",

      exp_faq_title: "Frequently Asked Questions",
      exp_faq_1q: "Is 72 hours really enough for a quality website?",
      exp_faq_1a: "Yes — as long as the project is focused, content is ready, and the goal is a clean business website, not a huge custom platform.",
      exp_faq_2q: "What do you need from me to start?",
      exp_faq_2a: "Your business name, logo if you have one, your text, services, photos, and your contact details.",
      exp_faq_3q: "Can I add more features later?",
      exp_faq_3a: "Absolutely. Launch 72H is a strong starting point. More pages, SEO, automation, or extra features can be added later.",

      exp_final_title: "Ready to launch your business fast?",
      exp_final_sub: "Get online quickly with a professional website designed to build trust and generate results.",
      exp_final_btn: "Get Started"
    },

    fr: {
      exp_tag: "Rapide. Abordable. Prêt à lancer.",
      exp_h1: "Lancez le site web de votre entreprise en 72 heures",
      exp_lead: "Launch 72H aide les petites entreprises à être en ligne rapidement avec un site propre, moderne et adapté au mobile, conçu pour avoir l’air professionnel et capter des demandes.",
      exp_cta1: "Démarrer le lancement",
      exp_cta2: "Voir le prix",
      exp_trust: "Idéal pour les entreprises qui ont besoin d’une vraie présence en ligne rapidement — sans énorme investissement initial.",

      exp_for_title: "Pour qui Launch 72H est conçu",
      exp_for_sub: "Pensé pour les entreprises qui ont besoin de rapidité, de crédibilité et d’une vraie présence en ligne.",
      exp_for_1t: "Nouvelles entreprises",
      exp_for_1d: "Soyez en ligne rapidement avec une vraie présence professionnelle.",
      exp_for_2t: "Entrepreneurs & services",
      exp_for_2d: "Obtenez plus de demandes avec un site qui inspire confiance.",
      exp_for_3t: "Salons & barbiers",
      exp_for_3d: "Parfait pour les marques qui ont besoin de pages services, contact et réservation prêtes.",
      exp_for_4t: "Consultants",
      exp_for_4d: "Ayez l’air établi en ligne sans attendre des semaines.",

      exp_inc_title: "Ce qui est inclus",
      exp_inc_sub: "Tout ce qu’il faut pour lancer vite et commencer à bâtir la confiance en ligne.",
      exp_inc_1t: "Jusqu’à 5 pages",
      exp_inc_1d: "Accueil, services, à propos, contact, et une page supplémentaire si nécessaire.",
      exp_inc_2t: "Responsive mobile",
      exp_inc_2d: "Une expérience propre sur téléphone et tablette.",
      exp_inc_3t: "Capture de prospects",
      exp_inc_3d: "Formulaires et sections CTA pour transformer les visiteurs en demandes.",
      exp_inc_4t: "SEO de base",
      exp_inc_4d: "Titres, descriptions, structure et fondations locales.",
      exp_inc_5t: "SSL & configuration",
      exp_inc_5d: "On connecte le domaine et on s’assure d’un lancement sécurisé.",
      exp_inc_6t: "30 jours de support",
      exp_inc_6d: "Petit support après le lancement pour ne pas vous laisser seul.",

      exp_proc_title: "Comment ça marche",
      exp_proc_sub: "Un processus simple pensé pour aller vite sans chaos.",
      exp_proc_1t: "Envoyez votre contenu",
      exp_proc_1d: "Logo, texte, photos, services et infos de base.",
      exp_proc_2t: "On construit",
      exp_proc_2d: "On conçoit et développe votre site rapidement et proprement.",
      exp_proc_3t: "Vous révisez",
      exp_proc_3d: "Vous révisez et demandez les derniers petits ajustements.",
      exp_proc_4t: "Lancement",
      exp_proc_4d: "Votre site est en ligne et commence à travailler pour votre entreprise.",

      exp_price_tag: "Forfait Launch 72H",
      exp_price: "399 $ CAD",
      exp_price_sub: "Site web professionnel livré en 72 heures.",
      exp_price_b1: "Jusqu’à 5 pages personnalisées",
      exp_price_b2: "Design responsive mobile",
      exp_price_b3: "Formulaires & capture de prospects",
      exp_price_b4: "SEO de base",
      exp_price_b5: "Sécurité SSL incluse",
      exp_price_b6: "30 jours de support inclus",
      exp_price_btn: "Commencer",

      exp_compare_title: "Pourquoi Launch 72H bat le DIY",
      exp_compare_sub: "Les builders semblent faciles jusqu’à ce qu’ils vous fassent perdre du temps pour un résultat moyen.",
      exp_tbl_feature: "Critère",
      exp_tbl_express: "Launch 72H",
      exp_tbl_diy: "Builder DIY",
      exp_tbl_1f: "Temps de lancement",
      exp_tbl_1e: "72 heures",
      exp_tbl_1d: "Semaines ou mois",
      exp_tbl_2f: "Qualité design",
      exp_tbl_2e: "Professionnelle",
      exp_tbl_2d: "Basée sur template",
      exp_tbl_3f: "Configuration technique",
      exp_tbl_3e: "Fait pour vous",
      exp_tbl_3d: "À votre charge",
      exp_tbl_4f: "Niveau de stress",
      exp_tbl_4e: "Faible",
      exp_tbl_4d: "Élevé",
      exp_tbl_5f: "Pensé pour convertir",
      exp_tbl_5e: "Oui",
      exp_tbl_5d: "Souvent non",

      exp_test_title: "Ce que veulent les entrepreneurs",
      exp_test_sub: "Le but est simple : être en ligne vite et avoir l’air professionnel.",
      exp_test_1q: "« Je veux juste un site propre qui fait paraître mon entreprise sérieuse. »",
      exp_test_1a: "— Entrepreneur local typique",
      exp_test_2q: "« Je n’ai pas le temps d’apprendre un builder. J’ai besoin que ce soit fait vite. »",
      exp_test_2a: "— Prestataire de service",
      exp_test_3q: "« Si les clients me cherchent en ligne, il faut quelque chose de solide et rassurant. »",
      exp_test_3a: "— Propriétaire de PME",

      exp_faq_title: "Questions fréquentes",
      exp_faq_1q: "72 heures, c’est vraiment suffisant pour un bon site?",
      exp_faq_1a: "Oui — tant que le projet reste ciblé, que le contenu est prêt et que l’objectif est un site d’entreprise propre, pas une grosse plateforme sur mesure.",
      exp_faq_2q: "De quoi avez-vous besoin pour commencer?",
      exp_faq_2a: "Le nom de votre entreprise, votre logo si vous en avez un, vos textes, vos services, vos photos et vos coordonnées.",
      exp_faq_3q: "Puis-je ajouter des fonctions plus tard?",
      exp_faq_3a: "Absolument. Launch 72H est une base solide. On peut ajouter plus de pages, du SEO, de l’automatisation ou d’autres fonctions plus tard.",

      exp_final_title: "Prêt à lancer votre entreprise rapidement?",
      exp_final_sub: "Soyez en ligne rapidement avec un site professionnel conçu pour inspirer confiance et générer des résultats.",
      exp_final_btn: "Commencer"
    },

    es: {
      exp_tag: "Rápido. Accesible. Hecho para lanzar.",
      exp_h1: "Lanza el sitio web de tu negocio en 72 horas",
      exp_lead: "Launch 72H ayuda a pequeños negocios a estar en línea rápidamente con un sitio limpio, moderno y adaptado a móvil, diseñado para verse profesional y captar contactos.",
      exp_cta1: "Inicia tu lanzamiento",
      exp_cta2: "Ver precio",
      exp_trust: "Ideal para negocios que necesitan una presencia en línea fuerte y rápida, sin una gran inversión inicial.",

      exp_for_title: "Para quién es Launch 72H",
      exp_for_sub: "Diseñado para negocios que necesitan velocidad, credibilidad y una presencia real en línea.",
      exp_for_1t: "Nuevos negocios",
      exp_for_1d: "Ponte en línea rápido con una presencia realmente profesional.",
      exp_for_2t: "Contratistas y servicios",
      exp_for_2d: "Consigue más contactos con un sitio en el que la gente confíe.",
      exp_for_3t: "Salones y barberías",
      exp_for_3d: "Perfecto para marcas que necesitan páginas listas para servicios, contacto y reservas.",
      exp_for_4t: "Consultores",
      exp_for_4d: "Haz que tu negocio se vea establecido en línea sin esperar semanas.",

      exp_inc_title: "Qué incluye",
      exp_inc_sub: "Todo lo necesario para lanzar rápido y empezar a generar confianza en línea.",
      exp_inc_1t: "Hasta 5 páginas",
      exp_inc_1d: "Inicio, servicios, nosotros, contacto y una página extra si hace falta.",
      exp_inc_2t: "Adaptado a móvil",
      exp_inc_2d: "Una experiencia limpia en teléfonos y tabletas.",
      exp_inc_3t: "Captación de leads",
      exp_inc_3d: "Formularios y secciones CTA que ayudan a convertir visitantes en contactos.",
      exp_inc_4t: "SEO básico",
      exp_inc_4d: "Títulos, descripciones, estructura y bases para negocio local.",
      exp_inc_5t: "SSL y configuración",
      exp_inc_5d: "Conectamos el dominio y nos aseguramos de que todo salga en línea de forma segura.",
      exp_inc_6t: "30 días de soporte",
      exp_inc_6d: "Soporte menor después del lanzamiento para que no te quedes solo.",

      exp_proc_title: "Cómo funciona",
      exp_proc_sub: "Un proceso simple diseñado para avanzar rápido sin caos.",
      exp_proc_1t: "Envía tu contenido",
      exp_proc_1d: "Logo, textos, fotos, servicios e información básica del negocio.",
      exp_proc_2t: "Nosotros construimos",
      exp_proc_2d: "Diseñamos y desarrollamos tu sitio rápido y de forma limpia.",
      exp_proc_3t: "Tú revisas",
      exp_proc_3d: "Revisas y pides los últimos pequeños cambios.",
      exp_proc_4t: "Lanzamiento",
      exp_proc_4d: "Tu sitio sale en línea y empieza a trabajar para tu negocio.",

      exp_price_tag: "Paquete Launch 72H",
      exp_price: "$399 CAD",
      exp_price_sub: "Sitio web profesional entregado en 72 horas.",
      exp_price_b1: "Hasta 5 páginas personalizadas",
      exp_price_b2: "Diseño responsive para móvil",
      exp_price_b3: "Formularios de contacto y captación de leads",
      exp_price_b4: "Optimización SEO básica",
      exp_price_b5: "Seguridad SSL incluida",
      exp_price_b6: "30 días de soporte incluidos",
      exp_price_btn: "Comenzar",

      exp_compare_title: "Por qué Launch 72H supera al DIY",
      exp_compare_sub: "Los constructores de sitios parecen fáciles hasta que te quitan tiempo y aun así se ven promedio.",
      exp_tbl_feature: "Característica",
      exp_tbl_express: "Launch 72H",
      exp_tbl_diy: "Constructor DIY",
      exp_tbl_1f: "Tiempo para lanzar",
      exp_tbl_1e: "72 horas",
      exp_tbl_1d: "Semanas o meses",
      exp_tbl_2f: "Calidad del diseño",
      exp_tbl_2e: "Profesional",
      exp_tbl_2d: "Basado en plantillas",
      exp_tbl_3f: "Configuración técnica",
      exp_tbl_3e: "Hecho por nosotros",
      exp_tbl_3d: "Lo haces tú",
      exp_tbl_4f: "Nivel de estrés",
      exp_tbl_4e: "Bajo",
      exp_tbl_4d: "Alto",
      exp_tbl_5f: "Hecho para convertir",
      exp_tbl_5e: "Sí",
      exp_tbl_5d: "Normalmente no",

      exp_test_title: "Lo que quieren los dueños de negocio",
      exp_test_sub: "La meta es simple: estar en línea rápido y verse profesional.",
      exp_test_1q: "“Solo necesito un sitio limpio que haga que mi negocio se vea real y profesional.”",
      exp_test_1a: "— Dueño típico de negocio local",
      exp_test_2q: "“No tengo tiempo para aprender a usar un constructor web. Necesito que se haga rápido.”",
      exp_test_2a: "— Proveedor de servicios",
      exp_test_3q: "“Si mis clientes me buscan en línea, necesito algo sólido en lo que puedan confiar.”",
      exp_test_3a: "— Dueño de pequeño negocio",

      exp_faq_title: "Preguntas frecuentes",
      exp_faq_1q: "¿De verdad 72 horas son suficientes para un sitio de calidad?",
      exp_faq_1a: "Sí, siempre que el proyecto sea enfocado, el contenido esté listo y el objetivo sea un sitio empresarial limpio, no una plataforma enorme y personalizada.",
      exp_faq_2q: "¿Qué necesitas de mí para empezar?",
      exp_faq_2a: "El nombre de tu negocio, tu logo si tienes uno, tus textos, servicios, fotos y tus datos de contacto.",
      exp_faq_3q: "¿Puedo agregar más funciones después?",
      exp_faq_3a: "Claro. Launch 72H es una base fuerte. Después se pueden agregar más páginas, SEO, automatización o funciones extra.",

      exp_final_title: "¿Listo para lanzar tu negocio rápido?",
      exp_final_sub: "Ponte en línea rápidamente con un sitio profesional diseñado para generar confianza y resultados.",
      exp_final_btn: "Empezar"
    }
  },

  contact: {
    en: {
      contact_h1: "Contact",
      contact_sub: "Tell us what you need. We’ll reply with a clear next step.",
      contact_call_btn: "Call Now",

      contact_info_t: "Contact information",
      contact_phone_t: "Phone",
      contact_email_t: "Email",
      contact_web_t: "Website",
      contact_loc_t: "Location",

      contact_help_t: "What to include in your message",
      contact_help_b1: "Your business type",
      contact_help_b2: "What you want to improve",
      contact_help_b3: "Your timeline (if any)",

      contact_form_t: "Send a message",
      form_name: "Name",
      form_email: "Email",
      form_business: "Business",
      form_message: "Message",
      form_send: "Send Message",
      form_note: "We usually reply within 24 hours."
    },

    fr: {
      contact_h1: "Contact",
      contact_sub: "Expliquez votre besoin. On vous répondra avec une prochaine étape claire.",
      contact_call_btn: "Appeler",

      contact_info_t: "Informations de contact",
      contact_phone_t: "Téléphone",
      contact_email_t: "Courriel",
      contact_web_t: "Site web",
      contact_loc_t: "Lieu",

      contact_help_t: "À inclure dans votre message",
      contact_help_b1: "Votre type d’entreprise",
      contact_help_b2: "Ce que vous voulez améliorer",
      contact_help_b3: "Votre échéancier (si applicable)",

      contact_form_t: "Envoyer un message",
      form_name: "Nom",
      form_email: "Courriel",
      form_business: "Entreprise",
      form_message: "Message",
      form_send: "Envoyer",
      form_note: "On répond habituellement dans les 24 heures."
    },

    es: {
      contact_h1: "Contacto",
      contact_sub: "Cuéntanos qué necesitas. Te responderemos con un siguiente paso claro.",
      contact_call_btn: "Llamar ahora",

      contact_info_t: "Información de contacto",
      contact_phone_t: "Teléfono",
      contact_email_t: "Correo",
      contact_web_t: "Sitio web",
      contact_loc_t: "Ubicación",

      contact_help_t: "Qué incluir en tu mensaje",
      contact_help_b1: "Tu tipo de negocio",
      contact_help_b2: "Qué quieres mejorar",
      contact_help_b3: "Tu plazo o tiempo estimado (si tienes uno)",

      contact_form_t: "Enviar un mensaje",
      form_name: "Nombre",
      form_email: "Correo",
      form_business: "Negocio",
      form_message: "Mensaje",
      form_send: "Enviar mensaje",
      form_note: "Normalmente respondemos dentro de 24 horas."
    }
  },

  about: {
    en: {
      about_h1: "About",
      about_sub: "We help small businesses launch practical digital tools that actually improve operations.",

      about_story_t: "Our approach",
      about_story_p1: "Many small businesses know they need a website or better digital tools, but they don’t want to spend months managing a complex project.",
      about_story_p2: "GABAN Solutions Numériques focuses on simple, practical digital solutions that help businesses look professional online and operate more efficiently.",
      about_story_p3: "Our goal is not to sell complicated software — it’s to build tools that actually help businesses grow.",

      about_values_t: "What we focus on",
      about_val_1t: "Speed",
      about_val_1d: "Projects move fast and avoid unnecessary complexity.",
      about_val_2t: "Practical tools",
      about_val_2d: "Everything we build has a real business use.",
      about_val_3t: "Clear communication",
      about_val_3d: "Clients always know what is happening and what comes next.",

      about_cta_t: "Let’s build something useful for your business.",
      about_cta_d: "Tell us what you need and we’ll recommend the simplest solution.",
      about_cta_btn: "Start a conversation"
    },

    fr: {
      about_h1: "À propos",
      about_sub: "Nous aidons les petites entreprises à lancer des outils numériques pratiques qui améliorent réellement leurs opérations.",

      about_story_t: "Notre approche",
      about_story_p1: "Beaucoup de petites entreprises savent qu’elles ont besoin d’un site web ou de meilleurs outils numériques, mais ne veulent pas gérer un projet complexe pendant des mois.",
      about_story_p2: "GABAN Solutions Numériques se concentre sur des solutions simples et pratiques qui aident les entreprises à paraître professionnelles en ligne et à mieux fonctionner.",
      about_story_p3: "Notre objectif n’est pas de vendre des logiciels compliqués — mais de construire des outils réellement utiles.",

      about_values_t: "Nos priorités",
      about_val_1t: "Rapidité",
      about_val_1d: "Les projets avancent vite sans complexité inutile.",
      about_val_2t: "Solutions pratiques",
      about_val_2d: "Tout ce que nous construisons sert un objectif concret.",
      about_val_3t: "Communication claire",
      about_val_3d: "Les clients savent toujours ce qui se passe et la prochaine étape.",

      about_cta_t: "Construisons quelque chose d’utile pour votre entreprise.",
      about_cta_d: "Expliquez votre besoin et nous proposerons la solution la plus simple.",
      about_cta_btn: "Commencer"
    },

    es: {
      about_h1: "Nosotros",
      about_sub: "Ayudamos a pequeños negocios a lanzar herramientas digitales prácticas que realmente mejoran sus operaciones.",

      about_story_t: "Nuestro enfoque",
      about_story_p1: "Muchos pequeños negocios saben que necesitan un sitio web o mejores herramientas digitales, pero no quieren pasar meses gestionando un proyecto complejo.",
      about_story_p2: "GABAN Solutions Numériques se enfoca en soluciones digitales simples y prácticas que ayudan a los negocios a verse profesionales en línea y operar con más eficiencia.",
      about_story_p3: "Nuestro objetivo no es vender software complicado, sino construir herramientas que realmente ayuden a los negocios a crecer.",

      about_values_t: "En qué nos enfocamos",
      about_val_1t: "Velocidad",
      about_val_1d: "Los proyectos avanzan rápido y evitan complejidad innecesaria.",
      about_val_2t: "Herramientas prácticas",
      about_val_2d: "Todo lo que construimos tiene un uso real para el negocio.",
      about_val_3t: "Comunicación clara",
      about_val_3d: "Los clientes siempre saben qué está pasando y cuál es el siguiente paso.",

      about_cta_t: "Construyamos algo útil para tu negocio.",
      about_cta_d: "Cuéntanos qué necesitas y te recomendaremos la solución más simple.",
      about_cta_btn: "Iniciar conversación"
    }
  },

  portfolio: {
    en: {
      work_h1: "Our Work",
      work_sub: "Real projects built for local businesses — focused on clarity, branding, and practical results.",
      work_header_btn: "Start Your Project",

      featured_tag: "Featured Project",
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
      work_sub: "Des projets réels créés pour des entreprises locales — avec clarté, branding et résultats concrets.",
      work_header_btn: "Démarrer votre projet",

      featured_tag: "Projet en vedette",
      rcr_intro: "Site multi-page pour une marque de barbershop locale avec intégration de réservation, présentation des services et structure axée sur la confiance.",
      rcr_need_t: "Besoin du client",
      rcr_need_d: "RCR avait besoin d’une présence en ligne professionnelle qui reflète son identité premium et facilite la découverte des services, des horaires et de la réservation.",
      rcr_build_t: "Ce qu’on a construit",
      rcr_build_d: "Un site multi-page de marque incluant page d’accueil, page services, page contact/horaires, intégration de réservation, galerie et sections orientées avis clients.",
      rcr_high_t: "Points forts du projet",
      rcr_h1: "Design mobile-first",
      rcr_h2: "Intégration de réservation",
      rcr_h3: "Page tarifs/services",
      rcr_h4: "Section galerie",
      rcr_h5: "Intégration Google Maps",
      rcr_h6: "Tunnel d’avis clients",
      rcr_btn_live: "Visiter le site",
      rcr_btn_start: "Démarrer votre projet",

      stat_1t: "Structure multi-page",
      stat_1d: "Accueil, services, horaires et parcours prêt pour réservation.",
      stat_2t: "Pensé mobile",
      stat_2d: "Conçu pour être fort sur téléphone et tablette.",
      stat_3t: "Prêt pour la réservation",
      stat_3d: "Parcours clair vers la prise de rendez-vous.",
      stat_4t: "Branding fort",
      stat_4d: "Identité visuelle premium noir et or.",

      redwood_tag: "Projet client",
      redwood_intro: "Site stratégique pour une entreprise axée sur la structure du processus de vente, les systèmes de suivi et une meilleure visibilité des activités quotidiennes.",
      redwood_need_t: "Besoin du client",
      redwood_need_d: "Redwood avait besoin d’une façon plus claire d’expliquer son offre et de montrer comment son système aide les entreprises à organiser les leads, améliorer le suivi, réduire les occasions manquées et comprendre ce qui se passe dans le pipeline de vente.",
      redwood_build_t: "Ce qu’on a construit",
      redwood_build_d: "Un site de services propre avec une forte narration problème / solution, des étapes d’implantation, des témoignages, une présentation des tarifs et des appels à l’action orientés consultation.",
      redwood_high_t: "Points forts du projet",
      redwood_h1: "Landing page de service",
      redwood_h2: "Clarté de l’offre",
      redwood_h3: "Flux problème / solution",
      redwood_h4: "Étapes d’implantation",
      redwood_h5: "Témoignages",
      redwood_h6: "CTA de consultation",
      redwood_btn_live: "Visiter le site",
      redwood_btn_services: "Voir les services",

      redwood_stat_1t: "Clarté du parcours des leads",
      redwood_stat_1d: "Explication claire de la façon dont les leads avancent dans le processus de vente.",

      redwood_stat_2t: "Processus structuré",
      redwood_stat_2d: "Parcours de service organisé qui rend l’offre plus facile à comprendre.",

      redwood_stat_3t: "Axé sur la consultation",
      redwood_stat_3d: "Conçu pour guider les visiteurs vers la prise d’appel ou de consultation.",

      redwood_stat_4t: "Message orienté croissance",
      redwood_stat_4d: "Contenu pensé autour du suivi, de la visibilité et de l’amélioration des ventes.",

      work_cta_t: "Vous voulez un résultat similaire pour votre entreprise?",
      work_cta_d: "Dites-nous ce que vous faites et ce dont vous avez besoin. On vous proposera un plan simple et une prochaine étape claire.",
      work_cta_btn: "Démarrer votre projet"
    },

    es: {
      work_h1: "Nuestros trabajos",
      work_sub: "Proyectos reales creados para negocios locales, enfocados en claridad, marca y resultados prácticos.",
      work_header_btn: "Iniciar tu proyecto",

      featured_tag: "Proyecto destacado",
      rcr_intro: "Sitio multipágina para una barbería local con integración de reservas, presentación de servicios y una estructura enfocada en generar confianza.",
      rcr_need_t: "Necesidad del cliente",
      rcr_need_d: "RCR necesitaba una presencia profesional en línea que reflejara su identidad premium y facilitara a los clientes explorar servicios, ver horarios y reservar citas.",
      rcr_build_t: "Lo que construimos",
      rcr_build_d: "Un sitio multipágina con marca propia que incluye inicio, página de servicios, ubicación y horarios, integración de reservas, galería y secciones orientadas a reseñas.",
      rcr_high_t: "Puntos destacados del proyecto",
      rcr_h1: "Diseño mobile-first",
      rcr_h2: "Integración de reservas",
      rcr_h3: "Página de precios",
      rcr_h4: "Sección de galería",
      rcr_h5: "Google Maps integrado",
      rcr_h6: "Embudo de reseñas",
      rcr_btn_live: "Visitar sitio web",
      rcr_btn_start: "Iniciar tu proyecto",

      stat_1t: "Estructura multipágina",
      stat_1d: "Inicio, servicios, ubicación y flujo listo para reservas.",
      stat_2t: "Enfocado en móvil",
      stat_2d: "Construido para verse fuerte en teléfonos y tabletas.",
      stat_3t: "Listo para reservas",
      stat_3d: "Ruta CTA clara hacia la reserva de citas.",
      stat_4t: "Marca sólida",
      stat_4d: "Identidad visual premium en negro y dorado.",

      redwood_tag: "Proyecto de cliente",
      redwood_intro: "Sitio estratégico para un negocio enfocado en la estructura del proceso de ventas, sistemas de seguimiento y mayor visibilidad de la actividad diaria.",
      redwood_need_t: "Necesidad del cliente",
      redwood_need_d: "Redwood necesitaba una forma más clara de explicar su oferta y mostrar cómo su sistema ayuda a las empresas a organizar leads, mejorar seguimiento, reducir oportunidades perdidas y entender qué pasa dentro del pipeline de ventas.",
      redwood_build_t: "Lo que construimos",
      redwood_build_d: "Un sitio limpio de servicios con una narrativa fuerte de problema / solución, pasos de implementación, testimonios, presentación de precios y llamados a la acción orientados a consulta.",
      redwood_high_t: "Puntos destacados del proyecto",
      redwood_h1: "Landing page de servicio",
      redwood_h2: "Claridad de la oferta",
      redwood_h3: "Flujo problema / solución",
      redwood_h4: "Pasos de implementación",
      redwood_h5: "Testimonios",
      redwood_h6: "CTA de consulta",
      redwood_btn_live: "Visitar sitio web",
      redwood_btn_services: "Ver servicios",

      redwood_stat_1t: "Claridad en el flujo de leads",
      redwood_stat_1d: "Explicación clara de cómo avanzan los leads dentro del proceso de ventas.",

      redwood_stat_2t: "Proceso estructurado",
      redwood_stat_2d: "Flujo de servicio organizado que hace más fácil entender la oferta.",

      redwood_stat_3t: "Enfocado en consulta",
      redwood_stat_3d: "Construido para guiar a los visitantes a reservar una llamada o consulta.",

      redwood_stat_4t: "Mensaje orientado al crecimiento",
      redwood_stat_4d: "Contenido diseñado alrededor de seguimiento, visibilidad y mejora en ventas.",

      work_cta_t: "¿Quieres un resultado similar para tu negocio?",
      work_cta_d: "Cuéntanos a qué te dedicas y qué necesitas. Te propondremos un plan simple y un siguiente paso claro.",
      work_cta_btn: "Iniciar tu proyecto"
    }
  }
};

function getMergedTranslations(pageName, lang) {
  return {
    ...globalI18n[lang],
    ...(pageI18n[pageName]?.[lang] || {})
  };
}

function applyTranslations(pageName, lang) {
  const dict = getMergedTranslations(pageName, lang);

  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key] !== undefined) {
      el.textContent = dict[key];
    }
  });

  const btnEN = document.getElementById("btnEN");
  const btnFR = document.getElementById("btnFR");
  const btnES = document.getElementById("btnES");

  if (btnEN && btnFR && btnES) {
    btnEN.classList.toggle("btn-dark", lang === "en");
    btnEN.classList.toggle("btn-outline-dark", lang !== "en");

    btnFR.classList.toggle("btn-dark", lang === "fr");
    btnFR.classList.toggle("btn-outline-dark", lang !== "fr");

    btnES.classList.toggle("btn-dark", lang === "es");
    btnES.classList.toggle("btn-outline-dark", lang !== "es");

    btnEN.onclick = () => {
      localStorage.setItem("lang", "en");
      applyTranslations(pageName, "en");
    };

    btnFR.onclick = () => {
      localStorage.setItem("lang", "fr");
      applyTranslations(pageName, "fr");
    };

    btnES.onclick = () => {
      localStorage.setItem("lang", "es");
      applyTranslations(pageName, "es");
    };
  }
}

function initI18n(pageName) {
  const savedLang = localStorage.getItem("lang") || "en";
  applyTranslations(pageName, savedLang);
}