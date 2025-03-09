/*
  # Fix playground images relationship

  1. Changes
    - Add a migration to ensure the relationship between playgrounds and playground_images is correctly established
    - Fix any potential issues with the foreign key constraints
*/

-- Ensure the playground_images table has the correct foreign key constraint
ALTER TABLE IF EXISTS playground_images
  DROP CONSTRAINT IF EXISTS playground_images_playground_id_fkey,
  ADD CONSTRAINT playground_images_playground_id_fkey
  FOREIGN KEY (playground_id)
  REFERENCES playgrounds(id)
  ON DELETE CASCADE;

-- Ensure the playground_equipments table has the correct foreign key constraint
ALTER TABLE IF EXISTS playground_equipments
  DROP CONSTRAINT IF EXISTS playground_equipments_playground_id_fkey,
  ADD CONSTRAINT playground_equipments_playground_id_fkey
  FOREIGN KEY (playground_id)
  REFERENCES playgrounds(id)
  ON DELETE CASCADE;

-- Ensure the comments table has the correct foreign key constraint
ALTER TABLE IF EXISTS comments
  DROP CONSTRAINT IF EXISTS comments_playground_id_fkey,
  ADD CONSTRAINT comments_playground_id_fkey
  FOREIGN KEY (playground_id)
  REFERENCES playgrounds(id)
  ON DELETE CASCADE;

-- Add a reminder to create the storage bucket
COMMENT ON TABLE playground_images IS 'Remember to create the playground-images bucket in Supabase Storage';