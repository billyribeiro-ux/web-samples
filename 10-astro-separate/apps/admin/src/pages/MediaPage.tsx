import { FormEvent, useState } from "react";
import { apiFetch } from "../lib/api";

export default function MediaPage() {
  const [log, setLog] = useState("");

  async function presign(e: FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const filename = String(fd.get("filename") ?? "file.bin");
    const mimeType = String(fd.get("mime") ?? "application/octet-stream");
    const bytes = Number(fd.get("bytes") ?? 1024);
    const res = await apiFetch("/v1/admin/media/presign", {
      method: "POST",
      body: JSON.stringify({ filename, mimeType, bytes }),
    });
    const j = await res.json().catch(() => ({}));
    setLog(res.ok ? JSON.stringify(j, null, 2) : j?.error?.message ?? "Failed (configure S3 env vars)");
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Media</h1>
      <p className="mt-2 text-sm text-slate-600">Request a presigned upload URL (requires S3 configuration).</p>
      <form className="mt-6 max-w-md space-y-3 rounded border border-slate-200 bg-white p-4 text-sm" onSubmit={(e) => void presign(e)}>
        <input className="w-full rounded border px-2 py-1" name="filename" placeholder="filename" defaultValue="hero.png" />
        <input className="w-full rounded border px-2 py-1" name="mime" placeholder="mime" defaultValue="image/png" />
        <input className="w-full rounded border px-2 py-1" name="bytes" type="number" defaultValue={12000} />
        <button className="rounded bg-blue-600 px-3 py-1 font-semibold text-white" type="submit">
          Get presign
        </button>
      </form>
      {log && <pre className="mt-4 max-w-2xl overflow-auto rounded bg-slate-900 p-3 text-xs text-green-200">{log}</pre>}
    </div>
  );
}
