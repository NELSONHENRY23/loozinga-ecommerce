import { db } from '@/app/db';
import { categories } from '@/app/db/schema';
import { desc } from 'drizzle-orm';

import CategoriesClient from './CategoriesClient';

export default async function CategoriesPage() {
  const categoryList = await db
    .select()
    .from(categories)
    .orderBy(desc(categories.id));

  return <CategoriesClient categoryList={categoryList} />;
}
