import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL as string;

if(!databaseUrl){
    throw new Error(
        'DATABASE_URL is not defined'
    );
}

const client = postgres(databaseUrl, {
    prepare: false,
})

export const db = drizzle(client);
