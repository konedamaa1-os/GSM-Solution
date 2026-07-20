-- 1. Création de la table des Boutiques
CREATE TABLE tb_shops (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE tb_shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent voir leur boutique" ON tb_shops FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Les utilisateurs peuvent créer leur boutique" ON tb_shops FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Les utilisateurs peuvent modifier leur boutique" ON tb_shops FOR UPDATE USING (auth.uid() = owner_id);

-- 2. Ajout de la colonne shop_id sur toutes les tables
ALTER TABLE tb_invoices ADD COLUMN shop_id uuid REFERENCES tb_shops(id) ON DELETE CASCADE;
ALTER TABLE tb_customers ADD COLUMN shop_id uuid REFERENCES tb_shops(id) ON DELETE CASCADE;
ALTER TABLE tb_devices ADD COLUMN shop_id uuid REFERENCES tb_shops(id) ON DELETE CASCADE;
ALTER TABLE tb_employees ADD COLUMN shop_id uuid REFERENCES tb_shops(id) ON DELETE CASCADE;
ALTER TABLE tb_device_models ADD COLUMN shop_id uuid REFERENCES tb_shops(id) ON DELETE CASCADE;
ALTER TABLE tb_common_issues ADD COLUMN shop_id uuid REFERENCES tb_shops(id) ON DELETE CASCADE;
ALTER TABLE tb_shop_settings ADD COLUMN shop_id uuid REFERENCES tb_shops(id) ON DELETE CASCADE;

-- 3. Mise à jour des politiques RLS (Row Level Security) pour chaque table
-- 3.1 Création des fonctions helper avec SECURITY DEFINER pour éviter la récursion infinie RLS

CREATE OR REPLACE FUNCTION public.is_shop_owner(shop_uuid uuid, user_uid uuid)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.tb_shops 
    WHERE id = shop_uuid AND owner_id = user_uid
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.is_shop_employee(shop_uuid uuid, user_email text)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.tb_employees 
    WHERE shop_id = shop_uuid AND email = user_email
  );
END;
$$ LANGUAGE plpgsql;

-- Pour les boutiques
ALTER TABLE tb_shops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Access shops" ON tb_shops;
CREATE POLICY "Access shops" ON tb_shops
  FOR ALL USING (
    owner_id = auth.uid()
    OR
    public.is_shop_employee(id, auth.jwt() ->> 'email')
    OR
    auth.jwt() ->> 'email' = 'admin.tontonboua@gmail.com'
  );

-- Pour les factures
ALTER TABLE tb_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Access invoices based on shop and employees" ON tb_invoices;
CREATE POLICY "Access invoices based on shop and employees" ON tb_invoices
  FOR ALL USING (
    public.is_shop_owner(shop_id, auth.uid())
    OR
    public.is_shop_employee(shop_id, auth.jwt() ->> 'email')
    OR
    auth.jwt() ->> 'email' = 'admin.tontonboua@gmail.com'
  );

-- Pour les clients
ALTER TABLE tb_customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Access customers based on shop and employees" ON tb_customers;
CREATE POLICY "Access customers based on shop and employees" ON tb_customers
  FOR ALL USING (
    public.is_shop_owner(shop_id, auth.uid())
    OR
    public.is_shop_employee(shop_id, auth.jwt() ->> 'email')
    OR
    auth.jwt() ->> 'email' = 'admin.tontonboua@gmail.com'
  );

-- Pour les appareils
ALTER TABLE tb_devices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Access devices based on shop and employees" ON tb_devices;
CREATE POLICY "Access devices based on shop and employees" ON tb_devices
  FOR ALL USING (
    public.is_shop_owner(shop_id, auth.uid())
    OR
    public.is_shop_employee(shop_id, auth.jwt() ->> 'email')
    OR
    auth.jwt() ->> 'email' = 'admin.tontonboua@gmail.com'
  );

-- Pour les employés
ALTER TABLE tb_employees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Access employees based on shop and employees" ON tb_employees;
CREATE POLICY "Access employees based on shop and employees" ON tb_employees
  FOR ALL USING (
    public.is_shop_owner(shop_id, auth.uid())
    OR
    email = auth.jwt() ->> 'email'
    OR
    auth.jwt() ->> 'email' = 'admin.tontonboua@gmail.com'
  );

-- Pour les modèles d'appareils
ALTER TABLE tb_device_models ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Access models based on shop and employees" ON tb_device_models;
CREATE POLICY "Access models based on shop and employees" ON tb_device_models
  FOR ALL USING (
    public.is_shop_owner(shop_id, auth.uid())
    OR
    public.is_shop_employee(shop_id, auth.jwt() ->> 'email')
    OR
    auth.jwt() ->> 'email' = 'admin.tontonboua@gmail.com'
  );

-- Pour les pannes courantes
ALTER TABLE tb_common_issues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Access issues based on shop and employees" ON tb_common_issues;
CREATE POLICY "Access issues based on shop and employees" ON tb_common_issues
  FOR ALL USING (
    public.is_shop_owner(shop_id, auth.uid())
    OR
    public.is_shop_employee(shop_id, auth.jwt() ->> 'email')
    OR
    auth.jwt() ->> 'email' = 'admin.tontonboua@gmail.com'
  );

-- Pour les paramètres de la boutique
ALTER TABLE tb_shop_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Access settings based on shop and employees" ON tb_shop_settings;
CREATE POLICY "Access settings based on shop and employees" ON tb_shop_settings
  FOR ALL USING (
    public.is_shop_owner(shop_id, auth.uid())
    OR
    public.is_shop_employee(shop_id, auth.jwt() ->> 'email')
    OR
    auth.jwt() ->> 'email' = 'admin.tontonboua@gmail.com'
  );


-- 4. Fonction RPC pour permettre au Super Admin de créer des comptes utilisateurs (email/password)
CREATE OR REPLACE FUNCTION public.create_user_admin(new_email text, new_password text)
RETURNS uuid
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- 1. Security Check: Only allow Super Admin
  IF auth.jwt() ->> 'email' <> 'admin.tontonboua@gmail.com' THEN
    RAISE EXCEPTION 'Seul le Super Admin peut créer des utilisateurs.';
  END IF;

  -- 2. Check if user already exists in auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = new_email) THEN
    RAISE EXCEPTION 'Cet utilisateur existe déjà.';
  END IF;

  -- 3. Generate a new UUID for the user
  new_user_id := gen_random_uuid();

  -- 4. Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change_token_current,
    phone_change_token,
    reauthentication_token,
    email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    new_email,
    extensions.crypt(new_password, extensions.gen_salt('bf', 10)),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now(),
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  );

  -- 5. Insert into auth.identities
  INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    new_email,
    new_user_id,
    json_build_object(
      'sub', new_user_id,
      'email', new_email,
      'email_verified', true,
      'phone_verified', false
    )::jsonb,
    'email',
    now(),
    now()
  );

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;



