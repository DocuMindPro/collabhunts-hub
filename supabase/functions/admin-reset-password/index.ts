import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '').trim()
    if (!token) {
      throw new Error('Missing JWT token')
    }

    // Decode JWT payload to extract user id (sub)
    let userId: string | null = null
    let userEmail: string | null = null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      userId = payload.sub ?? null
      userEmail = payload.email ?? null
    } catch (e) {
      console.error('Failed to decode JWT payload', e)
      throw new Error('Invalid auth token')
    }

    if (!userId) {
      throw new Error('Invalid auth token: missing user id')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Service-role client for role check and admin ops
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log('JWT decoded for user:', userEmail ?? userId)

    // Check if user has admin role using the has_role function
    const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: 'admin',
    })

    if (roleError || !isAdmin) {
      console.error('Admin check failed:', roleError)
      throw new Error('Unauthorized - Admin access required')
    }

    console.log('Admin verified:', userEmail ?? userId)

    // Parse request body
    const { userId: targetUserId, newPassword } = await req.json()

    if (!targetUserId || !newPassword) {
      throw new Error('Missing userId or newPassword')
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }

    console.log(`Admin ${userEmail ?? userId} resetting password for user ${targetUserId}`)

    // Update user password using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(targetUserId, {
      password: newPassword,
    })

    if (updateError) {
      console.error('Error updating password:', updateError)
      throw new Error(`Failed to update password: ${updateError.message}`)
    }

    console.log(`Password successfully reset for user ${targetUserId}`)

    return new Response(
      JSON.stringify({ success: true, message: 'Password reset successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error in admin-reset-password:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
