import {
    createServerClient,
  } from '@supabase/ssr';
  
  import {
    NextResponse,
    type NextRequest,
  } from 'next/server';
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  export async function updateSession(
    request: NextRequest,
  ) {
    let supabaseResponse =
      NextResponse.next({
        request,
      });
  
    const supabase =
      createServerClient(
        supabaseUrl!,
        supabaseKey!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
  
            setAll(
              cookiesToSet,
            ) {
              cookiesToSet.forEach(
                ({ name, value }) =>
                  request.cookies.set(
                    name,
                    value,
                  ),
              );
  
              supabaseResponse =
                NextResponse.next({
                  request,
                });
  
              cookiesToSet.forEach(
                ({
                  name,
                  value,
                  options,
                }) =>
                  supabaseResponse.cookies.set(
                    name,
                    value,
                    options,
                  ),
              );
            },
          },
        },
      );
  
      // Verify the authenticated session 

    /*
     * Important:
     * keep the auth verification immediately
     * after creating the client.
     */
    const pathname = request.nextUrl.pathname;
    
    const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

    const isLoginRoute = pathname.startsWith('/admin/login');
    
    // keep supabase session verification.
    const {data, error,} = await supabase.auth.getClaims();
  
    const isAuthenticated = !error && Boolean(data?.claims);

// Unauthorized visitors are redirected to login.
    // Not logged in:
    // block admin pages except login page.
    if(isAdminRoute && !isLoginRoute && !isAuthenticated) {
        const url = request.nextUrl.clone();

        url.pathname = '/admin/login';
        url.search = '';

        const response = NextResponse.redirect(url);

        // Preserve any refreshed session cookies.
        supabaseResponse.cookies.getAll().forEach((cookie) => {
          response.cookies.set(cookie);
        });

        return response;
    }

    // Do NOT automatically redirect authenticated users
    // away from /admin/login.
    // The login action performs administrator role checks.
  
    return supabaseResponse;
  }