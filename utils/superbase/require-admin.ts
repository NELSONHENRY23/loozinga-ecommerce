import 'server-only';

import { eq } from 'drizzle-orm';

import { db } from '@/app/db';
import { profiles } from '@/app/db/schema';
import { createClient } from '@/utils/superbase/server';

export async function requireAdmin(){
    const supabase = await createClient();

    // Verify the signed JWT without making a separate Auth API request.
    const {data, error} = await supabase.auth.getClaims();
    
    if (error) {
        console.error('ADMIN AUTH ERROR:', error.message);
      }

    const claims = data?.claims;
    const userId = claims?.sub;

    if(error || !claims || typeof userId !== 'string'){
        console.error('ADMIN AUTH FAILED:', {
            hasClaims: Boolean(claims),
            hasUserId: typeof userId === 'string',
          });
        
        throw new Error('Unauthorized');
    }

    // Read the role from the database,
    // not user-editable account metadata.
    const [profile] = await db.select({role: profiles.role})
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

    if(profile?.role !== 'Administrator'){
        throw new Error('Forbidden');
    }

    return {
        id: userId,
        email: typeof claims.email === 'string' ? claims.email : undefined,
    };
}