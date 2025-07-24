-- CreateTable
CREATE TABLE "histoire" (
    "id" SERIAL NOT NULL,
    "titre" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "auteur" VARCHAR(100),
    "source" VARCHAR(50),
    "url_source" TEXT,
    "date_publication" TIMESTAMP(6),
    "image_couverture" TEXT,
    "urls_multiples" JSONB,

    CONSTRAINT "histoire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapitre" (
    "id" SERIAL NOT NULL,
    "histoire_id" INTEGER NOT NULL,
    "numero_chapitre" INTEGER NOT NULL,
    "titre_chapitre" VARCHAR(255),
    "contenu" TEXT,
    "date_publication" TIMESTAMP(6),
    "url_chapitre" TEXT,

    CONSTRAINT "chapitre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateur" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "mot_de_passe" VARCHAR(255) NOT NULL,
    "date_creation" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" VARCHAR(20) NOT NULL DEFAULT 'user',

    CONSTRAINT "utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progression" (
    "id" SERIAL NOT NULL,
    "utilisateur_id" INTEGER NOT NULL,
    "histoire_id" INTEGER NOT NULL,
    "chapitre_id" INTEGER,
    "chapitre_lu" INTEGER NOT NULL DEFAULT 0,
    "date_derniere_lecture" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" VARCHAR(20) NOT NULL DEFAULT 'en_cours',

    CONSTRAINT "progression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note" (
    "id" SERIAL NOT NULL,
    "utilisateur_id" INTEGER NOT NULL,
    "histoire_id" INTEGER NOT NULL,
    "chapitre_id" INTEGER,
    "contenu" TEXT NOT NULL,
    "date_creation" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "utilisateur_id" INTEGER NOT NULL,
    "titre" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_extra" JSONB,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chaine" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "channel_id" VARCHAR(100) NOT NULL,
    "nom_affichage" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "avatar_url" TEXT,
    "banniere_url" TEXT,
    "url_chaine" TEXT NOT NULL,
    "abonnes" INTEGER NOT NULL DEFAULT 0,
    "videos_total" INTEGER NOT NULL DEFAULT 0,
    "vues_total" BIGINT NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "derniere_maj" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_creation" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chaine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video" (
    "id" SERIAL NOT NULL,
    "chaine_id" INTEGER NOT NULL,
    "video_id" VARCHAR(100) NOT NULL,
    "titre" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "miniature_url" TEXT,
    "duree" INTEGER,
    "vues" BIGINT NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "commentaires" INTEGER NOT NULL DEFAULT 0,
    "date_publication" TIMESTAMP(6) NOT NULL,
    "date_creation" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tags" JSONB,
    "categorie" VARCHAR(50),
    "histoire_liee_id" INTEGER,

    CONSTRAINT "video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live" (
    "id" SERIAL NOT NULL,
    "chaine_id" INTEGER NOT NULL,
    "live_id" VARCHAR(100) NOT NULL,
    "titre" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "miniature_url" TEXT,
    "statut" VARCHAR(20) NOT NULL,
    "date_debut_prevue" TIMESTAMP(6),
    "date_debut_reelle" TIMESTAMP(6),
    "date_fin" TIMESTAMP(6),
    "spectateurs_max" INTEGER NOT NULL DEFAULT 0,
    "spectateurs_actuel" INTEGER NOT NULL DEFAULT 0,
    "url_live" TEXT,
    "histoire_liee_id" INTEGER,
    "date_creation" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planning" (
    "id" SERIAL NOT NULL,
    "chaine_id" INTEGER NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "titre" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "date_prevue" TIMESTAMP(6) NOT NULL,
    "statut" VARCHAR(20) NOT NULL DEFAULT 'programme',
    "histoire_liee_id" INTEGER,
    "tags" JSONB,
    "date_creation" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "planning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote" (
    "id" SERIAL NOT NULL,
    "live_id" INTEGER NOT NULL,
    "utilisateur_id" INTEGER NOT NULL,
    "question" VARCHAR(255) NOT NULL,
    "options" JSONB NOT NULL,
    "votes_resultats" JSONB NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "date_creation" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_fin" TIMESTAMP(6),

    CONSTRAINT "vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abonnement" (
    "id" SERIAL NOT NULL,
    "utilisateur_id" INTEGER NOT NULL,
    "chaine_id" INTEGER NOT NULL,
    "notifications_video" BOOLEAN NOT NULL DEFAULT true,
    "notifications_live" BOOLEAN NOT NULL DEFAULT true,
    "date_abonnement" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abonnement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_email_key" ON "utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "progression_utilisateur_id_histoire_id_key" ON "progression"("utilisateur_id", "histoire_id");

-- CreateIndex
CREATE UNIQUE INDEX "chaine_channel_id_key" ON "chaine"("channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "video_video_id_key" ON "video"("video_id");

-- CreateIndex
CREATE UNIQUE INDEX "live_live_id_key" ON "live"("live_id");

-- CreateIndex
CREATE UNIQUE INDEX "abonnement_utilisateur_id_chaine_id_key" ON "abonnement"("utilisateur_id", "chaine_id");

-- AddForeignKey
ALTER TABLE "chapitre" ADD CONSTRAINT "chapitre_histoire_id_fkey" FOREIGN KEY ("histoire_id") REFERENCES "histoire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progression" ADD CONSTRAINT "progression_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progression" ADD CONSTRAINT "progression_histoire_id_fkey" FOREIGN KEY ("histoire_id") REFERENCES "histoire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progression" ADD CONSTRAINT "progression_chapitre_id_fkey" FOREIGN KEY ("chapitre_id") REFERENCES "chapitre"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video" ADD CONSTRAINT "video_chaine_id_fkey" FOREIGN KEY ("chaine_id") REFERENCES "chaine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live" ADD CONSTRAINT "live_chaine_id_fkey" FOREIGN KEY ("chaine_id") REFERENCES "chaine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planning" ADD CONSTRAINT "planning_chaine_id_fkey" FOREIGN KEY ("chaine_id") REFERENCES "chaine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote" ADD CONSTRAINT "vote_live_id_fkey" FOREIGN KEY ("live_id") REFERENCES "live"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote" ADD CONSTRAINT "vote_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnement" ADD CONSTRAINT "abonnement_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnement" ADD CONSTRAINT "abonnement_chaine_id_fkey" FOREIGN KEY ("chaine_id") REFERENCES "chaine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
