// app/dashboard/page.tsx
import { db } from "@/src/lib/db";
import { getOrCreateTestUser, createApiKeyAction, revokeApiKeyAction } from "../actions";

import CreateKeyForm from "./create-key-form";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    // 1. Fetch user & their API keys + logs directly on the server
    const user = await getOrCreateTestUser();

    const apiKeys = await db.apiKey.findMany({
        where: { userId: user.id },
        include: { logs: { orderBy: { createdAt: "desc" }, take: 5 } },
        orderBy: { createdAt: "desc" },
    });

    const allLogs = await db.apiLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { apiKey: true },
    });

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-blue-400">⚡ NexusEngine Dashboard</h1>
                        <p className="text-slate-400 text-sm mt-1">Logged in as: {user.name} ({user.email})</p>
                    </div>
                    <a href="/" className="text-sm text-slate-400 hover:text-white transition">← Home</a>
                </div>

                {/* Action: Create Key Form (Client Component) */}
                <CreateKeyForm />

                {/* Active Keys Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4 text-white">📋 Your API Keys</h2>
                    {apiKeys.length === 0 ? (
                        <p className="text-slate-500 text-sm">No API keys generated yet. Create one above!</p>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {apiKeys.map((key) => (
                                <div key={key.id} className="py-4 flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-white">{key.name}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${key.isActive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
                                                {key.isActive ? "ACTIVE" : "REVOKED"}
                                            </span>
                                        </div>
                                        <p className="font-mono text-sm text-slate-400 mt-1">Preview: {key.keyDisplay}</p>
                                    </div>
                                    {key.isActive && (
                                        <form action={revokeApiKeyAction.bind(null, key.id)}>
                                            <button type="submit" className="text-xs bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 px-3 py-1.5 rounded transition">
                                                Revoke Key
                                            </button>
                                        </form>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Live Logs Section */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4 text-white">📊 Live Security & Request Logs</h2>
                    {allLogs.length === 0 ? (
                        <p className="text-slate-500 text-sm">No API request logs recorded yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {allLogs.map((log) => (
                                <div key={log.id} className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800 text-sm font-mono">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 rounded font-bold text-xs ${log.status === 200 ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-900 text-amber-300'}`}>
                                            {log.status}
                                        </span>
                                        <span className="text-slate-300">{log.endpoint}</span>
                                        <span className="text-slate-500">({log.apiKey.name})</span>
                                    </div>
                                    <span className="text-slate-500 text-xs">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
