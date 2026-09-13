// app/dashboard/create-key-form.tsx
"use client";

import { useState } from "react";
import { createApiKeyAction } from "../actions";

export default function CreateKeyForm() {
    const [createdKey, setCreatedKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const res = await createApiKeyAction(formData);

        if (res?.rawKey) {
            setCreatedKey(res.rawKey);
        }
        setIsSubmitting(false);
    }

    function handleCopy() {
        if (createdKey) {
            navigator.clipboard.writeText(createdKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white">🔑 Generate New API Key</h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex gap-4">
                <input
                    type="text"
                    name="keyName"
                    placeholder="Key Nickname (e.g. Mobile App, Staging)"
                    required
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg transition"
                >
                    {isSubmitting ? "Generating..." : "+ Create Key"}
                </button>
            </form>

            {/* Green Secret Key Banner */}
            {createdKey && (
                <div className="bg-emerald-950/90 border border-emerald-500 rounded-lg p-4 space-y-2 animate-fade-in">
                    <div className="flex justify-between items-center text-emerald-300 font-semibold text-sm">
                        <span>🎉 API Key Created! Copy it now (It will NOT be shown again):</span>
                        <button onClick={() => setCreatedKey(null)} className="text-emerald-400 hover:text-white">✕</button>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950 p-3 rounded border border-emerald-800">
                        <code className="flex-1 font-mono text-emerald-400 text-sm break-all">{createdKey}</code>
                        <button
                            onClick={handleCopy}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-1.5 rounded transition"
                        >
                            {copied ? "✓ Copied!" : "Copy Key"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
