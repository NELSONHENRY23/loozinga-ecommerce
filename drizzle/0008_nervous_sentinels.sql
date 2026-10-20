DROP INDEX "variant_size_unique";--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "size" SET DATA TYPE varchar(50);--> statement-breakpoint
CREATE UNIQUE INDEX "product_variant_sizes_variant_size_unique" ON "product_variant_sizes" USING btree ("variant_id","size");