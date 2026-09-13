// app/actions.ts
"use server";

import { db } from "@/src/lib/db";
import { generateApiKey } from "@/src/lib/security";
import { revalidatePath } from "next/cache";

// 1. Get or create a default test user
export async function getOrCreateTestUser() {
    let user = await db.user.findFirst();

    if (!user) {
        user = await db.user.create({
            data: {
                name: "Vijay (Developer)",
                email: "vijay@example.com",
            },
        });
    }

    return user;
}

// 2. Server Action to Generate a new API Key
export async function createApiKeyAction(formData: FormData) {
    const name = (formData.get("keyName") as string) || "Default API Key";

    // Ensure user exists
    const user = await getOrCreateTestUser();

    // Generate secure key tuple (rawKey, keyHash, keyDisplay)
    const { rawKey, keyHash, keyDisplay } = generateApiKey();

    // Save keyHash in Database
    await db.apiKey.create({
        data: {
            name,
            keyHash,
            keyDisplay,
            userId: user.id,
        },
    });

    // Refresh dashboard UI automatically
    revalidatePath("/dashboard");

    // Return the secret raw key so the UI can display it ONCE
    return { success: true, rawKey };
}

// 3. Server Action to Revoke/Deactivate an API Key
export async function revokeApiKeyAction(keyId: string) {
    await db.apiKey.update({
        where: { id: keyId },
        data: { isActive: false },
    });

    revalidatePath("/dashboard");
}
