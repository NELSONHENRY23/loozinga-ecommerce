import 'server-only';

import { cache } from 'react';
import { eq } from 'drizzle-orm';

import { db } from '@/app/db';
import { profiles } from '@/app/db/schema';
import { createClient } from '@/utils/superbase/server';

type AdminContext = {
    id: string;
    email?: string;
    name: string | null;
}

type AdminContextResult =
| { status: 'unauthenticated' }
| { status: 'forbidden' }
| { status: 'authorized', admin: AdminContext }

// Reuse the authentication and profile lookup during the same React render.
export const getAdminContext = cache(async (): Promise<AdminContextResult> => {
    const supabase = await createClient();

    // Verify the signed JWT without making a separate Auth API request.
    const { data, error } = await supabase.auth.getClaims();

    const claims = data?.claims;

    let userId =
        !error && typeof claims?.sub === 'string'
            ? claims.sub
            : null;
    let email =
        !error && typeof claims?.email === 'string'
            ? claims.email
            : undefined;

    // Fall back to an Auth-server lookup when claims cannot identify the user.
    if (!userId) {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if(userError || !user) {
            console.error('ADMIN AUTH FAILED:', {
                hasClaims: Boolean(claims),
                claimsError: error?.message,
                userError: userError?.message,
            });

            return { status: 'unauthenticated' };
        }

        userId = user.id;
        email = user.email;
    }

    // Always read the role from the database, not user-editable account metadata.
    const [profile] = await db.select({
        name: profiles.name,
        role: profiles.role
    })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

    if(profile?.role !== 'Administrator'){
        return { status: 'forbidden' };
    }

    return {
        status: 'authorized',
        admin: {
            id: userId,
            email,
            name: profile.name,
        },
    }

}
);
// Keep this function as the authorization entry point for pages and actions.
export async function requireAdmin(): Promise<AdminContext> {
  const result = await getAdminContext();

  if (result.status === 'unauthenticated') {
    throw new Error('Unauthorized');
  }

  if (result.status === 'forbidden') {
    throw new Error('Forbidden');
  }

  return result.admin;
}