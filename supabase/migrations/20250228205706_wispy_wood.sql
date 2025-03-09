/*
  # Add sample approved playgrounds

  1. New Data
    - Add sample playgrounds with approved status
    - Add sample playground images
*/

-- Insert sample playgrounds if they don't exist
DO $$
BEGIN
  -- Only insert if there are no approved playgrounds
  IF NOT EXISTS (SELECT 1 FROM playgrounds WHERE status = 'approved') THEN
    -- Parc 1: Lyon
    INSERT INTO playgrounds (
      name, description, address, city, postal_code, 
      latitude, longitude, age_range, status, created_at, updated_at, submitted_by
    ) VALUES (
      'Parc de la Tête d''Or', 
      'Grand parc avec plusieurs aires de jeux pour enfants de tous âges. Comprend des balançoires, toboggans, structures d''escalade et bac à sable.',
      'Place Général Leclerc', 'Lyon', '69006',
      45.7741, 4.8553, '2-12 ans', 'approved', now(), now(),
      (SELECT id FROM auth.users LIMIT 1)
    );
    
    -- Parc 2: Lyon
    INSERT INTO playgrounds (
      name, description, address, city, postal_code, 
      latitude, longitude, age_range, status, created_at, updated_at, submitted_by
    ) VALUES (
      'Parc Blandan', 
      'Aire de jeux moderne avec structures en bois et métal. Idéal pour les enfants de 3 à 10 ans.',
      'Rue du Repos', 'Lyon', '69007',
      45.7456, 4.8563, '3-10 ans', 'approved', now(), now(),
      (SELECT id FROM auth.users LIMIT 1)
    );
    
    -- Parc 3: Villeurbanne
    INSERT INTO playgrounds (
      name, description, address, city, postal_code, 
      latitude, longitude, age_range, status, created_at, updated_at, submitted_by
    ) VALUES (
      'Parc de la Feyssine', 
      'Aire de jeux naturelle au bord du Rhône. Structures en bois et cordes, parfait pour les aventuriers.',
      'Chemin de la Feyssine', 'Villeurbanne', '69100',
      45.7842, 4.8813, '4-12 ans', 'approved', now(), now(),
      (SELECT id FROM auth.users LIMIT 1)
    );
    
    -- Parc 4: Caluire
    INSERT INTO playgrounds (
      name, description, address, city, postal_code, 
      latitude, longitude, age_range, status, created_at, updated_at, submitted_by
    ) VALUES (
      'Parc Saint-Clair', 
      'Petit parc ombragé avec aire de jeux sécurisée pour les tout-petits. Balançoires et petit toboggan.',
      'Quai Clemenceau', 'Caluire-et-Cuire', '69300',
      45.7892, 4.8436, '1-6 ans', 'approved', now(), now(),
      (SELECT id FROM auth.users LIMIT 1)
    );
    
    -- Parc 5: Vaulx-en-Velin
    INSERT INTO playgrounds (
      name, description, address, city, postal_code, 
      latitude, longitude, age_range, status, created_at, updated_at, submitted_by
    ) VALUES (
      'Parc du Grand Large', 
      'Grande aire de jeux avec vue sur le lac. Structures modernes et sol souple pour la sécurité.',
      'Avenue des Canuts', 'Vaulx-en-Velin', '69120',
      45.7778, 4.9319, '2-14 ans', 'approved', now(), now(),
      (SELECT id FROM auth.users LIMIT 1)
    );
    
    -- Add images for each playground
    INSERT INTO playground_images (playground_id, url, name, status)
    VALUES 
      ((SELECT id FROM playgrounds WHERE name = 'Parc de la Tête d''Or'), 
       'https://source.unsplash.com/random/800x600/?playground,park&sig=1', 'Vue générale', 'approved'),
      ((SELECT id FROM playgrounds WHERE name = 'Parc de la Tête d''Or'), 
       'https://source.unsplash.com/random/800x600/?playground,children&sig=2', 'Aire de jeux principale', 'approved'),
      
      ((SELECT id FROM playgrounds WHERE name = 'Parc Blandan'), 
       'https://source.unsplash.com/random/800x600/?playground,slide&sig=3', 'Toboggans', 'approved'),
      ((SELECT id FROM playgrounds WHERE name = 'Parc Blandan'), 
       'https://source.unsplash.com/random/800x600/?playground,climbing&sig=4', 'Structure d''escalade', 'approved'),
      
      ((SELECT id FROM playgrounds WHERE name = 'Parc de la Feyssine'), 
       'https://source.unsplash.com/random/800x600/?playground,nature&sig=5', 'Vue d''ensemble', 'approved'),
      ((SELECT id FROM playgrounds WHERE name = 'Parc de la Feyssine'), 
       'https://source.unsplash.com/random/800x600/?playground,rope&sig=6', 'Jeux de cordes', 'approved'),
      
      ((SELECT id FROM playgrounds WHERE name = 'Parc Saint-Clair'), 
       'https://source.unsplash.com/random/800x600/?playground,toddler&sig=7', 'Aire pour tout-petits', 'approved'),
      
      ((SELECT id FROM playgrounds WHERE name = 'Parc du Grand Large'), 
       'https://source.unsplash.com/random/800x600/?playground,lake&sig=8', 'Vue sur le lac', 'approved'),
      ((SELECT id FROM playgrounds WHERE name = 'Parc du Grand Large'), 
       'https://source.unsplash.com/random/800x600/?playground,modern&sig=9', 'Structures modernes', 'approved');
      
    -- Add some features/equipment for each playground
    INSERT INTO playground_equipments (playground_id, equipment_id)
    VALUES
      -- Parc de la Tête d'Or
      ((SELECT id FROM playgrounds WHERE name = 'Parc de la Tête d''Or'), 'slide'),
      ((SELECT id FROM playgrounds WHERE name = 'Parc de la Tête d''Or'), 'swing'),
      ((SELECT id FROM playgrounds WHERE name = 'Parc de la Tête d''Or'), 'sandbox'),
      ((SELECT id FROM playgrounds WHERE name = 'Parc de la Tête d''Or'), 'picnic'),
      ((SELECT id FROM playgrounds WHERE name = 'Parc de la Tête d''Or'), 'water'),
      ((SELECT id FROM playgrounds WHERE name = 'Parc de la Tête d''Or'), 'shade'),
      
      -- Parc Blandan
      ((SELECT id FROM playgrounds WHERE name = 'Parc Blandan'), 'slide'),
      ((SELECT id FROM playgrounds WHERE name = 'Parc Blandan'), 'climbing'),
      ((SELECT id FROM playgrounds WHERE name = 'Parc Blandan'), 'rubber'),
      
      -- Parc de la Feyssine
      ((SELECT id FROM playgrounds WHERE name = 'Parc de la Feyssine'), 'climbing'),
      ((SELECT id FROM playgrounds WHERE name = 'Parc de la Feyssine'), 'picnic'),
      ((SELECT id FROM playgrounds WHERE name = 'Parc de la Feyssine'), 'walking'),
      
      -- Parc Saint-Clair
      ((SELECT id FROM playgrounds WHERE name = 'Parc Saint-Clair'), 'slide'),
      ((SELECT id FROM playgrounds WHERE name = 'Parc Saint-Clair'), 'swing'),
      ((SELECT id FROM playgrounds WHERE name = 'Parc Saint-Clair'), 'toddler'),
      ((SELECT id FROM playgrounds WHERE name = 'Parc Saint-Clair'), 'fenced'),
      ((SELECT id FROM playgrounds WHERE name = 'Parc Saint-Clair'), 'shade'),
      
      -- Parc du Grand Large
      ((SELECT id FROM playgrounds WHERE name = 'Parc du Grand Large'), 'slide'),
      ((SELECT id FROM playgrounds WHERE name = 'Parc du Grand Large'), 'climbing'),
      ((SELECT id FROM playgrounds WHERE name = 'Parc du Grand Large'), 'rubber'),
      ((SELECT id FROM playgrounds WHERE name = 'Parc du Grand Large'), 'inclusive'),
      ((SELECT id FROM playgrounds WHERE name = 'Parc du Grand Large'), 'wheelchair');
  END IF;
END $$;