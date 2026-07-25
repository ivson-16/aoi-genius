export type Lang = "fr" | "en";

const fr: Record<string, string> = {
  // Navbar
  "nav.tagline": "AOI GENIUS : Think Bold. Create Together. Transform the Future.",
  "nav.demoRole": "Rôle Démo :",
  "nav.visitor": "Visiteur",
  "nav.member": "Membre",
  "nav.admin": "Admin",
  "nav.home": "Accueil",
  "nav.publications": "Publications",
  "nav.library": "Bibliothèque",
  "nav.members": "Membres",
  "nav.news": "Actualités",
  "nav.vision": "Notre vision",
  "nav.about": "À propos",
  "nav.contact": "Contact",
  "nav.login": "Connexion",
  "nav.join": "Rejoindre",
  "nav.searchTitle": "Rechercher dans les innovations AOI Genius",
  "nav.searchPlaceholder": "Titre, catégorie, mot-clé, ou nom de l'auteur...",
  "nav.searchFind": "Trouver",
  "nav.popular": "Recherches populaires :",
  "nav.subtitle": "Innovation Collaborative",

  // Hero (Home)
  "hero.badge": "AOI GENIUS V1.0 – Plateforme Web d'Innovation Collaborative",
  "hero.subtitle":
    "La communauté de référence pour les chercheurs, ingénieurs, développeurs et esprits audacieux. Publiez vos travaux, découvrez des innovations à fort impact et collaborez pour résoudre les défis de la société.",
  "hero.ctaExplore": "Explorer les Innovations",
  "hero.ctaPublish": "Publier un Projet",
  "hero.ctaLibrary": "Bibliothèque PDF",
  "hero.statDomains": "Domaines Scientifiques",
  "hero.statAccess": "Accès Collaboratif",
  "hero.statViews": "Vues sur les Projets",
  "hero.statVersion": "Fondation Solide",

  // Home sections
  "home.catEyebrow": "Écosystème & Domaines",
  "home.catTitle": "Explorez par Domaines d'Innovation",
  "home.catAll": "Voir toutes les catégories",
  "home.pubCount": "publication",
  "home.featEyebrow": "Sélection du Comité Scientifique",
  "home.featTitle": "Innovations & Publications Vedettes",
  "home.featAll": "Toutes les publications",
  "home.pillarEyebrow": "Méthodologie & Philosophie",
  "home.pillarTitle": "Comment Nous Transformons les Idées en Impact",
  "home.pillarSub":
    "Une démarche collaborative structurée autour de nos trois principes directeurs fondamentaux.",
  "home.p1Title": "Think Bold",
  "home.p1Desc":
    "Penser au-delà des cadres conventionnels. Oser aborder les problèmes les plus ardus avec audace, rigueur scientifique et créativité.",
  "home.p2Title": "Create Together",
  "home.p2Desc":
    "L’intelligence collective dépasse le génie isolé. Nous favorisons le partage ouvert des protocoles, des prototypes et des retours terrain.",
  "home.p3Title": "Transform the Future",
  "home.p3Desc":
    "Passer de la théorie au terrain. Déployer des solutions pérennes pour l'accès à l'énergie, l'agriculture résiliente et la santé pour tous.",
  "home.newsEyebrow": "Vie de la Communauté",
  "home.newsTitle": "Actualités & Concours d'Innovation",
  "home.newsAll": "Toutes les actualités",
  "home.ctaTitle": "Prêt à publier votre innovation ?",
  "home.ctaSub":
    "Rejoignez plus de 500 innovateurs et chercheurs. Donnez à vos projets la visibilité et l'accompagnement qu'ils méritent.",
  "home.ctaRegister": "Créer un compte Membre",
  "home.ctaContact": "Contacter l'Équipe",

  // Publications page
  "pub.badge": "Catalogue des Innovations & Recherches AOI Genius",
  "pub.title": "Publications & Projets de la Communauté",
  "pub.subtitle":
    "Parcourez les articles scientifiques, innovations techniques, prototypes mécatroniques et rapports d'ingénierie développés par nos membres.",
  "pub.searchPlaceholder": "Rechercher par mot-clé, titre, auteur...",
  "pub.searchBtn": "Rechercher",
  "pub.domain": "Domaine :",
  "pub.allDomains": "Tous les domaines",
  "pub.sortBy": "Trier par :",
  "pub.recent": "Plus récents",
  "pub.popular": "Popularité (J'aime)",
  "pub.views": "Nombre de vues",
  "pub.empty": "Aucune publication ne correspond à vos critères.",
  "pub.reset": "Réinitialiser les filtres",
  "pub.loading": "Chargement des publications...",

  // Library
  "lib.badge": "Bibliothèque Numérique des Innovations & Protocoles",
  "lib.title": "Bibliothèque des Travaux & Documents Techniques",
  "lib.subtitle":
    "Consultez et téléchargez les rapports de recherche, schémas mécatroniques et documentations techniques validés par le comité scientifique AOI Genius.",
  "lib.consult": "Consulter",

  // Members
  "mem.badge": "Annuaire de la Communauté AOI Genius",
  "mem.title": "Innovateurs, Chercheurs & Ingénieurs Membres",
  "mem.subtitle":
    "Découvrez les profils publics des membres de la communauté, leurs domaines d'expertise et leurs contributions scientifiques.",
  "mem.searchPlaceholder": "Rechercher par nom, ville, pays ou spécialité...",
  "mem.filter": "Filtrer",
  "mem.specialty": "Spécialité :",
  "mem.loading": "Chargement des membres...",

  // News
  "news.badge": "Actualités & Communiqués Officiels",
  "news.title": "Actualités de la Communauté AOI Genius",
  "news.subtitle":
    "Restez informé des concours d'innovation, des signatures de partenariats technologiques et des événements de la communauté.",

  // About
  "about.badge": "Qui sommes-nous ?",
  "about.title": "Bâtir l'Avenir par l'Innovation Collaborative",
  "about.subtitle":
    "AOI Genius est une communauté internationale dédiée à la recherche scientifique, à l'ingénierie mécatronique et au déploiement de solutions technologiques concrètes face aux défis sociétaux.",
  "about.mission": "Notre Mission",
  "about.missionTitle": "Transformer le Savoir Scientifique en Impact Direct",

  // Vision
  "vision.badge": "Vision Fondatrice & Évolutive",
  "vision.title": "Notre Vision : V1.0 et Futur de l'Innovation",
  "vision.subtitle":
    "AOI Genius V1.0 constitue la fondation opérationnelle. Découvrez comment notre communauté construit l'écosystème d'innovation de demain.",
  "vision.roadmapEyebrow": "Feuille de Route",
  "vision.roadmapTitle": "Évolutions Futures de la Plateforme (V2.0+)",

  // Contact
  "contact.badge": "Écoute & Support",
  "contact.title": "Contactez l'Équipe AOI Genius",
  "contact.subtitle":
    "Une question sur une publication, une proposition de partenariat scientifique ou un accompagnement technique ? Écrivez-nous.",
  "contact.formTitle": "Formulaire de Contact",
  "contact.send": "Envoyer le Message",
  "contact.sending": "Envoi en cours...",

  // Footer
  "footer.mottoLabel": "Devise Officielle AOI Genius",
  "footer.mottoSub":
    "La plateforme collaborative d'innovation pour les esprits audacieux et les solutions à impact réel.",
  "footer.joinCta": "Rejoindre la Communauté",
  "footer.exploreCta": "Explorer les Projets",
  "footer.desc":
    "AOI Genius est une communauté internationale dédiée à la recherche appliquée, à l'ingénierie et au développement de réponses concrètes aux défis de société.",
  "footer.platform": "Plateforme",
  "footer.allPubs": "Toutes les publications",
  "footer.libraryLink": "Bibliothèque numérique",
  "footer.membersLink": "Annuaire des membres",
  "footer.newsLink": "Actualités & Concours",
  "footer.domains": "Domaines",
  "footer.energy": "Énergie Renouvelable",
  "footer.agri": "Agriculture & Agritech",
  "footer.health": "Santé & Biotechnologies",
  "footer.ai": "Intelligence Artificielle",
  "footer.robotics": "Robotique & IoT",
  "footer.trust": "Confiance & Vision",
  "footer.visionLink": "Notre Vision V2.0",
  "footer.aboutLink": "À propos d'AOI Genius",
  "footer.contactLink": "Nous contacter",
  "footer.security": "Sécurité & Intégrité",
  "footer.securityDesc":
    "HTTPS SSL chiffré, PostgreSQL & protection avancée contre les injections.",
  "footer.rights": "Tous droits réservés.",
  "footer.powered": "Propulsé par Next.js App Router & PostgreSQL Drizzle",

  // Shared
  "common.readMore": "Lire la suite",
  "common.by": "Par",
};

