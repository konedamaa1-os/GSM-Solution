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
-- Pour les factures
ALTER TABLE tb_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access" ON tb_invoices;
CREATE POLICY "Access invoices based on shop" ON tb_invoices
  FOR ALL USING (
    shop_id IN (SELECT id FROM tb_shops WHERE owner_id = auth.uid())
  );

-- Pour les clients
ALTER TABLE tb_customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access" ON tb_customers;
CREATE POLICY "Access customers based on shop" ON tb_customers
  FOR ALL USING (
    shop_id IN (SELECT id FROM tb_shops WHERE owner_id = auth.uid())
  );

-- Pour les appareils
ALTER TABLE tb_devices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access" ON tb_devices;
CREATE POLICY "Access devices based on shop" ON tb_devices
  FOR ALL USING (
    shop_id IN (SELECT id FROM tb_shops WHERE owner_id = auth.uid())
  );

-- Pour les employés
ALTER TABLE tb_employees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access" ON tb_employees;
CREATE POLICY "Access employees based on shop" ON tb_employees
  FOR ALL USING (
    shop_id IN (SELECT id FROM tb_shops WHERE owner_id = auth.uid())
  );

-- Pour les modèles d'appareils
ALTER TABLE tb_device_models ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access" ON tb_device_models;
CREATE POLICY "Access models based on shop" ON tb_device_models
  FOR ALL USING (
    shop_id IN (SELECT id FROM tb_shops WHERE owner_id = auth.uid())
  );

-- Pour les pannes courantes
ALTER TABLE tb_common_issues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access" ON tb_common_issues;
CREATE POLICY "Access issues based on shop" ON tb_common_issues
  FOR ALL USING (
    shop_id IN (SELECT id FROM tb_shops WHERE owner_id = auth.uid())
  );

-- Pour les paramètres de la boutique
ALTER TABLE tb_shop_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access" ON tb_shop_settings;
CREATE POLICY "Access settings based on shop" ON tb_shop_settings
  FOR ALL USING (
    shop_id IN (SELECT id FROM tb_shops WHERE owner_id = auth.uid())
  );
