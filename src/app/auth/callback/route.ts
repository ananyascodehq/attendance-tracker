import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth error:', error);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    if (data.user) {
      const email = data.user.email;

      // Validate email domain
      if (!email || !email.endsWith('@svce.ac.in')) {
        // Sign out the user - invalid domain
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/login?error=invalid_domain`
        );
      }

      // Upsert profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
          avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
        }, {
          onConflict: 'id',
        });

      if (profileError) {
        console.error('Profile upsert error:', profileError);
        // Don't block login for profile errors, just log it
      }

      // Check if user is onboarded
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarded')
        .eq('id', data.user.id)
        .single();

      // Redirect based on onboarding status
      if (profile && !profile.onboarded) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If no code or something went wrong
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
