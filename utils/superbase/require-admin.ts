import 'server-only';

import { eq } from 'drizzle-orm';

import { db } from '@/app/db';
import { profiles } from '@/app/db/schema';
import { createClient } from '@/utils/superbase/server';

export async function requireAdmin(){
    const supabase = await createClient();

    // Verify the authenticated user.
    const {data: { user }, error} = await supabase.auth.getUser();

    if(error || !user){
        throw new Error('Unauthorized');
    }

    // Read the role from the database,
    // not user-editable account metadata.
    const [profile] = await db.select({role: profiles.role})
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

    if(profile?.role !== 'Administrator'){
        throw new Error('Forbidden');
    }

    return user;
}