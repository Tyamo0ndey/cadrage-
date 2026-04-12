import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('MY_SUPABASE_URL') ?? 'https://xoxssqbhsdtxzzmrdkfp.supabase.co',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()

    if (!payload.email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Générer mot de passe temporaire
    const tempPassword = generatePassword(12)

    // 2. Créer le compte auth
    let userId: string
    let isNewAccount = false

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: payload.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: payload.full_name || '',
        role: 'repreneur'
      }
    })

    if (authError) {
      if (
        authError.message?.includes('already been registered') ||
        authError.message?.includes('already exists')
      ) {
        // Utilisateur existant — récupérer son ID
        const { data: users } = await supabase.auth.admin.listUsers()
        const existing = users?.users?.find(u => u.email === payload.email.toLowerCase())
        userId = existing?.id ?? ''
        isNewAccount = false
      } else {
        throw authError
      }
    } else {
      userId = authData.user.id
      isNewAccount = true
    }

    // 3. UPSERT dans repreneurs
    const repreneurData = {
      full_name: payload.full_name || null,
      email: payload.email.toLowerCase(),
      user_id: userId || null,
      status: 'actif',
      profil_court: payload.profil_court || null,
      profil_description: payload.profil_description || null,
      motivation: payload.motivation || null,
      competences: payload.competences || null,
      localisation: payload.localisation || null,
      zone_affichee: payload.zone_affichee || null,
      secteur_recherche: payload.secteur_recherche || null,
      ca_cible: payload.ca_cible || null,
      apport: payload.apport || null,
      prix_min: payload.prix_min || null,
      prix_max: payload.prix_max || null,
      effectif: payload.effectif || null,
      conditions: payload.conditions || null,
      regions_cibles: payload.regions_cibles || null,
      departements_cibles: payload.departements_cibles || null,
      financement_complementaire: payload.financement_complementaire || null,
      experiences: payload.experiences || null,
      fiche_cadrage_envoyee_at: new Date().toISOString(),
    }

    const { error: dbError } = await supabase
      .from('repreneurs')
      .upsert(repreneurData, { onConflict: 'email' })

    if (dbError) throw dbError

    // 4. Retourner le résultat
    return new Response(
      JSON.stringify({
        success: true,
        is_new_account: isNewAccount,
        user_id: userId,
        temp_password: isNewAccount ? tempPassword : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generatePassword(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
  let password = ''
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length]
  }
  return password
}
