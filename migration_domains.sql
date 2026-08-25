-- ==============================================================================
-- MIGRATION : Support Multi-Ateliers avec Domaines et Sous-Domaines Personnalisés
-- ==============================================================================

-- 1. Ajout des colonnes de domaine et personnalisation visuelle sur tb_shops
ALTER TABLE tb_shops 
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS custom_domain text UNIQUE,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS brand_color text DEFAULT '#2563eb';

-- 2. Index pour des recherches rapides par slug et custom_domain
CREATE INDEX IF NOT EXISTS idx_tb_shops_slug ON tb_shops(slug);
CREATE INDEX IF NOT EXISTS idx_tb_shops_custom_domain ON tb_shops(custom_domain);

-- 3. Mise à jour des boutiques existantes sans slug avec un slug automatique
UPDATE tb_shops
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- 4. Politique de lecture publique pour la résolution de domaine et portail client
-- Permet aux visiteurs et clients de charger les informations publiques de la boutique (nom, adresse, logo)
DROP POLICY IF EXISTS "Public shop domain resolution" ON tb_shops;
CREATE POLICY "Public shop domain resolution" ON tb_shops
  FOR SELECT
  USING (true);

-- Permet aux clients de consulter les informations publiques de paramètres de la boutique
DROP POLICY IF EXISTS "Public shop settings read" ON tb_shop_settings;
CREATE POLICY "Public shop settings read" ON tb_shop_settings
  FOR SELECT
  USING (true);

-- Permet aux clients de rechercher le statut d'une réparation sur le portail public
DROP POLICY IF EXISTS "Public repair lookup" ON tb_invoices;
CREATE POLICY "Public repair lookup" ON tb_invoices
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public device lookup" ON tb_devices;
CREATE POLICY "Public device lookup" ON tb_devices
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public customer lookup" ON tb_customers;
CREATE POLICY "Public customer lookup" ON tb_customers
  FOR SELECT
  USING (true);
