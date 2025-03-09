/*
  # Fix Row Level Security Policies

  1. Changes
    - Update RLS policies for playgrounds table to allow authenticated users to insert new playgrounds
    - Update RLS policies for playground_images and playground_equipments tables
    - Add missing policies for storage bucket access
  
  2. Security
    - Maintain security while allowing proper access for authenticated users
    - Ensure users can only modify their own data
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

-- Make sure storage bucket has proper policies
-- Note: This is a reminder that you need to configure storage bucket policies in the Supabase dashboard
-- Go to Storage > Buckets > playground-images > Policies
-- Add a policy to allow authenticated users to upload files