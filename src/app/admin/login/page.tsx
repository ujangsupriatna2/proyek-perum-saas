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

/* ══════════════════════════════════════════════════════════
   SPACE BATTLE — Canvas Game Background
   ══════════════════════════════════════════════════════════ */

interface Star {
  x: number; y: number; size: number; speed: number; brightness: number;
}

interface Bullet {
  x: number; y: number; speed: number; length: number; opacity: number;
}

interface Meteor {
  x: number; y: number; size: number; speed: number; rotation: number;
  rotSpeed: number; vertices: { angle: number; dist: number }[];
  color: string; craterColor: string; hp: number;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number; color: string;
}

interface Explosion {
  x: number; y: number; particles: Particle[]; ring: { radius: number; opacity: number };
}

function SpaceBattleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const shipRef = useRef({ x: 0, y: 0 });
  const starsRef = useRef<Star[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const meteorsRef = useRef<Meteor[]>([]);
  const explosionsRef = useRef<Explosion[]>([]);
  const scoreRef = useRef(0);
  const lastShotRef = useRef(0);
  const animFrameRef = useRef(0);
  const meteorsDestroyedRef = useRef(0);

  // Generate asteroid-like vertices
  const generateMeteorVertices = (size: number) => {
    const count = 8 + Math.floor(Math.random() * 5);
    return Array.from({ length: count }, (_, i) => ({
      angle: (i / count) * Math.PI * 2,
      dist: size * (0.7 + Math.random() * 0.3),
    }));
  };

  // Create explosion
  const createExplosion = (x: number, y: number, size: number) => {
    const colors = ["#ff6b35", "#ffa62b", "#ff4757", "#ffffff", "#ffd93d", "#ff8c00"];
    const particles: Particle[] = [];
    const count = 15 + Math.floor(size);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 30 + Math.random() * 30,
        size: 1 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    explosionsRef.current.push({
      x, y, particles,
      ring: { radius: 0, opacity: 0.8 },
    });
  };

  // Spawn meteor
  const spawnMeteor = (canvasW: number) => {
    const size = 15 + Math.random() * 35;
    const grays = ["#4a4a5a", "#5a5a6a", "#3d3d4d", "#6b6b7b", "#555568"];
    const craterGrays = ["#333340", "#2a2a38", "#3a3a45"];
    meteorsRef.current.push({
      x: Math.random() * canvasW,
      y: -size * 2,
      size,
      speed: 1 + Math.random() * 2.5,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      vertices: generateMeteorVertices(size),
      color: grays[Math.floor(Math.random() * grays.length)],
      craterColor: craterGrays[Math.floor(Math.random() * craterGrays.length)],
      hp: Math.ceil(size / 15),
    });
  };

  // Draw spaceship
  const drawShip = (ctx: CanvasRenderingContext2D, x: number, y: number, tilt: number) => {
    ctx.save();
    ctx.translate(x, y);

    // Engine glow
    const engineGlow = ctx.createRadialGradient(0, 18, 0, 0, 18, 25);
    engineGlow.addColorStop(0, "rgba(255, 107, 53, 0.6)");
    engineGlow.addColorStop(0.5, "rgba(255, 107, 53, 0.15)");
    engineGlow.addColorStop(1, "transparent");
    ctx.fillStyle = engineGlow;
    ctx.beginPath();
    ctx.arc(0, 18, 25, 0, Math.PI * 2);
    ctx.fill();

    // Flame trail
    const flameLen = 12 + Math.random() * 10;
    ctx.beginPath();
    ctx.moveTo(-6, 16);
    ctx.quadraticCurveTo(-3, 16 + flameLen * 0.6, 0, 16 + flameLen);
    ctx.quadraticCurveTo(3, 16 + flameLen * 0.6, 6, 16);
    const flameGrad = ctx.createLinearGradient(0, 16, 0, 16 + flameLen);
    flameGrad.addColorStop(0, "#ffa62b");
    flameGrad.addColorStop(0.4, "#ff6b35");
    flameGrad.addColorStop(1, "transparent");
    ctx.fillStyle = flameGrad;
    ctx.fill();

    // Ship body - sleek design
    ctx.beginPath();
    // Nose
    ctx.moveTo(0, -24);
    // Right side
    ctx.quadraticCurveTo(5, -18, 8, -8);
    ctx.lineTo(14, 8);
    ctx.lineTo(12, 14);
    ctx.lineTo(6, 16);
    // Bottom
    ctx.lineTo(0, 12);
    // Left side (mirror)
    ctx.lineTo(-6, 16);
    ctx.lineTo(-12, 14);
    ctx.lineTo(-14, 8);
    ctx.lineTo(-8, -8);
    ctx.quadraticCurveTo(-5, -18, 0, -24);
    ctx.closePath();

    // Ship gradient
    const shipGrad = ctx.createLinearGradient(-14, 0, 14, 0);
    shipGrad.addColorStop(0, "#3a3a4a");
    shipGrad.addColorStop(0.3, "#7a7a8a");
    shipGrad.addColorStop(0.5, "#9a9aaa");
    shipGrad.addColorStop(0.7, "#7a7a8a");
    shipGrad.addColorStop(1, "#3a3a4a");
    ctx.fillStyle = shipGrad;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Cockpit
    ctx.beginPath();
    ctx.ellipse(0, -8, 3, 7, 0, 0, Math.PI * 2);
    const cockpitGrad = ctx.createRadialGradient(0, -10, 0, 0, -8, 7);
    cockpitGrad.addColorStop(0, "rgba(140, 200, 255, 0.9)");
    cockpitGrad.addColorStop(0.6, "rgba(60, 120, 200, 0.6)");
    cockpitGrad.addColorStop(1, "rgba(30, 60, 100, 0.4)");
    ctx.fillStyle = cockpitGrad;
    ctx.fill();

    // Wing accents
    ctx.beginPath();
    ctx.moveTo(8, -4);
    ctx.lineTo(14, 8);
    ctx.lineTo(10, 6);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 107, 53, 0.3)";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-8, -4);
    ctx.lineTo(-14, 8);
    ctx.lineTo(-10, 6);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 107, 53, 0.3)";
    ctx.fill();

    ctx.restore();
  };

  // Draw meteor
  const drawMeteor = (ctx: CanvasRenderingContext2D, m: Meteor) => {
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.rotate(m.rotation);

    // Meteor body
    ctx.beginPath();
    m.vertices.forEach((v, i) => {
      const px = Math.cos(v.angle) * v.dist;
      const py = Math.sin(v.angle) * v.dist;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fillStyle = m.color;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Craters
    const craterCount = Math.floor(m.size / 10);
    for (let i = 0; i < craterCount; i++) {
      const cx = (Math.sin(i * 3.7) * m.size * 0.3);
      const cy = (Math.cos(i * 2.3) * m.size * 0.3);
      const cr = 2 + (i % 3) * 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fillStyle = m.craterColor;
      ctx.fill();
    }

    // Damage indicator
    if (m.hp <= 1 && m.size > 20) {
      ctx.beginPath();
      ctx.moveTo(-m.size * 0.3, -m.size * 0.1);
      ctx.lineTo(m.size * 0.2, m.size * 0.3);
      ctx.strokeStyle = "rgba(255, 107, 53, 0.5)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
      // Reinit stars on resize
      starsRef.current = Array.from({ length: 200 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        size: Math.random() * 2 + 0.3,
        speed: 0.2 + Math.random() * 1.5,
        brightness: 0.3 + Math.random() * 0.7,
      }));
      shipRef.current.x = W / 2;
      shipRef.current.y = H * 0.75;
      mouseRef.current.x = W / 2;
      mouseRef.current.y = H * 0.75;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      mouseRef.current.x = e.touches[0].clientX;
      mouseRef.current.y = e.touches[0].clientY;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    let lastMeteorSpawn = 0;
    let frameCount = 0;

    const gameLoop = (time: number) => {
      frameCount++;
      ctx.clearRect(0, 0, W, H);

      // ── Background gradient ──
      const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.8);
      bgGrad.addColorStop(0, "#0d0d1a");
      bgGrad.addColorStop(0.5, "#080812");
      bgGrad.addColorStop(1, "#050508");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // ── Stars ──
      for (const star of starsRef.current) {
        star.y += star.speed;
        if (star.y > H) { star.y = -2; star.x = Math.random() * W; }
        const twinkle = star.brightness + Math.sin(time * 0.002 + star.x) * 0.2;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, twinkle))})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Ship follows mouse with easing ──
      const ship = shipRef.current;
      const mouse = mouseRef.current;
      const ease = 0.08;
      ship.x += (mouse.x - ship.x) * ease;
      ship.y += (mouse.y - ship.y) * ease;
      // Clamp to screen
      ship.x = Math.max(20, Math.min(W - 20, ship.x));
      ship.y = Math.max(30, Math.min(H - 30, ship.y));

      // Calculate tilt based on horizontal velocity
      const tilt = (mouse.x - ship.x) * 0.02;

      // ── Auto-shoot bullets ──
      const shootInterval = 150; // ms
      if (time - lastShotRef.current > shootInterval) {
        lastShotRef.current = time;
        // Double bullets from wing positions
        bulletsRef.current.push(
          { x: ship.x - 10, y: ship.y - 20, speed: 8, length: 12, opacity: 1 },
          { x: ship.x + 10, y: ship.y - 20, speed: 8, length: 12, opacity: 1 },
        );
      }

      // ── Update & Draw Bullets ──
      for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
        const b = bulletsRef.current[i];
        b.y -= b.speed;
        if (b.y < -20) { bulletsRef.current.splice(i, 1); continue; }

        // Bullet glow
        const bulletGlow = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 6);
        bulletGlow.addColorStop(0, "rgba(100, 200, 255, 0.4)");
        bulletGlow.addColorStop(1, "transparent");
        ctx.fillStyle = bulletGlow;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Bullet line
        const grad = ctx.createLinearGradient(b.x, b.y + b.length, b.x, b.y);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(0.5, "rgba(100, 200, 255, 0.8)");
        grad.addColorStop(1, "#ffffff");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y + b.length);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        // Bright tip
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(b.x, b.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Spawn Meteors ──
      const spawnInterval = Math.max(400, 1200 - meteorsDestroyedRef.current * 2);
      if (time - lastMeteorSpawn > spawnInterval) {
        lastMeteorSpawn = time;
        spawnMeteor(W);
      }

      // ── Update & Draw Meteors ──
      for (let i = meteorsRef.current.length - 1; i >= 0; i--) {
        const m = meteorsRef.current[i];
        m.y += m.speed;
        m.rotation += m.rotSpeed;

        // Remove if off screen
        if (m.y > H + m.size * 2) { meteorsRef.current.splice(i, 1); continue; }

        drawMeteor(ctx, m);

        // ── Collision: bullet vs meteor ──
        for (let j = bulletsRef.current.length - 1; j >= 0; j--) {
          const b = bulletsRef.current[j];
          const dx = b.x - m.x;
          const dy = b.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < m.size) {
            m.hp--;
            bulletsRef.current.splice(j, 1);
            if (m.hp <= 0) {
              createExplosion(m.x, m.y, m.size);
              scoreRef.current += Math.floor(m.size);
              meteorsDestroyedRef.current++;
              meteorsRef.current.splice(i, 1);
            } else {
              // Small spark on hit
              for (let k = 0; k < 5; k++) {
                const a = Math.random() * Math.PI * 2;
                explosionsRef.current.push({
                  x: b.x, y: b.y,
                  particles: [{
                    x: b.x, y: b.y,
                    vx: Math.cos(a) * (1 + Math.random() * 2),
                    vy: Math.sin(a) * (1 + Math.random() * 2),
                    life: 1, maxLife: 10 + Math.random() * 10,
                    size: 1 + Math.random(), color: "#ffa62b",
                  }],
                  ring: { radius: 0, opacity: 0 },
                });
              }
            }
            break;
          }
        }
      }

      // ── Update & Draw Explosions ──
      for (let i = explosionsRef.current.length - 1; i >= 0; i--) {
        const exp = explosionsRef.current[i];
        let alive = false;

        // Ring
        if (exp.ring.opacity > 0.01) {
          exp.ring.radius += 3;
          exp.ring.opacity *= 0.92;
          ctx.beginPath();
          ctx.arc(exp.x, exp.y, exp.ring.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 166, 43, ${exp.ring.opacity * 0.5})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          alive = true;
        }

        // Particles
        for (let j = exp.particles.length - 1; j >= 0; j--) {
          const p = exp.particles[j];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.05; // gravity
          p.life -= 1 / p.maxLife;
          if (p.life <= 0) { exp.particles.splice(j, 1); continue; }
          alive = true;
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        if (!alive || exp.particles.length === 0) {
          explosionsRef.current.splice(i, 1);
        }
      }

      // ── Draw Ship ──
      drawShip(ctx, ship.x, ship.y, tilt);

      // ── Ship shield glow (subtle) ──
      const shieldPulse = 0.08 + Math.sin(time * 0.003) * 0.03;
      const shieldGrad = ctx.createRadialGradient(ship.x, ship.y, 10, ship.x, ship.y, 40);
      shieldGrad.addColorStop(0, `rgba(100, 200, 255, ${shieldPulse})`);
      shieldGrad.addColorStop(1, "transparent");
      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.arc(ship.x, ship.y, 40, 0, Math.PI * 2);
      ctx.fill();

      // ── HUD: Score ──
      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`SCORE: ${scoreRef.current}`, 16, 28);
      ctx.fillText(`DESTROYED: ${meteorsDestroyedRef.current}`, 16, 44);

      // ── Vignette overlay ──
      const vignette = ctx.createRadialGradient(W / 2, H / 2, W * 0.25, W / 2, H / 2, W * 0.75);
      vignette.addColorStop(0, "transparent");
      vignette.addColorStop(1, "rgba(0, 0, 0, 0.5)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}

/* ══════════════════════════════════════════════════════════
   MATH CAPTCHA
   ══════════════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════════════
   ANIMATED CARD BORDER
   ══════════════════════════════════════════════════════════ */
function AnimatedBorder() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      className="absolute -inset-[1px] rounded-2xl overflow-hidden opacity-50"
      style={{
        background: "conic-gradient(from 0deg, transparent 0%, rgba(100, 200, 255, 0.15) 25%, transparent 50%, rgba(255, 166, 43, 0.08) 75%, transparent 100%)",
      }}
    />
  );
}

