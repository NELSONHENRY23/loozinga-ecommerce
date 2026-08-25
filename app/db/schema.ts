import {
    pgEnum,
    pgTable,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';

// Categories Schema
export const categoryStatusEnum = pgEnum(
    'category_status',
    ['Active', 'Inactive']
);

export const categories = pgTable('categories', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', {length: 100}).notNull().unique(),
    status: categoryStatusEnum('status').default('Active').notNull(),
    createdAt: timestamp('created_at', {
        withTimezone: true,
    }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at',{
        withTimezone: true,
    }).defaultNow().notNull(),

})