import { pool } from "@/db";

export async function ensureDbInitialized() {
  const client = await pool.connect();
  try {
    // 1. Create tables if not exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'member' NOT NULL,
        photo TEXT,
        country TEXT DEFAULT 'Bénin',
        city TEXT DEFAULT 'Cotonou',
        profession TEXT DEFAULT 'Ingénieur & Chercheur',
        expertise_domain TEXT DEFAULT 'Intelligence Artificielle',
        bio TEXT,
        whatsapp TEXT,
        social_facebook TEXT,
        social_linkedin TEXT,
        social_twitter TEXT,
        social_github TEXT,
        is_email_verified BOOLEAN DEFAULT true NOT NULL,
        is_active BOOLEAN DEFAULT true NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        icon TEXT DEFAULT 'Layers',
        color TEXT DEFAULT 'blue',
        is_active BOOLEAN DEFAULT true NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS publications (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        type TEXT DEFAULT 'project' NOT NULL,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        author_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        cover_image TEXT,
        gallery_images TEXT,
        pdf_url TEXT,
        status TEXT DEFAULT 'approved' NOT NULL,
        rejection_reason TEXT,
        views_count INTEGER DEFAULT 0 NOT NULL,
        likes_count INTEGER DEFAULT 0 NOT NULL,
        downloads_count INTEGER DEFAULT 0 NOT NULL,
        is_featured BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        publication_id INTEGER REFERENCES publications(id) ON DELETE CASCADE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        publication_id INTEGER REFERENCES publications(id) ON DELETE CASCADE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(publication_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        cover_image TEXT,
        tag TEXT DEFAULT 'Annonce' NOT NULL,
        author_name TEXT DEFAULT 'AOI Genius HQ' NOT NULL,
        published_at TIMESTAMP DEFAULT NOW() NOT NULL,
        is_published BOOLEAN DEFAULT true NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        link TEXT,
        type TEXT DEFAULT 'info' NOT NULL,
        is_read BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      ALTER TABLE publications ADD COLUMN IF NOT EXISTS video_url TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_status TEXT DEFAULT 'approved';
    `);

    // Les administrateurs sont toujours approuvés
    await client.query(`
      UPDATE users SET membership_status = 'approved' WHERE role = 'admin' AND membership_status IS DISTINCT FROM 'approved';
    `);

    // Attach demo videos to existing seeded publications (idempotent)
    await client.query(`
      UPDATE publications SET video_url = 'https://www.w3schools.com/html/mov_bbb.mp4'
      WHERE slug = 'roboplant-v2-robot-autonome' AND (video_url IS NULL OR video_url = '');
      UPDATE publications SET video_url = 'https://www.w3schools.com/html/mov_bbb.mp4'
      WHERE slug = 'micro-reseau-solaire-modulaire' AND (video_url IS NULL OR video_url = '');
      UPDATE publications SET video_url = 'https://www.w3schools.com/html/mov_bbb.mp4'
      WHERE slug = 'agripulse-ai-irrigation-intelligente' AND (video_url IS NULL OR video_url = '');
    `);

    // 2. Check if users are seeded
    const usersCountRes = await client.query("SELECT COUNT(*) FROM users");
    const count = parseInt(usersCountRes.rows[0].count, 10);

    // Always ensure Admin account exists (Restores it if deleted)
    const adminCheck = await client.query("SELECT id FROM users WHERE role = 'admin' OR email = 'Kindeivson@gmail.com'");
    if (adminCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO users (email, password_hash, name, role, photo, country, city, profession, expertise_domain, bio, whatsapp, social_linkedin, is_email_verified)
        VALUES (
          'Kindeivson@gmail.com',
          'YelectroK@5736.',
          'Codjo Ivson Oméra KINDE',
          'admin',
          'https://media.licdn.com/dms/image/v2/D4E03AQGVLesdyscftg/profile-displayphoto-crop_800_800/B4EZyHj56yIQAI-/0/1771800865941?e=1786579200&v=beta&t=CKeVzltqozaHGOsSUWTZ-CQeDiS057vEi9wxpX5rTG8',
          'Bénin',
          'Cotonou',
          'Fondateur & Directeur Général AOI Genius',
          'Energie et Environnement',
          'Électrotechnicien, Énergéticien et fondateur d''AOI Genius avec plus de 2 ans d''expérience.',
          '+229 01 57 363 198',
          'https://www.linkedin.com/in/ivson-kinde-b271a8377',
          true
        ) ON CONFLICT (email) DO UPDATE SET role = 'admin';
      `);
    } else {
      // Update existing admin to latest info
      await client.query(`
        UPDATE users
        SET 
          email = 'Kindeivson@gmail.com',
          password_hash = 'YelectroK@5736.',
          name = 'Codjo Ivson Oméra KINDE',
          role = 'admin',
          photo = 'https://media.licdn.com/dms/image/v2/D4E03AQGVLesdyscftg/profile-displayphoto-crop_800_800/B4EZyHj56yIQAI-/0/1771800865941?e=1786579200&v=beta&t=CKeVzltqozaHGOsSUWTZ-CQeDiS057vEi9wxpX5rTG8',
          country = 'Bénin',
          city = 'Cotonou',
          profession = 'Fondateur & Directeur Général AOI Genius',
          expertise_domain = 'Energie et Environnement',
          bio = 'Électrotechnicien, Énergéticien et fondateur d''AOI Genius avec plus de 2 ans d''expérience.',
          whatsapp = '+229 01 57 363 198',
          social_linkedin = 'https://www.linkedin.com/in/ivson-kinde-b271a8377'
        WHERE email = 'Kindeivson@gmail.com' OR id = ${adminCheck.rows[0].id};
      `);
    }

    if (count === 0) {
      // Seed users
      await client.query(`
        INSERT INTO users (email, password_hash, name, role, photo, country, city, profession, expertise_domain, bio, whatsapp, social_facebook, social_linkedin, social_twitter, social_github, is_email_verified)
        VALUES
        (
          'Kindeivson@gmail.com',
          'YelectroK@5736.',
          'Codjo Ivson Oméra KINDE',
          'admin',
          'https://media.licdn.com/dms/image/v2/D4E03AQGVLesdyscftg/profile-displayphoto-crop_800_800/B4EZyHj56yIQAI-/0/1771800865941?e=1786579200&v=beta&t=CKeVzltqozaHGOsSUWTZ-CQeDiS057vEi9wxpX5rTG8',
          'Bénin',
          'Cotonou',
          'Fondateur & Directeur Général AOI Genius',
          'Energie et Environnement',
          'Électrotechnicien, Énergéticien et fondateur d''AOI Genius avec plus de 2 ans d''expérience.',
          '+229 01 57 363 198',
          'https://facebook.com/ivsonkinde',
          'https://www.linkedin.com/in/ivson-kinde-b271a8377',
          'https://x.com/ivsonkinde',
          'https://github.com/aoigenius',
          true
        ),
        (
          'koffi.mensah@aoigenius.org',
          'member123',
          'Koffi Mensah',
          'member',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          'Bénin',
          'Cotonou',
          'Ingénieur Systèmes Embarqués & Robotique',
          'Robotique',
          'Innovateur passionné par les systèmes mécatroniques autonomes adaptés aux défis du climat tropical et de l’agriculture de précision.',
          '+229 97 00 22 33',
          'https://facebook.com/koffi.mensah',
          'https://linkedin.com/in/koffi-mensah',
          'https://x.com/koffimensah',
          'https://github.com/koffimensah',
          true
        ),
        (
          'fatima.boubker@aoigenius.org',
          'member123',
          'Dr. Fatima Zahra Boubker',
          'member',
          'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
          'Maroc',
          'Casablanca',
          'Chercheuse en Biotech & Santé Numérique',
          'Santé',
          'Bio-ingénieure développant des solutions de diagnostic clinique portatif à bas coût pour les centres de santé décentralisés.',
          '+212 66 11 22 33',
          'https://facebook.com/fatima.boubker',
          'https://linkedin.com/in/fatima-boubker',
          'https://x.com/fatimaboubker',
          'https://github.com/fatimaboubker',
          true
        ),
        (
          'jeanluc.kabore@aoigenius.org',
          'member123',
          'Jean-Luc Kaboré',
          'member',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          'Burkina Faso',
          'Ouagadougou',
          'Ingénieur en Énergies Renouvelables',
          'Énergie',
          'Concepteur de micro-centrales hybrides solaires-batteries à gestion intelligente par onduleurs open-hardware.',
          '+226 70 88 99 00',
          'https://facebook.com/jeanluc.kabore',
          'https://linkedin.com/in/jeanluc-kabore',
          'https://x.com/jeanluckabore',
          'https://github.com/jeanluckabore',
          true
        );
      `);

      // Seed categories
      await client.query(`
        INSERT INTO categories (name, slug, description, icon, color)
        VALUES
        ('Énergie', 'energie', 'Solutions solaires, micro-réseaux, biogaz et efficacité énergétique durable.', 'Zap', 'amber'),
        ('Agriculture', 'agriculture', 'Agritech, irrigation intelligente, drones et optimisation des rendements.', 'Sprout', 'emerald'),
        ('Santé', 'sante', 'Biotechnologies, diagnostic mobile, e-santé et dispositifs biomédicaux.', 'HeartPulse', 'rose'),
        ('Environnement', 'environnement', 'Économie circulaire, gestion de l’eau, recyclage et surveillance écologique.', 'Leaf', 'teal'),
        ('Informatique', 'informatique', 'Architectures logicielles, cybersécurité, cloud et systèmes distribués.', 'Laptop', 'blue'),
        ('Intelligence Artificielle', 'intelligence-artificielle', 'Deep Learning, vision par ordinateur, LLM et modélisation prédictive.', 'BrainCircuit', 'purple'),
        ('Robotique', 'robotique', 'Mécatronique, systèmes autonomes, capteurs IoT et véhicules sans pilote.', 'Bot', 'cyan'),
        ('Éducation', 'education', 'EdTech, laboratoires virtuels et plateformes d’apprentissage immersif.', 'GraduationCap', 'indigo'),
        ('Entrepreneuriat', 'entrepreneuriat', 'Incubation de startups deeptech, modèles économiques et mise à l’échelle.', 'Rocket', 'orange'),
        ('Autres', 'autres', 'Innovations transversales, sciences des matériaux et projets pluridisciplinaires.', 'Layers', 'slate')
        ON CONFLICT (slug) DO NOTHING;
      `);

      // Seed publications
      await client.query(`
        INSERT INTO publications (title, slug, type, summary, content, category_id, author_id, cover_image, gallery_images, pdf_url, status, views_count, likes_count, downloads_count, is_featured)
        VALUES
        (
          'AgriPulse AI : Système d''Irrigation Intelligent par Détection Hydrique et IoT',
          'agripulse-ai-irrigation-intelligente',
          'innovation',
          'Un dispositif combinant capteurs d''humidité sous-terrains LoRaWAN et algorithmes d''IA pour réduire de 45% la consommation d''eau agricole.',
          '### Contexte & Problématique\nL''agriculture fait face à des stress hydriques de plus en plus prononcés. Les méthodes d''irrigation classiques gaspillent jusqu''à 60% d''eau douce par évaporation ou sur-arrosage.\n\n### Solution Technique Innovante\nAgriPulse AI déploie un réseau maillé de sondes capacitives reliées en LoRaWAN. Un microcontrôleur basse consommation transmet les relevés hygrométriques, thermiques et de salinité du sol à un nœud central doté d''un modèle prédictif d''évapotranspiration.\n\n### Résultats Validés sur le Terrain\n- Réduction de 45% des volumes d''eau utilisés.\n- Augmentation des rendements de maïs et de maraîchage de 22%.\n- Autonomie énergétique 100% solaire pendant plus de 3 ans.',
          2,
          2,
          'https://images.pexels.com/photos/3912520/pexels-photo-3912520.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
          '["https://images.pexels.com/photos/3912520/pexels-photo-3912520.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", "https://images.pexels.com/photos/37384690/pexels-photo-37384690.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"]',
          'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          'approved',
          420,
          86,
          54,
          true
        ),
        (
          'Micro-Réseau Solaire Modulaire Haute Efficacité pour Zones Isolées',
          'micro-reseau-solaire-modulaire',
          'project',
          'Architecture de micro-grid décentralisée avec gestion dynamique de charge et monitoring temps-réel open source.',
          '### Présentation du Projet\nCe projet vise à fournir une électricité fiable, propre et abordable aux centres ruraux isolés du réseau national.\n\n### Architecture Matérielle & Logiciellle\nLe micro-réseau intègre des panneaux solaires monocristallins couplés à des packs de batteries Lithium-Fer-Phosphate (LiFePO4). Un système BMS (Battery Management System) intelligent développé par notre équipe équilibre dynamiquement les cellules et prévient l''usure prématurée.\n\n### Impact Économique et Social\nAlimentation continue de 3 dispensaires médicaux et d''une école primaire, avec un coût d''exploitation divisé par 4 par rapport aux générateurs diesel.',
          1,
          4,
          'https://images.pexels.com/photos/35105471/pexels-photo-35105471.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
          '["https://images.pexels.com/photos/35105471/pexels-photo-35105471.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", "https://images.pexels.com/photos/9893727/pexels-photo-9893727.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"]',
          'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          'approved',
          315,
          64,
          39,
          true
        ),
        (
          'NeuroScan Mobile : Diagnostic Rapide des Pathologies Respiratoires par IA',
          'neuroscan-mobile-diagnostic-ia',
          'technical_report',
          'Rapport technique d''évaluation clinique d''un stéthoscope numérique intelligent couplé à un modèle de Deep Learning audio embarqué.',
          '### Résumé Exécutif\nCe rapport technique détaille l''architecture et les résultats des essais cliniques de NeuroScan Mobile. Le système analyse les sons pulmonaires captés par un stéthoscope piézoélectrique Bluetooth.\n\n### Méthodologie & Réseau de Neurones\nLe modèle utilise un réseau de neurones convolutif 2D (MobileNetV3 adapté) appliqué aux spectrogrammes Mel des enregistrements audio respiratoires. Il détecte les crépitants et sifflements avec une sensibilité de 94.2% et une spécificité de 91.8%.\n\n### Faisabilité Déploiement\nL''application fonctionne hors-ligne sur n''importe quel smartphone Android d''entrée de gamme.',
          3,
          3,
          'https://images.pexels.com/photos/8386358/pexels-photo-8386358.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
          '["https://images.pexels.com/photos/8386358/pexels-photo-8386358.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"]',
          'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          'approved',
          560,
          112,
          95,
          true
        ),
        (
          'RoboPlant V2 : Robot Autonome de Semis et Désherbage Mécanique',
          'roboplant-v2-robot-autonome',
          'innovation',
          'Robot mobile tout-terrain fonctionnant à l''énergie solaire avec navigation GNSS RTK et reconnaissance visuelle des adventices.',
          '### Conception Mécatronique\nRoboPlant V2 est propulsé par quatre moteurs brushless indépendants alimentés par un toit solaire photovoltaïque de 180W. Il navigue avec une précision centimétrique grâce au positionnement RTK.\n\n### Vision par Ordinateur & Actionneurs\nUne caméra haute cadence identifie les mauvaises herbes en temps réel et actionne un micro-outil mécanique de sarclage sans aucun recours aux produits phytosanitaires chimiques.',
          7,
          2,
          'https://images.pexels.com/photos/16544936/pexels-photo-16544936.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
          '["https://images.pexels.com/photos/16544936/pexels-photo-16544936.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", "https://images.pexels.com/photos/29320998/pexels-photo-29320998.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"]',
          'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          'approved',
          280,
          58,
          31,
          false
        ),
        (
          'AfriLang LLM : Modèle de Langue IA pour les Langues Africaines Locales',
          'afrilang-llm-langues-africaines',
          'article',
          'Article de recherche sur l''adaptation des grands modèles de langage aux langues fon, yoruba, wolof et bambara.',
          '### Introduction & Vision\nLa souveraineté numérique africaine passe par l''inclusion linguistique dans les technologies d''intelligence artificielle de pointe.\n\n### Corpus & Entraînement\nAfriLang LLM a été entraîné sur un corpus diversifié de 1.2 milliard de tokens réunissant littérature orale transcrite, textes administratifs et données éducatives.\n\n### Perspectives\nIntégration prochaine dans les services publics et assistants vocaux pour l''inclusion des populations non-lettrées.',
          6,
          1,
          'https://images.pexels.com/photos/28146795/pexels-photo-28146795.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
          '["https://images.pexels.com/photos/28146795/pexels-photo-28146795.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"]',
          'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          'approved',
          670,
          145,
          88,
          true
        ),
        (
          'AquaClean IoT : Station de Purification d''Eau Solaire Connectée',
          'aquaclean-iot-station-eau-solaire',
          'project',
          'Système compact de filtration membranaire et désinfection UV alimenté par panneau solaire avec télémétrie de la qualité de l''eau.',
          '### Objectif du Projet\nPermettre un accès autonome et vérifié à une eau 100% potable dans les zones périurbaines et rurales.',
          4,
          4,
          'https://images.pexels.com/photos/15751131/pexels-photo-15751131.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
          '["https://images.pexels.com/photos/15751131/pexels-photo-15751131.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"]',
          'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          'pending',
          89,
          14,
          6,
          false
        );
      `);

      // Seed News
      await client.query(`
        INSERT INTO news (title, slug, summary, content, cover_image, tag, author_name)
        VALUES
        (
          'Lancement Officiel de la Plateforme AOI Genius V1.0',
          'lancement-officiel-aoi-genius-v1',
          'La communauté AOI Genius ouvre officiellement sa plateforme web collaborative pour fédérer chercheurs, inventeurs et étudiants.',
          'Aujourd''hui marque une étape historique pour l''écosystème d''innovation technologique. Avec le lancement de la version 1.0 d''AOI Genius, les membres peuvent désormais partager leurs projets, publier leurs rapports techniques et collaborer avec une communauté engagée.',
          'https://images.pexels.com/photos/16544931/pexels-photo-16544931.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
          'Plateforme',
          'Direction AOI Genius'
        ),
        (
          'Appel à Projets : Grand Prix de l''Innovation Technologique Durable 2026',
          'grand-prix-innovation-durable-2026',
          'Soumettez vos innovations dans les domaines de l''énergie, de l''agriculture et de la santé pour remporter un accompagnement et un financement.',
          'Le comité scientifique d''AOI Genius annonce l''ouverture des candidatures pour le Grand Prix 2026. Plus de 10 millions de FCFA de bourses et un mentorat industriel de 12 mois seront décernés aux trois meilleurs projets.',
          'https://images.pexels.com/photos/29320998/pexels-photo-29320998.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
          'Concours',
          'Comité Scientifique'
        ),
        (
          'Signature d''un Partenariat Stratégique avec 5 Hubs Technologiques',
          'partenariat-strategique-hubs-technologiques',
          'AOI Genius étend son réseau de prototypage rapide et de laboratoires partagés à travers plusieurs métropoles africaines.',
          'Ce partenariat permettra à tous les membres certifiés d''AOI Genius d''accéder gratuitement à des imprimantes 3D industrielles, des oscilloscopes haute précision et des bancs de test électroniques.',
          'https://images.pexels.com/photos/34207369/pexels-photo-34207369.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
          'Partenariat',
          'Bureau Exécutif'
        );
      `);

      // Seed Comments
      await client.query(`
        INSERT INTO comments (publication_id, user_id, content)
        VALUES
        (1, 1, 'Excellente approche sur le protocole LoRaWAN. Avez-vous testé la résistance des sondes en sol argileux humide ?'),
        (1, 3, 'Bravo Koffi ! Cette solution répond exactement aux enjeux des maraîchers de la vallée de l''Ouémé.'),
        (2, 2, 'La gestion dynamique BMS par onduleur est particulièrement ingénieuse. Félicitations pour ce déploiement.');
      `);

      // Seed Likes
      await client.query(`
        INSERT INTO likes (publication_id, user_id)
        VALUES
        (1, 1),
        (1, 3),
        (2, 1),
        (3, 2),
        (5, 1)
        ON CONFLICT DO NOTHING;
      `);

      // Seed Notifications
      await client.query(`
        INSERT INTO notifications (user_id, title, message, link, type)
        VALUES
        (2, 'Publication validée !', 'Votre innovation "AgriPulse AI" a été validée par le directeur général.', '/publications/1', 'success'),
        (2, 'Nouveau commentaire', 'Codjo Ivson Oméra KINDE a commenté votre publication "AgriPulse AI".', '/publications/1', 'info'),
        (1, 'Publication en attente', 'Une nouvelle publication "AquaClean IoT" attend votre modération.', '/admin', 'action');
      `);
    }
  } catch (err) {
    console.error("Error during DB initialization:", err);
  } finally {
    client.release();
  }
}
