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
    variantId: uuid('variant_id').references(() => productVariants.id, {onDelete: 'set null'}),
    secureUrl: text("secure_url").notNull(),
    publicId: text('public_id'),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at",{withTimezone: true,}).defaultNow().notNull(),
}, 
    (table) => [
      // Keep the existing position rule during migration 
        uniqueIndex("product_images_product_position_unique").on(table.productId, table.position),
        // A color variant can have only one image
        uniqueIndex('product_images_variant_unique').on(table.variantId,)
    ]
)

export const productVariants = pgTable(
    'product_variants', 
    {
        id: uuid('id').defaultRandom().primaryKey(),
        productId: uuid('product_id')
          .notNull()
          .references(() => products.id, {
            onDelete: 'cascade',
          }),
        color: varchar('color', { length: 100 })
          .notNull(),
        createdAt: timestamp('created_at', {
          withTimezone: true,
        }).defaultNow().notNull(),
      }, (table) => [
    uniqueIndex('product_variants_product_color_unique').on(table.productId, table.color),
])

export type ProductVariant = typeof productVariants.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;

// product variant sizes schema
export const productVariantSizes = pgTable(
  'product_variant_sizes', {
    id: uuid('id').defaultRandom().primaryKey(),
    variantId: uuid('variant_id').notNull().references(()=>productVariants.id, {onDelete: 'cascade'}),
    size: varchar('size', {length: 50}).notNull(),
    createdAt: timestamp('created_at', {withTimezone: true,}).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('product_variant_sizes_variant_size_unique')
    .on(table.variantId, table.size),
  ]
)

export type ProductVariantSize = typeof productVariantSizes.$inferSelect;

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
    userId: uuid('user_id'),
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
    variantId: uuid('variant_id').references(() => productVariants.id, {onDelete: 'set null'}),
    color: varchar('color', {length: 100}),
    size: varchar('size', {length: 50}),
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

// profile schema
export const profiles = pgTable('profiles', {
    id: uuid('id').primaryKey(),
  
    name: varchar('name', {
      length: 150,
    }).notNull(),
  
    phone: varchar('phone', {
      length: 50,
    }),
  
    role: varchar('role', {
      length: 50,
    })
      .default('Customer')
      .notNull(),
  
    avatarUrl: text('avatar_url'),
  
    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  });
  
  export type Profile = typeof profiles.$inferSelect;
  export type NewProfile = typeof profiles.$inferInsert;