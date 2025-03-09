/*
  # Création des tables pour l'application Parc à côté

  1. New Tables
    - `profiles` - Profils utilisateurs avec rôles
    - `playgrounds` - Parcs de jeux
    - `playground_images` - Images des parcs
    - `playground_equipments` - Équipements des parcs
    - `comments` - Commentaires sur les parcs
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Création de la table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Création de la table des parcs
CREATE TABLE IF NOT EXISTS playgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  age_range TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  submitted_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Création de la table des images de parcs
CREATE TABLE IF NOT EXISTS playground_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playground_id UUID NOT NULL REFERENCES playgrounds(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Création de la table des équipements de parcs
CREATE TABLE IF NOT EXISTS playground_equipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playground_id UUID NOT NULL REFERENCES playgrounds(id) ON DELETE CASCADE,
  equipment_id TEXT NOT NULL
);

-- Création de la table des commentaires
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playground_id UUID NOT NULL REFERENCES playgrounds(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  author_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE playgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE playground_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE playground_equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Politiques pour profiles
CREATE POLICY "Les utilisateurs peuvent voir tous les profils"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Politiques pour playgrounds
CREATE POLICY "Tout le monde peut voir les parcs approuvés"
  ON playgrounds FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Les administrateurs peuvent voir tous les parcs"
  ON playgrounds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Les utilisateurs peuvent créer des parcs"
  ON playgrounds FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Les administrateurs peuvent mettre à jour les parcs"
  ON playgrounds FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Politiques pour playground_images
CREATE POLICY "Tout le monde peut voir les images des parcs approuvés"
  ON playground_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM playgrounds
      WHERE playgrounds.id = playground_id
      AND playgrounds.status = 'approved'
    )
  );

CREATE POLICY "Les administrateurs peuvent voir toutes les images"
  ON playground_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Les utilisateurs peuvent ajouter des images à leurs parcs"
  ON playground_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playgrounds
      WHERE playgrounds.id = playground_id
      AND playgrounds.submitted_by = auth.uid()
    )
  );

CREATE POLICY "Les administrateurs peuvent mettre à jour les images"
  ON playground_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Politiques pour playground_equipments
CREATE POLICY "Tout le monde peut voir les équipements des parcs"
  ON playground_equipments FOR SELECT
  USING (true);

CREATE POLICY "Les utilisateurs peuvent ajouter des équipements à leurs parcs"
  ON playground_equipments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playgrounds
      WHERE playgrounds.id = playground_id
      AND playgrounds.submitted_by = auth.uid()
    )
  );

-- Politiques pour comments
CREATE POLICY "Tout le monde peut voir les commentaires"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Les utilisateurs authentifiés peuvent ajouter des commentaires"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres commentaires"
  ON comments FOR UPDATE
  USING (auth.uid() = author_id);

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le timestamp updated_at
CREATE TRIGGER update_playgrounds_updated_at
BEFORE UPDATE ON playgrounds
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Créer un bucket de stockage pour les images
-- Note: Cette partie doit être exécutée manuellement dans l'interface Supabase
-- ou via l'API de gestion de Supabase, car SQL ne peut pas créer des buckets de stockage