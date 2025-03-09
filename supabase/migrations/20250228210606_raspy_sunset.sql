/*
  # Create admin user

  1. Changes
    - Add a function to create the admin user if it doesn't exist
*/

-- Create the admin user if it doesn't exist
DO $$
DECLARE
  admin_exists boolean;
  admin_user_id uuid;
BEGIN
  -- Check if the admin user exists
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'admin@parcacote.fr'
  ) INTO admin_exists;
  
  IF NOT admin_exists THEN
    -- Create the admin user
    -- Note: This is just a placeholder. In a real application, you would use the Supabase dashboard
    -- to create the admin user with the correct password.
    RAISE NOTICE 'Admin user does not exist. Please create it manually in the Supabase dashboard.';
    
    -- Reminder message
    RAISE NOTICE 'Remember to create the admin user with email admin@parcacote.fr and password Eyeshield21';
  ELSE
    -- Get the admin user ID
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@parcacote.fr';
    
    -- Make sure the admin user has the admin role in the profiles table
    IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = admin_user_id AND role = 'admin'
    ) THEN
      -- Insert or update the admin profile
      INSERT INTO profiles (id, email, role, created_at)
      VALUES (admin_user_id, 'admin@parcacote.fr', 'admin', now())
      ON CONFLICT (id) 
      DO UPDATE SET role = 'admin';
      
      RAISE NOTICE 'Admin role set for user admin@parcacote.fr';
    END IF;
  END IF;
END $$;