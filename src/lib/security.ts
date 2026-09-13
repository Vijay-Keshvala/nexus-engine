import crypto from "crypto";

// 1. Generate a new random API key (e.g. nx_live_7f8a9b2c...)

export function generateApiKey(): { rawKey: string; keyHash: string; keyDisplay: string } {
    const randomBytes = crypto.randomBytes(16).toString("hex");
    const rawKey = `nx_live_${randomBytes}`;

    // Hashing the raw key usign ssh-256

    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    // Truncate key for UI display (shows nx_live_...9b2c)
    const keyDisplay = `${rawKey.slice(0, 8)}...${rawKey.slice(-4)}`;
    return { rawKey, keyHash, keyDisplay };
}

// 2. Hash an incoming key to verify against database
export function hashApiKey(rawKey: string): string {
    return crypto.createHash("sha256").update(rawKey).digest("hex");

}