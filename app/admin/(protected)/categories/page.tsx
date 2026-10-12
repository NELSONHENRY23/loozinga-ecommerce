import { db } from '@/app/db';
import { categories } from '@/app/db/schema';
import { count, desc } from 'drizzle-orm';

import CategoriesClient from './CategoriesClient';

export const dynamic = 'force-dynamic';

const pageSize = 10;

type CategoriesPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  // Read page number from URL
  const params = await searchParams;

  const requestedPage = Number(params.page ?? 1);

  const validPage =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  // Count all categories
  const countResult = await db.select({ total: count() }).from(categories);

  const totalCategories = countResult[0]?.total ?? 0;

  // work out number of pages
  const totalPages = Math.max(1, Math.ceil(totalCategories / pageSize));

  // prevent page = 500 when only 2 pages exist
  const currentPage = Math.min(validPage, totalPages);

  // number of records PostgreSQL should skip
  const offset = (currentPage - 1) * pageSize;

  // retrieve only categories for this page.
  const categoryList = await db
    .select()
    .from(categories)
    .orderBy(desc(categories.id))
    .limit(pageSize)
    .offset(offset);

  return (
    <CategoriesClient
      categoryList={categoryList}
      currentPage={currentPage}
      totalPages={totalPages}
      totalCategories={totalCategories}
      startIndex={offset}
    />
  );
}
