import {
    pgEnum,
    pgTable,
    uuid,
    timestamp,
    serial,
    varchar,
    integer,
    numeric,
    uniqueIndex,
    text,
} from 'drizzle-orm/pg-core';

// Categories Schema
export const categoryStatusEnum = pgEnum(
    'category_status',
    ['Active', 'Inactive']
);

export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: varchar('name', {length: 100}).notNull().unique(),
    status: categoryStatusEnum('status').default('Active').notNull(),
    createdAt: timestamp('created_at', {
        withTimezone: true,
    }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at',{
        withTimezone: true,
    }).defaultNow().notNull(),

})

// Products schema
export const products = pgTable("products", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", {length: 255,}).notNull(),
    description: text("description").notNull(),
    price: numeric("price",{precision: 10, scale: 2, mode: "number",}).notNull(),
    offer: integer("offer").default(0).notNull(),
    color: varchar("color",{length: 100,}).notNull(),
    categoryId: integer("category_id").notNull().references(()=> categories.id, {onDelete: "restrict",}),
    createdAt: timestamp("created_at", {withTimezone: true,}).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", {withTimezone: true,}).defaultNow().notNull(),
})

// Product Images schema
export const productImages = pgTable("product_images", {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    secureUrl: text("secure_url").notNull(),
    publicId: text('public_id'),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at",{withTimezone: true,}).defaultNow().notNull(),
}, 
    (table) => [
        uniqueIndex("product_images_product_position_unique").on(table.productId, table.position)
    ]
)

export type Product = typeof products.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;

// Orders Schema
export const paymentMethodEnum = pgEnum('payment_method', [
    'COD',
    'Stripe',
])

export const paymentStatusEnum = pgEnum('payment_status',[
    'Paid',
    'Pending',
])

export const orderStatusEnum = pgEnum('order_status', [
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
])

export const orders = pgTable('orders',{
    id: uuid('id').defaultRandom().primaryKey(),
    orderNumber: text('order_number').notNull().unique(),
    customerName: text('customer_name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull(),
    street: text('street').notNull(),
    city: text('city').notNull(),
    country:text('country').notNull(),
    total: numeric('total', {precision: 10, scale: 2,}).notNull(),
    paymentMethod: paymentMethodEnum('payment_method').notNull(),
    paymentStatus: paymentStatusEnum('payment_status').notNull().default('Pending'),
    orderStatus: orderStatusEnum('order_status').notNull().default('Processing'),
    createdAt: timestamp('created_at', {withTimezone:true}).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', {withTimezone:true}).defaultNow().notNull(),

})

export const orderItems = pgTable('order_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id').notNull().references(() => orders.id, {onDelete: 'cascade'}),
    productId: uuid('product_id').references(() => products.id, {onDelete: 'set null'}),
    productName: text('product_name').notNull(),
    quantity: integer('quantity').notNull(),
    price: numeric('price', {precision: 10, scale: 2}).notNull(),
    createdAt: timestamp('created_at', {withTimezone: true,}).defaultNow().notNull(),
})

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export type OrderStatus = Order['orderStatus'];
export type PaymentStatus = Order['paymentStatus'];
export type PaymentMethod = Order['paymentMethod'];
