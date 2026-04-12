-- Colonnes profil
ALTER TABLE repreneurs ADD COLUMN IF NOT EXISTS profil_court TEXT;
ALTER TABLE repreneurs ADD COLUMN IF NOT EXISTS profil_description TEXT;
ALTER TABLE repreneurs ADD COLUMN IF NOT EXISTS motivation TEXT;
ALTER TABLE repreneurs ADD COLUMN IF NOT EXISTS competences TEXT[];

-- Colonnes projet
ALTER TABLE repreneurs ADD COLUMN IF NOT EXISTS localisation TEXT;
ALTER TABLE repreneurs ADD COLUMN IF NOT EXISTS zone_affichee TEXT;
ALTER TABLE repreneurs ADD COLUMN IF NOT EXISTS ca_cible TEXT;
ALTER TABLE repreneurs ADD COLUMN IF NOT EXISTS effectif TEXT;
ALTER TABLE repreneurs ADD COLUMN IF NOT EXISTS conditions TEXT;

-- JSONB
ALTER TABLE repreneurs ADD COLUMN IF NOT EXISTS financement_complementaire JSONB;
ALTER TABLE repreneurs ADD COLUMN IF NOT EXISTS experiences JSONB;

-- Métadonnées
ALTER TABLE repreneurs ADD COLUMN IF NOT EXISTS fiche_cadrage_envoyee_at TIMESTAMPTZ;
ALTER TABLE repreneurs ADD COLUMN IF NOT EXISTS fiche_cadrage_version INTEGER DEFAULT 1;

-- Index unique pour UPSERT
CREATE UNIQUE INDEX IF NOT EXISTS repreneurs_email_unique ON repreneurs (email);

-- RLS
ALTER TABLE repreneurs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fiche_cadrage_insert" ON repreneurs FOR INSERT WITH CHECK (true);
