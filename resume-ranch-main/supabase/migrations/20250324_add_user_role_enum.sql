
-- Create a new type for user roles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'super_admin');
    END IF;
END
$$;

-- Update the user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create basic roles if they don't exist
INSERT INTO public.user_roles (name, description, permissions)
VALUES 
('user', 'Basic user with limited permissions', '["view_candidates"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.user_roles (name, description, permissions)
VALUES 
('admin', 'Administrator with elevated permissions', '["view_candidates", "edit_candidates", "delete_candidates", "upload_data", "run_reports", "manage_users"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.user_roles (name, description, permissions)
VALUES 
('super_admin', 'Super Administrator with all permissions', '["view_candidates", "edit_candidates", "delete_candidates", "upload_data", "run_reports", "manage_users", "manage_roles"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Add a unique constraint on the name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'user_roles_name_key'
    ) THEN
        ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_name_key UNIQUE (name);
    END IF;
END
$$;
