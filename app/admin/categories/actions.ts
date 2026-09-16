"use server";


import { db } from "@/app/db";
import { categories, products } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
    name: z.string().trim().min(1, "Category name is required").max(100, "Category name is too long"),
    status: z.enum(["Active", "Inactive"]),
});

type CategoryInput = z.infer<typeof categorySchema>;

type ActionResult = {
    success: boolean;
    message: string;
}

export async function createCategory(input: CategoryInput): Promise<ActionResult>{
    const result = categorySchema.safeParse(input);

    if(!result.success){
        return {
            success: false,
            message: result.error.issues[0]?.message ?? "Invalid category",
        };
    }

    try{
        await db.insert(categories).values({
            name: result.data.name,
            status: result.data.status,
        });

        revalidatePath("/admin/categories");

        return {
            success: true,
            message: "Category created successfully",
        };

    }catch(error){
        console.log("CREATE CATEGORY ERROR", error);
        return{
            success: false,
            message: "Failed to add category",
        }
    }

}

export async function updateCategory(categoryId: number, input: CategoryInput): Promise<ActionResult>{
    const result = categorySchema.safeParse(input);

    if(!result.success){
        return{
            success: false,
            message: 
            result.error.issues[0]?.message ??
            "Invalid category",
        }
    }

    try {
        await db.update(categories).set({
            name: result.data.name,
            status: result.data.status,
        }).where(eq(categories.id, categoryId));

        revalidatePath("/admin/categories");

        return{
            success: true,
            message: "Category updated successfully",
        };
        
    } catch (error) {
        console.log("UPDATE CATEGORY ERROR", error);

        return{
            success: false,
            message: "Failed to update category",
        }
    }
}

export async function deleteCategory(categoryId: number): Promise<ActionResult>{
    // Validate the category ID.
    if(!Number.isSafeInteger(categoryId) || categoryId <= 0){
        return{
            success: false,
            message: "Invalid category ID."
        }
    }    
    try{
        // Check whether the category contains products
        const exisitingProducts = await db.select({id: products.id}).from(products).where(eq(products.categoryId, categoryId)).limit(1);

        // Prevent deletion if products exist
        if(exisitingProducts.length > 0){
            return {
                success: false,
                message: "Cannot delete this category because it contains products. Move or delete those products first."
            }
        }

        // Delete the category.
        const deleteCategory = await db.delete(categories).where(eq(categories.id, categoryId)).returning({id: categories.id});

        // Handle nonexistent categories.
        if(deleteCategory.length === 0){
            return {
                success: false,
                message: "Category not found."
            }
        }

        // Refresh affected pages
        revalidatePath("/admin/categories");
        revalidatePath("/admin/products");

        return{
            success: true,
            message: "Category deleted successfully",
        }

    }catch(error){
        console.log("DELETE CATEGORY ERROR:",error);

        return{
            success: false,
            message: "Failed to delete category"
        }
    }
}