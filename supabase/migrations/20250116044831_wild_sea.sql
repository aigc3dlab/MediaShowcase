/*
  # Initial Schema Setup for Media Showcase

  1. Tables
    - profiles
      - id (uuid, references auth.users)
      - username (text)
      - avatar_url (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - media_items
      - id (uuid)
      - user_id (uuid, references profiles)
      - title (text)
      - description (text)
      - media_type (text)
      - media_url (text)
      - thumbnail_url (text)
      - created_at (timestamp)
    
    - likes
      - id (uuid)
      - user_id (uuid, references profiles)
      - media_id (uuid, references media_items)
      - created_at (timestamp)
    
    - comments
      - id (uuid)
      - user_id (uuid, references profiles)
      - media_id (uuid, references media_items)
      - content (text)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Set up appropriate policies for each table
*/

-- Create profiles table
CREATE TABLE profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username text UNIQUE,
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create media_items table
CREATE TABLE media_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    description text,
    media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
    media_url text NOT NULL,
    thumbnail_url text,
    created_at timestamptz DEFAULT now()
);

-- Create likes table
CREATE TABLE likes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
    media_id uuid REFERENCES media_items ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, media_id)
);

-- Create comments table
CREATE TABLE comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
    media_id uuid REFERENCES media_items ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Media items policies
CREATE POLICY "Media items are viewable by everyone"
    ON media_items FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert media items"
    ON media_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own media items"
    ON media_items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own media items"
    ON media_items FOR DELETE
    USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone"
    ON likes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert likes"
    ON likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
    ON likes FOR DELETE
    USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
    ON comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert comments"
    ON comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
    ON comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
    ON comments FOR DELETE
    USING (auth.uid() = user_id);

-- Create functions for managing profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();