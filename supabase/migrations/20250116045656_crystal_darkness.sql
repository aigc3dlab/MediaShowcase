/*
  # Update Database Schema

  This migration checks for existing objects before creating them to avoid conflicts.

  1. Tables
    - Ensures tables exist: profiles, media_items, likes, comments
  2. Security
    - Enables RLS if not already enabled
    - Creates policies if they don't exist
  3. Triggers
    - Updates user creation trigger
*/

-- Create tables if they don't exist
DO $$ 
BEGIN
    -- Create profiles table if it doesn't exist
    CREATE TABLE IF NOT EXISTS profiles (
        id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
        username text UNIQUE,
        avatar_url text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
    );

    -- Create media_items table if it doesn't exist
    CREATE TABLE IF NOT EXISTS media_items (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
        title text NOT NULL,
        description text,
        media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
        media_url text NOT NULL,
        created_at timestamptz DEFAULT now()
    );

    -- Create likes table if it doesn't exist
    CREATE TABLE IF NOT EXISTS likes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
        media_id uuid REFERENCES media_items ON DELETE CASCADE NOT NULL,
        created_at timestamptz DEFAULT now(),
        UNIQUE(user_id, media_id)
    );

    -- Create comments table if it doesn't exist
    CREATE TABLE IF NOT EXISTS comments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
        media_id uuid REFERENCES media_items ON DELETE CASCADE NOT NULL,
        content text NOT NULL,
        created_at timestamptz DEFAULT now()
    );
END $$;

-- Enable RLS
DO $$ 
BEGIN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- Create policies if they don't exist
DO $$ 
BEGIN
    -- Profiles policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone'
    ) THEN
        CREATE POLICY "Public profiles are viewable by everyone"
            ON profiles FOR SELECT
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile"
            ON profiles FOR INSERT
            WITH CHECK (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile"
            ON profiles FOR UPDATE
            USING (auth.uid() = id);
    END IF;

    -- Media items policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'media_items' AND policyname = 'Media items are viewable by everyone'
    ) THEN
        CREATE POLICY "Media items are viewable by everyone"
            ON media_items FOR SELECT
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'media_items' AND policyname = 'Authenticated users can insert media items'
    ) THEN
        CREATE POLICY "Authenticated users can insert media items"
            ON media_items FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'media_items' AND policyname = 'Users can update own media items'
    ) THEN
        CREATE POLICY "Users can update own media items"
            ON media_items FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'media_items' AND policyname = 'Users can delete own media items'
    ) THEN
        CREATE POLICY "Users can delete own media items"
            ON media_items FOR DELETE
            USING (auth.uid() = user_id);
    END IF;

    -- Likes policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'likes' AND policyname = 'Likes are viewable by everyone'
    ) THEN
        CREATE POLICY "Likes are viewable by everyone"
            ON likes FOR SELECT
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'likes' AND policyname = 'Authenticated users can insert likes'
    ) THEN
        CREATE POLICY "Authenticated users can insert likes"
            ON likes FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'likes' AND policyname = 'Users can delete own likes'
    ) THEN
        CREATE POLICY "Users can delete own likes"
            ON likes FOR DELETE
            USING (auth.uid() = user_id);
    END IF;

    -- Comments policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'comments' AND policyname = 'Comments are viewable by everyone'
    ) THEN
        CREATE POLICY "Comments are viewable by everyone"
            ON comments FOR SELECT
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'comments' AND policyname = 'Authenticated users can insert comments'
    ) THEN
        CREATE POLICY "Authenticated users can insert comments"
            ON comments FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'comments' AND policyname = 'Users can update own comments'
    ) THEN
        CREATE POLICY "Users can update own comments"
            ON comments FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'comments' AND policyname = 'Users can delete own comments'
    ) THEN
        CREATE POLICY "Users can delete own comments"
            ON comments FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Update or create the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();