const en: Record<string, string> = {
  // Navbar
  "nav.tagline": "AOI GENIUS: Think Bold. Create Together. Transform the Future.",
  "nav.demoRole": "Demo Role:",
  "nav.visitor": "Visitor",
  "nav.member": "Member",
  "nav.admin": "Admin",
  "nav.home": "Home",
  "nav.publications": "Publications",
  "nav.library": "Library",
  "nav.members": "Members",
  "nav.news": "News",
  "nav.vision": "Our Vision",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.login": "Sign In",
  "nav.join": "Join Us",
  "nav.searchTitle": "Search AOI Genius innovations",
  "nav.searchPlaceholder": "Title, category, keyword, or author name...",
  "nav.searchFind": "Search",
  "nav.popular": "Popular searches:",
  "nav.subtitle": "Collaborative Innovation",

  // Hero
  "hero.badge": "AOI GENIUS V1.0 – Collaborative Innovation Web Platform",
  "hero.subtitle":
    "The reference community for researchers, engineers, developers and bold minds. Publish your work, discover high-impact innovations and collaborate to solve society's challenges.",
  "hero.ctaExplore": "Explore Innovations",
  "hero.ctaPublish": "Publish a Project",
  "hero.ctaLibrary": "PDF Library",
  "hero.statDomains": "Scientific Fields",
  "hero.statAccess": "Collaborative Access",
  "hero.statViews": "Project Views",
  "hero.statVersion": "Solid Foundation",

  // Home sections
  "home.catEyebrow": "Ecosystem & Fields",
  "home.catTitle": "Explore by Innovation Fields",
  "home.catAll": "See all categories",
  "home.pubCount": "publication",
  "home.featEyebrow": "Scientific Committee Selection",
  "home.featTitle": "Featured Innovations & Publications",
  "home.featAll": "All publications",
  "home.pillarEyebrow": "Methodology & Philosophy",
  "home.pillarTitle": "How We Turn Ideas into Impact",
  "home.pillarSub":
    "A collaborative approach built around our three fundamental guiding principles.",
  "home.p1Title": "Think Bold",
  "home.p1Desc":
    "Think beyond conventional frameworks. Dare to tackle the hardest problems with audacity, scientific rigor and creativity.",
  "home.p2Title": "Create Together",
  "home.p2Desc":
    "Collective intelligence surpasses isolated genius. We promote open sharing of protocols, prototypes and field feedback.",
  "home.p3Title": "Transform the Future",
  "home.p3Desc":
    "From theory to the field. Deploying sustainable solutions for energy access, resilient agriculture and health for all.",
  "home.newsEyebrow": "Community Life",
  "home.newsTitle": "News & Innovation Contests",
  "home.newsAll": "All news",
  "home.ctaTitle": "Ready to publish your innovation?",
  "home.ctaSub":
    "Join 500+ innovators and researchers. Give your projects the visibility and mentorship they deserve.",
  "home.ctaRegister": "Create a Member account",
  "home.ctaContact": "Contact the Team",

  // Publications page
  "pub.badge": "AOI Genius Innovation & Research Catalog",
  "pub.title": "Community Publications & Projects",
  "pub.subtitle":
    "Browse scientific articles, technical innovations, mechatronic prototypes and engineering reports developed by our members.",
  "pub.searchPlaceholder": "Search by keyword, title, author...",
  "pub.searchBtn": "Search",
  "pub.domain": "Field:",
  "pub.allDomains": "All fields",
  "pub.sortBy": "Sort by:",
  "pub.recent": "Most recent",
  "pub.popular": "Popularity (Likes)",
  "pub.views": "View count",
  "pub.empty": "No publication matches your criteria.",
  "pub.reset": "Reset filters",
  "pub.loading": "Loading publications...",

  // Library
  "lib.badge": "Digital Library of Innovations & Protocols",
  "lib.title": "Library of Works & Technical Documents",
  "lib.subtitle":
    "Browse and download research reports, mechatronic schematics and technical documentation validated by the AOI Genius scientific committee.",
  "lib.consult": "View",

  // Members
  "mem.badge": "AOI Genius Community Directory",
  "mem.title": "Member Innovators, Researchers & Engineers",
  "mem.subtitle":
    "Discover the public profiles of community members, their fields of expertise and their scientific contributions.",
  "mem.searchPlaceholder": "Search by name, city, country or specialty...",
  "mem.filter": "Filter",
  "mem.specialty": "Specialty:",
  "mem.loading": "Loading members...",

  // News
  "news.badge": "News & Official Announcements",
  "news.title": "AOI Genius Community News",
  "news.subtitle":
    "Stay informed about innovation contests, technology partnership signings and community events.",

  // About
  "about.badge": "Who are we?",
  "about.title": "Building the Future through Collaborative Innovation",
  "about.subtitle":
    "AOI Genius is an international community dedicated to scientific research, mechatronic engineering and the deployment of concrete technological solutions to societal challenges.",
  "about.mission": "Our Mission",
  "about.missionTitle": "Turning Scientific Knowledge into Direct Impact",

  // Vision
  "vision.badge": "Founding & Evolving Vision",
  "vision.title": "Our Vision: V1.0 and the Future of Innovation",
  "vision.subtitle":
    "AOI Genius V1.0 is the operational foundation. Discover how our community is building tomorrow's innovation ecosystem.",
  "vision.roadmapEyebrow": "Roadmap",
  "vision.roadmapTitle": "Future Platform Evolutions (V2.0+)",

  // Contact
  "contact.badge": "Support & Outreach",
  "contact.title": "Contact the AOI Genius Team",
  "contact.subtitle":
    "A question about a publication, a scientific partnership proposal, or technical guidance? Write to us.",
  "contact.formTitle": "Contact Form",
  "contact.send": "Send Message",
  "contact.sending": "Sending...",

  // Footer
  "footer.mottoLabel": "Official AOI Genius Motto",
  "footer.mottoSub":
    "The collaborative innovation platform for bold minds and real-world impact solutions.",
  "footer.joinCta": "Join the Community",
  "footer.exploreCta": "Explore Projects",
  "footer.desc":
    "AOI Genius is an international community dedicated to applied research, engineering and the development of concrete answers to societal challenges.",
  "footer.platform": "Platform",
  "footer.allPubs": "All publications",
  "footer.libraryLink": "Digital library",
  "footer.membersLink": "Member directory",
  "footer.newsLink": "News & Contests",
  "footer.domains": "Fields",
  "footer.energy": "Renewable Energy",
  "footer.agri": "Agriculture & Agritech",
  "footer.health": "Health & Biotech",
  "footer.ai": "Artificial Intelligence",
  "footer.robotics": "Robotics & IoT",
  "footer.trust": "Trust & Vision",
  "footer.visionLink": "Our V2.0 Vision",
  "footer.aboutLink": "About AOI Genius",
  "footer.contactLink": "Contact us",
  "footer.security": "Security & Integrity",
  "footer.securityDesc":
    "Encrypted HTTPS SSL, PostgreSQL & advanced injection protection.",
  "footer.rights": "All rights reserved.",
  "footer.powered": "Powered by Next.js App Router & PostgreSQL Drizzle",

  // Shared
  "common.readMore": "Read more",
  "common.by": "By",
};

const dictionaries: Record<Lang, Record<string, string>> = { fr, en };

export function getT(lang: Lang) {
  return (key: string): string => dictionaries[lang][key] ?? dictionaries.fr[key] ?? key;
}

export function parseLang(value: string | undefined | null): Lang {
  return value === "en" ? "en" : "fr";
}
