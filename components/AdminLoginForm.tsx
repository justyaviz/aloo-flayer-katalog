"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(formData: FormData) {
    setLoading(true); setError("");
    const res = await fetch("/api/auth/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ username:formData.get("username"), password:formData.get("password") }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Xatolik");
    router.push("/admin"); router.refresh();
  }
  return <form action={submit} className="form-grid">
    <div className="field"><label>Login</label><input name="username" autoComplete="username" required /></div>
    <div className="field"><label>Parol</label><input name="password" type="password" autoComplete="current-password" required /></div>
    <button className="btn btn-primary" disabled={loading}>{loading ? "Kirilmoqda..." : "Admin panelga kirish"}</button>
    {error && <div className="notice notice-err">{error}</div>}
  </form>;
}
