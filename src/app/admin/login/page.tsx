"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail, ArrowLeft, LogIn, Shield, RefreshCw } from "lucide-react";
import { useSettingsStore } from "@/lib/settings-store";

/* ── Simple Math Captcha ── */
function generateCaptcha() {
  const ops = ["+", "-", "×"] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, answer: number;

  switch (op) {
    case "+":
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 50) + 1;
      answer = a + b;
      break;
    case "-":
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * a) + 1;
      answer = a - b;
      break;
    case "×":
      a = Math.floor(Math.random() * 9) + 2;
      b = Math.floor(Math.random() * 9) + 2;
      answer = a * b;
      break;
  }
  return { question: `${a} ${op} ${b}`, answer };
}

function CaptchaCanvas({ text }: { text: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 160, h = 48;
    canvas.width = w;
    canvas.height = h;

    // Background
    ctx.fillStyle = "rgba(17, 24, 39, 0.9)";
    ctx.fillRect(0, 0, w, h);

    // Noise dots
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 100 + 60}, ${Math.random() * 100 + 60}, ${Math.random() * 100 + 60}, ${Math.random() * 0.4 + 0.1})`;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Noise lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 120 + 80}, ${Math.random() * 120 + 80}, ${Math.random() * 120 + 80}, 0.15)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * w, Math.random() * h);
      ctx.bezierCurveTo(Math.random() * w, Math.random() * h, Math.random() * w, Math.random() * h, Math.random() * w, Math.random() * h);
      ctx.stroke();
    }

    // Text
    ctx.font = "bold 22px monospace";
    ctx.textBaseline = "middle";

    const chars = text.split("");
    const totalWidth = chars.reduce((sum, c) => sum + ctx.measureText(c).width, 0);
    let x = (w - totalWidth) / 2;

    chars.forEach((char) => {
      const y = h / 2 + (Math.random() - 0.5) * 10;
      const rot = (Math.random() - 0.5) * 0.3;
      ctx.save();
      ctx.translate(x + ctx.measureText(char).width / 2, y);
      ctx.rotate(rot);
      // Slight color variation per char
      const brightness = Math.floor(Math.random() * 60 + 180);
      ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
      ctx.fillText(char, -ctx.measureText(char).width / 2, 0);
      ctx.restore();
      x += ctx.measureText(char).width + 2;
    });
  }, [text]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg border border-white/[0.08] h-12 w-40"
      style={{ imageRendering: "auto" }}
    />
  );
}

export default function AdminLoginPage() {
  const { settings: S } = useSettingsStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [captcha, setCaptcha] = useState(() => generateCaptcha());
  const router = useRouter();

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
    setCaptchaError("");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCaptchaError("");

    // Verify captcha first
    if (captchaInput.trim() !== String(captcha.answer)) {
      setCaptchaError("Jawaban captcha salah");
      refreshCaptcha();
      return;
    }

    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email atau password salah");
      refreshCaptcha();
    } else {
      router.push("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gray-800/20 blur-3xl animate-orb-drift" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-gray-700/15 blur-3xl" style={{ animationDelay: "3s" }} />
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-gray-600/10 blur-3xl" style={{ animationDelay: "6s" }} />
      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="w-full max-w-md relative z-10 px-4">
        {/* Back to site */}
        <a
          href="/?tab=home"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Website
        </a>

        {/* Login Card */}
        <div className="relative">
          {/* Glow behind card */}
          <div className="absolute -inset-px bg-gradient-to-b from-white/[0.08] to-white/[0.02] rounded-3xl" />
          <div className="relative bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 md:p-10">
            {/* Top accent line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg shadow-black/30">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-500 rounded-full border-2 border-gray-950" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
                Admin Login
              </h1>
              <p className="text-gray-500 text-sm">
                Masuk untuk mengelola website Anda
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-400 text-sm font-medium">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-gray-400 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 bg-white/[0.05] border-white/[0.08] text-white placeholder:text-gray-600 focus:border-gray-500 focus:ring-gray-500/20 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-400 text-sm font-medium">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-gray-400 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 bg-white/[0.05] border-white/[0.08] text-white placeholder:text-gray-600 focus:border-gray-500 focus:ring-gray-500/20 rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Captcha */}
              <div className="space-y-2">
                <Label htmlFor="captcha" className="text-gray-400 text-sm font-medium">Verifikasi Keamanan</Label>
                <div className="flex items-center gap-2.5">
                  <CaptchaCanvas text={captcha.question} />
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.08] text-gray-500 hover:text-gray-300 hover:border-gray-600 transition-all shrink-0"
                    title="Ganti captcha"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <Input
                    id="captcha"
                    type="text"
                    placeholder="= ?"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    className="h-12 flex-1 bg-white/[0.05] border-white/[0.08] text-white placeholder:text-gray-600 focus:border-gray-500 focus:ring-gray-500/20 rounded-xl text-center font-mono text-lg tracking-wider"
                    required
                    autoComplete="off"
                  />
                </div>
                {captchaError && (
                  <p className="text-xs text-red-400 flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                    {captchaError}
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-3.5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-white text-gray-950 hover:bg-gray-100 font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-white/5 active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                    Masuk...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Masuk
                  </span>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
              <p className="text-xs text-gray-600">
                Dilindungi dengan enkripsi end-to-end
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
