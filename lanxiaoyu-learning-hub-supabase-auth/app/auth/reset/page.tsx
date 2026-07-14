"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/app/lib/supabase-browser";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const supabase = getSupabaseBrowserClient();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setMessage("Supabase 尚未配置，请联系管理员。");
      return;
    }
    if (password.length < 6) {
      setMessage("密码至少需要6位。");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("两次输入的密码不一致。");
      return;
    }

    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("密码已更新，即将返回学习中心。");
    window.setTimeout(() => window.location.assign("/"), 1200);
  };

  return (
    <main className="auth-page-shell">
      <section className="auth-panel auth-reset-panel">
        <span className="drawer-kind">学员账户</span>
        <h2>设置新密码</h2>
        <p className="auth-intro">请设置一个新的登录密码。密码由 Supabase Auth 安全保存，网站不会保存明文密码。</p>
        <form className="auth-form" onSubmit={submit}>
          <label><span>新密码</span><input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" placeholder="至少6位" /></label>
          <label><span>确认新密码</span><input required minLength={6} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" placeholder="再次输入" /></label>
          {message && <p className="auth-message" role="status">{message}</p>}
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? "处理中…" : "更新密码"}</button>
        </form>
        <Link className="auth-back-link" href="/">返回学习中心</Link>
      </section>
    </main>
  );
}
