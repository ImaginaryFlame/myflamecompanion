-- Schéma de base de données pour Companion Webnovel (PostgreSQL)

CREATE TABLE utilisateur (
    id SERIAL PRIMARY KEY,
    pseudo VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    avatar TEXT
);

CREATE TABLE histoire (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    auteur VARCHAR(100),
    source VARCHAR(50),
    url_source TEXT,
    date_publication TIMESTAMP,
    image_couverture TEXT
);

CREATE TABLE chapitre (
    id SERIAL PRIMARY KEY,
    histoire_id INTEGER REFERENCES histoire(id),
    titre VARCHAR(255),
    numero INTEGER,
    contenu TEXT,
    date_publication TIMESTAMP
);

CREATE TABLE progression (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER REFERENCES utilisateur(id),
    histoire_id INTEGER REFERENCES histoire(id),
    dernier_chapitre_lu INTEGER,
    date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE note (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER REFERENCES utilisateur(id),
    chapitre_id INTEGER REFERENCES chapitre(id),
    note INTEGER CHECK (note >= 1 AND note <= 10),
    commentaire TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER REFERENCES utilisateur(id),
    type VARCHAR(50),
    message TEXT,
    lu BOOLEAN DEFAULT FALSE,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 