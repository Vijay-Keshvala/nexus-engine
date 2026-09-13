import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-extrabold text-blue-500 mb-4">
        NexusEngine API Gateway
      </h1>
      <p className="text-slate-400 max-w-md mb-8">
        Production-grade Developer API Gateway with Rate Limiting, API Key Security & Webhook Logs.
      </p>
      <Link
        href="/dashboard"
        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition"
      >Go to Developer dashboard</Link>
    </main>
  );
}