/* ══════════════════════════════════════════════════════════
   STAGGER ANIMATION
   ══════════════════════════════════════════════════════════ */
const stagger = {
  container: { show: { transition: { staggerChildren: 0.08 } } },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  },
};

/* ══════════════════════════════════════════════════════════
   MAIN LOGIN PAGE
   ══════════════════════════════════════════════════════════ */
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050508]">
      {/* ═══ SPACE BATTLE CANVAS ═══ */}
      <SpaceBattleCanvas />

      {/* ═══ LOGIN CARD ═══ */}
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
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors mb-8 group"
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
            className="relative bg-black/60 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-8 md:p-10 overflow-hidden"
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
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
            />

            {/* Icon */}
            <motion.div variants={stagger.item} className="flex justify-center mb-6">
              <div className="relative">
                {/* Pulse ring behind */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0, 0.15] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 w-16 h-16 rounded-2xl bg-cyan-500/10"
                />
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0, 0.1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                  className="absolute -inset-2 rounded-3xl border border-cyan-500/[0.05]"
                />
                <div className="relative w-16 h-16 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg shadow-black/40 border border-white/[0.06]">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Shield className="w-8 h-8 text-cyan-400" />
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
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-cyan-400 transition-colors duration-300" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 focus:border-cyan-400/30 focus:ring-cyan-400/10 rounded-xl transition-all duration-300"
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={stagger.item} className="space-y-2">
                <Label htmlFor="password" className="text-gray-400 text-sm font-medium">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-cyan-400 transition-colors duration-300" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 focus:border-cyan-400/30 focus:ring-cyan-400/10 rounded-xl transition-all duration-300"
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
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-500 hover:text-gray-300 hover:border-gray-600 transition-all shrink-0"
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
                    className="h-12 flex-1 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 focus:border-cyan-400/30 focus:ring-cyan-400/10 rounded-xl text-center font-mono text-lg tracking-wider transition-all duration-300"
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
      </motion.div>
    </div>
  );
}
