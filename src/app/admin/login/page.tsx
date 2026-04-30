"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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

    ctx.fillStyle = "rgba(17, 24, 39, 0.9)";
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 100 + 60}, ${Math.random() * 100 + 60}, ${Math.random() * 100 + 60}, ${Math.random() * 0.4 + 0.1})`;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 120 + 80}, ${Math.random() * 120 + 80}, ${Math.random() * 120 + 80}, 0.15)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * w, Math.random() * h);
      ctx.bezierCurveTo(Math.random() * w, Math.random() * h, Math.random() * w, Math.random() * h, Math.random() * w, Math.random() * h);
      ctx.stroke();
    }

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

/* ── Floating Particles ── */
function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: `${(i * 3.33) % 100}%`,
    y: `${(i * 7.7 + 10) % 100}%`,
    size: 1 + (i % 3),
    duration: 8 + (i % 5) * 3,
    delay: i * 0.4,
    opacity: 0.1 + (i % 4) * 0.08,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          animate={{
            y: [0, -60 - p.size * 15, -20, 0],
            x: [0, 15 + p.size * 5, -10, 0],
            opacity: [p.opacity, p.opacity * 2.5, p.opacity * 1.2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
          className="absolute rounded-full bg-white"
          style={{
            width: p.size,
            height: p.size,
            left: p.x,
            top: p.y,
          }}
        />
      ))}
    </div>
  );
}

/* ── Animated Grid Lines ── */
function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
      {/* Horizontal lines */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={`h-${i}`}
          className="absolute left-0 right-0 h-px bg-white"
          style={{ top: `${(i + 1) * 6.67}%` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: 1.5,
            delay: i * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      ))}
      {/* Vertical lines */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={`v-${i}`}
          className="absolute top-0 bottom-0 w-px bg-white"
          style={{ left: `${(i + 1) * 6.67}%` }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{
            duration: 1.5,
            delay: i * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      ))}
    </div>
  );
}

/* ── Geometric Shapes ── */
function GeometricShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Top-left rotating ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute top-[10%] left-[5%] w-24 h-24 border border-white/[0.04] rounded-full"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[12%] left-[7%] w-16 h-16 border border-white/[0.06] rounded-full"
      />

      {/* Bottom-right rotating squares */}
      <motion.div
        animate={{ rotate: 45 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[15%] right-[8%] w-20 h-20 border border-white/[0.04]"
      />
      <motion.div
        animate={{ rotate: -45 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[18%] right-[11%] w-12 h-12 border border-white/[0.06]"
      />

      {/* Top-right triangle */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] right-[15%] w-0 h-0"
        style={{
          borderLeft: "15px solid transparent",
          borderRight: "15px solid transparent",
          borderBottom: "26px solid rgba(255,255,255,0.03)",
        }}
      />

      {/* Bottom-left dot cluster */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -8, 0], opacity: [0.03, 0.08, 0.03] }}
          transition={{ duration: 4, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
          className="absolute rounded-full bg-white"
          style={{
            bottom: `${25 + i * 4}%`,
            left: `${12 + i * 3}%`,
            width: 3 + i * 2,
            height: 3 + i * 2,
          }}
        />
      ))}

      {/* Center cross */}
      <motion.div
        animate={{ rotate: 90 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8"
      >
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/[0.03]" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/[0.03]" />
      </motion.div>
    </div>
  );
}

/* ── Animated Border ── */
function AnimatedBorder() {
  return (
    <>
      {/* Rotating conic gradient border */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute -inset-[1px] rounded-3xl overflow-hidden opacity-50"
        style={{
          background: "conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.1) 25%, transparent 50%, rgba(255,255,255,0.05) 75%, transparent 100%)",
        }}
      />
    </>
  );
}

const stagger = {
  container: { show: { transition: { staggerChildren: 0.08 } } },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  },
};

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
      {/* ═══ Layer 1: Base gradient ═══ */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />

      {/* ═══ Layer 2: Animated Grid ═══ */}
      <AnimatedGrid />

      {/* ═══ Layer 3: Floating Orbs ═══ */}
      <motion.div
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-gray-700/10 to-gray-800/10 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -30, 20, 0], y: [0, 20, -30, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-gray-600/10 to-gray-700/10 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 25, -15, 0], y: [0, -15, 25, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-gray-500/8 to-transparent blur-3xl"
      />

      {/* ═══ Layer 4: Geometric Shapes ═══ */}
      <GeometricShapes />

      {/* ═══ Layer 5: Floating Particles ═══ */}
      <FloatingParticles />

      {/* ═══ Layer 6: Scanning line ═══ */}
      <motion.div
        animate={{ top: ["-2%", "102%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 2 }}
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent pointer-events-none"
      />

      {/* ═══ Layer 7: Pulsing rings from center ═══ */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [0.5, 2.5], opacity: [0.06, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 1.3,
              ease: "easeOut",
            }}
            className="absolute inset-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-white"
          />
        ))}
      </div>

      {/* ═══ Content ═══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10 px-4"
      >
        {/* Back to site */}
        <motion.a
          href="/?tab=home"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Website
        </motion.a>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Animated border glow */}
          <AnimatedBorder />

          {/* Card body */}
          <motion.div
            variants={stagger.container}
            initial="hidden"
            animate="show"
            className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 md:p-10 overflow-hidden"
          >
            {/* Shimmer sweep on card */}
            <motion.div
              animate={{ x: ["-200%", "200%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 w-[50%] bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none"
            />

            {/* Top accent line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />

            {/* Icon */}
            <motion.div variants={stagger.item} className="flex justify-center mb-6">
              <div className="relative">
                {/* Pulse ring behind */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0, 0.15] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 w-16 h-16 rounded-2xl bg-white/10"
                />
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0, 0.1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                  className="absolute -inset-2 rounded-3xl border border-white/[0.05]"
                />
                <div className="relative w-16 h-16 bg-gradient-to-br from-gray-600 via-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg shadow-black/40">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Shield className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.8, stiffness: 300 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-gray-950"
                />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div variants={stagger.item} className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
                Admin Login
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-gray-500 text-sm"
              >
                Masuk untuk mengelola website Anda
              </motion.p>
            </motion.div>

            {/* Form */}
            <motion.form
              variants={stagger.container}
              initial="hidden"
              animate="show"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <motion.div variants={stagger.item} className="space-y-2">
                <Label htmlFor="email" className="text-gray-400 text-sm font-medium">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-gray-300 transition-colors duration-300" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 bg-white/[0.05] border-white/[0.08] text-white placeholder:text-gray-600 focus:border-white/20 focus:ring-white/10 rounded-xl transition-all duration-300"
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={stagger.item} className="space-y-2">
                <Label htmlFor="password" className="text-gray-400 text-sm font-medium">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-gray-300 transition-colors duration-300" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 bg-white/[0.05] border-white/[0.08] text-white placeholder:text-gray-600 focus:border-white/20 focus:ring-white/10 rounded-xl transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>

              {/* Captcha */}
              <motion.div variants={stagger.item} className="space-y-2">
                <Label htmlFor="captcha" className="text-gray-400 text-sm font-medium">Verifikasi Keamanan</Label>
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <CaptchaCanvas text={captcha.question} />
                  </div>
                  <motion.button
                    type="button"
                    onClick={refreshCaptcha}
                    whileHover={{ scale: 1.05, rotate: 180 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.08] text-gray-500 hover:text-gray-300 hover:border-gray-600 transition-all shrink-0"
                    title="Ganti captcha"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.button>
                  <Input
                    id="captcha"
                    type="text"
                    placeholder="= ?"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    className="h-12 flex-1 bg-white/[0.05] border-white/[0.08] text-white placeholder:text-gray-600 focus:border-white/20 focus:ring-white/10 rounded-xl text-center font-mono text-lg tracking-wider transition-all duration-300"
                    required
                    autoComplete="off"
                  />
                </div>
                {captchaError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 flex items-center gap-1.5"
                  >
                    <div className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                    {captchaError}
                  </motion.p>
                )}
              </motion.div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-3.5 flex items-center gap-2"
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"
                  />
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.div variants={stagger.item}>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-white text-gray-950 hover:bg-gray-100 font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-white/10 relative overflow-hidden group"
                  >
                    {/* Shimmer sweep on button */}
                    <div className="absolute inset-0 w-[50%] bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    {loading ? (
                      <span className="flex items-center gap-2 relative z-10">
                        <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                        Masuk...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 relative z-10">
                        <LogIn className="w-4 h-4" />
                        Masuk
                      </span>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-8 pt-6 border-t border-white/[0.06] text-center"
            >
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center justify-center gap-1.5 mb-2"
              >
                <div className="w-1 h-1 rounded-full bg-emerald-500/60" />
                <span className="text-[10px] font-medium uppercase tracking-widest text-emerald-500/60">Secure</span>
                <div className="w-1 h-1 rounded-full bg-emerald-500/60" />
              </motion.div>
              <p className="text-xs text-gray-600">
                Dilindungi dengan enkripsi end-to-end
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent origin-center"
        />
      </motion.div>
    </div>
  );
}
