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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Create service role client to verify JWT and perform admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Extract JWT token from Authorization header
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the JWT token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      console.error('Error verifying user token:', userError)
      throw new Error('Unauthorized - Invalid token')
    }

    console.log('User authenticated:', user.email)

    // Check if user has admin role using the has_role function
    const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    })

    if (roleError || !isAdmin) {
      console.error('Admin check failed:', roleError)
      throw new Error('Unauthorized - Admin access required')
    }

    console.log('Admin verified:', user.email)

    // Parse request body
    const { userId, newPassword } = await req.json()

    if (!userId || !newPassword) {
      throw new Error('Missing userId or newPassword')
    }

    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }

    console.log(`Admin ${user.email} resetting password for user ${userId}`)

    // Update user password using admin API
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Error updating password:', updateError)
      throw new Error(`Failed to update password: ${updateError.message}`)
    }

    console.log(`Password successfully reset for user ${userId}`)

    return new Response(
      JSON.stringify({ success: true, message: 'Password reset successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in admin-reset-password:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
