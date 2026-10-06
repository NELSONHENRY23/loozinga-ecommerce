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
    const {data, error,} = await supabase.auth.getClaims();
  
    const isAuthenticated = !error && Boolean(data?.claims);

    const pathname = request.nextUrl.pathname;

    const isAdminRoute = pathname.startsWith('/admin');

    const isLoginRoute = pathname.startsWith('/admin/login');

    // Not logged in:
    // block admin pages except login page.
    if(isAdminRoute && !isLoginRoute && !isAuthenticated) {
        const url = request.nextUrl.clone();

        url.pathname = '/admin/login';

        return NextResponse.redirect(url);
    }

    // Already logged in:
    // don't allow returning to login page
    if(isLoginRoute && isAuthenticated){
        const url = request.nextUrl.clone();

        url.pathname = '/admin';

        return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }