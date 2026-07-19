# Guide de Démarrage - GSM Solution

Ce document vous guide pas à pas pour installer, configurer et lancer le projet **GSM Solution** (une application SaaS multi-boutiques de suivi des réparations et de facturation).

---

## 🛠 Prérequis

Assurez-vous que les outils suivants sont installés sur votre machine :
- **Node.js** (Version 18 ou supérieure recommandée)
- **npm** (inclus avec Node.js)
- Un compte **Supabase** (gratuit) pour héberger la base de données et l'authentification.

---

## 📁 Structure du Projet

- `src/` : Code source de l'application (React + TypeScript).
  - `src/context/AppContext.tsx` : Contexte global de l'application gérant l'état, l'authentification et les requêtes Supabase.
  - `src/pages/` : Les pages de l'application (Tableau de bord, Factures, Réparations, etc.).
  - `src/lib/supabase.ts` : Initialisation du client Supabase.
- `migration_multitenant.sql` : Script SQL pour activer le mode multi-boutique (multi-tenant).

---

## 🚀 Étape 1 : Installation des dépendances

Ouvrez un terminal dans le dossier du projet et exécutez la commande suivante :

```bash
npm install
```

---

## 🔑 Étape 2 : Configuration de l'environnement

Créez un fichier `.env` à la racine du projet (s'il n'existe pas déjà) et configurez-y les variables d'accès à Supabase :

```env
# Variables d'environnement pour l'application React (Vite)
VITE_SUPABASE_URL="https://votre-projet.supabase.co"
VITE_SUPABASE_ANON_KEY="votre-cle-anonyme-publique"
```

> [!NOTE]
> Vous pouvez récupérer ces clés dans l'interface de votre projet Supabase sous **Project Settings** > **API**.

---

## 💾 Étape 3 : Initialisation de la Base de Données (Supabase)

Pour que l'application fonctionne, vous devez créer les tables et configurer la sécurité (RLS) sur Supabase. 

Allez dans le **SQL Editor** de Supabase et exécutez le script complet ci-dessous :

```sql
-- 1. Création de la table des Boutiques (Shops)
CREATE TABLE tb_shops (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Activation de la RLS pour les Boutiques
ALTER TABLE tb_shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent voir leur boutique" ON tb_shops FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Les utilisateurs peuvent créer leur boutique" ON tb_shops FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Les utilisateurs peuvent modifier leur boutique" ON tb_shops FOR UPDATE USING (auth.uid() = owner_id);

-- 2. Création de la table des Clients (Customers)
CREATE TABLE tb_customers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid REFERENCES tb_shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text,
  created_at timestamp with time zone DEFAULT now()
);

-- Activation de la RLS pour les Clients
ALTER TABLE tb_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access customers based on shop" ON tb_customers
  FOR ALL USING (
    shop_id IN (SELECT id FROM tb_shops WHERE owner_id = auth.uid())
  );

-- 3. Création de la table des Employés / Techniciens (Employees)
CREATE TABLE tb_employees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid REFERENCES tb_shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL, -- ex: 'Manager', 'Technicien'
  email text,
  created_at timestamp with time zone DEFAULT now()
);

-- Activation de la RLS pour les Employés
ALTER TABLE tb_employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access employees based on shop" ON tb_employees
  FOR ALL USING (
    shop_id IN (SELECT id FROM tb_shops WHERE owner_id = auth.uid())
  );

-- 4. Création de la table des Modèles d'Appareils (Device Models)
CREATE TABLE tb_device_models (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid REFERENCES tb_shops(id) ON DELETE CASCADE,
  brand text NOT NULL,
  model text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Activation de la RLS pour les Modèles d'Appareils
ALTER TABLE tb_device_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access models based on shop" ON tb_device_models
  FOR ALL USING (
    shop_id IN (SELECT id FROM tb_shops WHERE owner_id = auth.uid())
  );

-- 5. Création de la table des Pannes Courantes (Common Issues)
CREATE TABLE tb_common_issues (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid REFERENCES tb_shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  default_price numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Activation de la RLS pour les Pannes Courantes
ALTER TABLE tb_common_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access issues based on shop" ON tb_common_issues
  FOR ALL USING (
    shop_id IN (SELECT id FROM tb_shops WHERE owner_id = auth.uid())
  );

-- 6. Création de la table des Paramètres de la Boutique (Shop Settings)
CREATE TABLE tb_shop_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid REFERENCES tb_shops(id) ON DELETE CASCADE,
  name text,
  address text,
  phone text,
  email text,
  terms_and_conditions text,
  subscription_plan text DEFAULT 'Standard',
  subscription_status text DEFAULT 'active',
  subscription_end_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Activation de la RLS pour les Paramètres de la Boutique
ALTER TABLE tb_shop_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access settings based on shop" ON tb_shop_settings
  FOR ALL USING (
    shop_id IN (SELECT id FROM tb_shops WHERE owner_id = auth.uid())
  );

-- 7. Création de la table des Factures (Invoices)
CREATE TABLE tb_invoices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid REFERENCES tb_shops(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  date timestamp with time zone NOT NULL,
  customer_id uuid REFERENCES tb_customers(id) NOT NULL,
  employee_id uuid REFERENCES tb_employees(id),
  price numeric DEFAULT 0,
  warranty_months integer DEFAULT 3,
  status text NOT NULL, -- 'Pending', 'In Progress', 'Completed', 'Cancelled'
  payment_status text DEFAULT 'Impayé', -- 'Payé', 'Impayé'
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Activation de la RLS pour les Factures
ALTER TABLE tb_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access invoices based on shop" ON tb_invoices
  FOR ALL USING (
    shop_id IN (SELECT id FROM tb_shops WHERE owner_id = auth.uid())
  );

-- 8. Création de la table des Appareils (Devices)
CREATE TABLE tb_devices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid REFERENCES tb_shops(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES tb_invoices(id) ON DELETE CASCADE,
  brand text NOT NULL,
  model text NOT NULL,
  serial_number text,
  issue text NOT NULL,
  accessories text,
  password text,
  created_at timestamp with time zone DEFAULT now()
);

-- Activation de la RLS pour les Appareils
ALTER TABLE tb_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access devices based on shop" ON tb_devices
  FOR ALL USING (
    shop_id IN (SELECT id FROM tb_shops WHERE owner_id = auth.uid())
  );
```

---

## 💻 Étape 4 : Lancer le Serveur Local

Une fois l'installation et la configuration de la base de données terminées, démarrez l'application localement :

```bash
npm run dev
```

L'application sera lancée par défaut sur [http://localhost:5173/](http://localhost:5173/).

---

## 💡 Mode de contournement pour le Développement (Dev Bypass)

Pour simplifier les tests locaux sans avoir à créer un compte Supabase Auth à chaque fois, l'application intègre un mode de contournement :
1. Sur la page de connexion, cliquez sur le bouton permettant de forcer la connexion administrateur de développement (ou appelez la fonction `forceLoginAsAdmin` via la console).
2. L'application stockera un indicateur `dev_bypass` dans le stockage local (`localStorage`) et vous connectera avec un compte administrateur virtuel (`admin@tontonboua.com`).
