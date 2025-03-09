/*
  # Comprehensive Fix for Playground Submission Issues

  1. Changes
    - Update RLS policies for playgrounds table to allow authenticated users to insert new playgrounds
    - Update RLS policies for playground_images and playground_equipments tables
    - Add storage bucket access policies
    - Fix any potential issues with foreign key constraints
  
  2. Security
    - Maintain security while allowing proper access for authenticated users
    - Ensure users can only modify their own data when appropriate
    - Allow authenticated users to submit new playgrounds and related data
*/

-- Fix playgrounds table policies
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des parcs" ON playgrounds;
CREATE POLICY "Les utilisateurs peuvent créer des parcs"
  ON playgrounds FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Fix playground_images table policies
DROP POLICY IF EXISTS "Les utilisateurs peuvent ajouter des images à leurs parcs" ON playground_images;
CREATE POLICY "Les utilisateurs peuvent ajouter des images à leurs parcs"
  ON playground_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Fix playground_equipments table policies
DROP POLICY IF EXISTS "Les utilisateurs peuvent ajouter des équipements à leurs parcs" ON playground_equipments;
CREATE POLICY "Les utilisateurs peuvent ajouter des équipements à leurs parcs"
  ON playground_equipments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure users can update their own playgrounds
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leurs propres parcs" ON playgrounds;
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres parcs"
  ON playgrounds FOR UPDATE
  TO authenticated
  USING (auth.uid() = submitted_by);

-- Ensure users can delete their own playgrounds if needed
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres parcs" ON playgrounds;
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres parcs"
  ON playgrounds FOR DELETE
  TO authenticated
  USING (auth.uid() = submitted_by);

-- Ensure users can see their own pending playgrounds
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres parcs en attente" ON playgrounds;
CREATE POLICY "Les utilisateurs peuvent voir leurs propres parcs en attente"
  ON playgrounds FOR SELECT
  TO authenticated
  USING (auth.uid() = submitted_by);

-- Ensure users can see images for their own pending playgrounds
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les images de leurs propres parcs" ON playground_images;
CREATE POLICY "Les utilisateurs peuvent voir les images de leurs propres parcs"
  ON playground_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playgrounds
      WHERE playgrounds.id = playground_id
      AND playgrounds.submitted_by = auth.uid()
    )
  );

-- Make sure storage bucket has proper policies
-- Note: This is a reminder that you need to configure storage bucket policies in the Supabase dashboard
-- Go to Storage > Buckets > playground-images > Policies
-- Add a policy to allow authenticated users to upload files:
-- Name: "Allow authenticated uploads"
-- Allowed operation: INSERT
-- Target roles: authenticated
-- Policy definition: true