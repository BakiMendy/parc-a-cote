/*
  # Fix playground queries

  1. Changes
    - Add a function to get playgrounds with their equipment
    - Fix the relationship between playgrounds and playground_images
*/

-- Create a function to get equipment IDs for a playground
CREATE OR REPLACE FUNCTION get_playground_equipment_ids(playground_id UUID)
RETURNS TEXT[] AS $$
DECLARE
  equipment_ids TEXT[];
BEGIN
  SELECT array_agg(equipment_id) INTO equipment_ids
  FROM playground_equipments
  WHERE playground_id = $1;
  
  RETURN equipment_ids;
END;
$$ LANGUAGE plpgsql;

-- Update the RLS policies to ensure proper access
ALTER TABLE playground_images ENABLE ROW LEVEL SECURITY;

-- Make sure everyone can see approved playground images
DROP POLICY IF EXISTS "Tout le monde peut voir les images des parcs approuvés" ON playground_images;
CREATE POLICY "Tout le monde peut voir les images des parcs approuvés"
  ON playground_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM playgrounds
      WHERE playgrounds.id = playground_id
      AND playgrounds.status = 'approved'
    )
  );

-- Make sure everyone can see approved playgrounds
DROP POLICY IF EXISTS "Tout le monde peut voir les parcs approuvés" ON playgrounds;
CREATE POLICY "Tout le monde peut voir les parcs approuvés"
  ON playgrounds FOR SELECT
  USING (status = 'approved');