"use server";


import { db } from "@/app/db";
import { categories } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
    name: z.string().trim().min(1, "Category name is required").max(255, "Category name is too long"),
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
    try{
        await db.delete(categories).where(eq(categories.id, categoryId));

        revalidatePath("/admin/categories");

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