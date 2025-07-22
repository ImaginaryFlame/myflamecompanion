-- Script pour ajouter des données de test

-- Ajouter des utilisateurs de test
INSERT INTO utilisateur (pseudo, email, mot_de_passe) VALUES 
('TestUser1', 'user1@test.com', 'password123'),
('TestUser2', 'user2@test.com', 'password456');

-- Ajouter des histoires de test
INSERT INTO histoire (titre, description, auteur, source, url_source) VALUES 
('Histoire Fantastique', 'Une aventure épique dans un monde magique', 'Auteur Mystère', 'Wattpad', 'https://wattpad.com/story/123'),
('Romance Moderne', 'Une histoire d''amour contemporaine', 'Écrivain Romantique', 'Webnovel', 'https://webnovel.com/story/456'),
('Science-Fiction', 'Voyage dans l''espace et le temps', 'Futuriste', 'Yume-Arts', 'https://yume-arts.com/story/789');

-- Ajouter des chapitres de test
INSERT INTO chapitre (histoire_id, titre, numero) VALUES 
(1, 'Le Début de l''Aventure', 1),
(1, 'La Découverte du Pouvoir', 2),
(1, 'Le Premier Combat', 3),
(2, 'Première Rencontre', 1),
(2, 'Le Malentendu', 2),
(3, 'Décollage vers Mars', 1);

-- Ajouter de la progression de test
INSERT INTO progression (utilisateur_id, histoire_id, dernier_chapitre_lu) VALUES 
(1, 1, 2),
(1, 2, 1),
(2, 1, 3),
(2, 3, 1);

-- Ajouter des notes de test
INSERT INTO note (utilisateur_id, chapitre_id, note, commentaire) VALUES 
(1, 1, 8, 'Très bon début, j''ai hâte de lire la suite !'),
(1, 2, 9, 'Le développement du personnage est excellent'),
(2, 1, 7, 'Bien écrit mais un peu lent au début'); 