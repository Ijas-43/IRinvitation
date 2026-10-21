import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { isLowEndDevice, prefersReducedMotion } from '../shared/animations';

type ParticleKind = 'petal' | 'sparkle' | 'heart';

interface Particle {
  kind: ParticleKind;
  x: number;
  y: number;
  size: number;
  speedY: number;
  drift: number;
  phase: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  hue: number;
}

/**
 * Lightweight atmospheric layer: floating rose petals at different depths,
 * soft golden sparkles and the occasional heart.
 * - pauses when the tab is hidden
 * - thins out on small / low-end devices
 * - never runs when the visitor prefers reduced motion
 */
@Component({
  selector: 'app-particles',
  standalone: true,
  template: `<canvas #canvas class="particles-canvas" aria-hidden="true"></canvas>`,
  styles: [
    `
      :host {
        position: fixed;
        inset: 0;
        /* sits behind the hero (z-index 2) so the couple's names are never
           veiled by drifting petals, but still floats over the soft sections */
        z-index: 1;
        pointer-events: none;
        display: block;
      }
      .particles-canvas {
        width: 100%;
        height: 100%;
        display: block;
        pointer-events: none;
      }
    `,
  ],
})
export class ParticlesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx?: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private raf = 0;
  private running = false;
  private dpr = 1;
  private w = 0;
  private h = 0;
  private resizeTimer?: ReturnType<typeof setTimeout>;
  private reduced = false;
  private lowEnd = false;

  constructor(
    private zone: NgZone,
    private host: ElementRef<HTMLElement>,
  ) {}

  ngAfterViewInit(): void {
    this.reduced = prefersReducedMotion();
    this.lowEnd = isLowEndDevice();

    if (this.reduced) {
      this.host.nativeElement.style.display = 'none';
      return;
    }

    this.ctx = this.canvasRef.nativeElement.getContext('2d') ?? undefined;
    this.resize();
    this.seed();

    // Angular zone would re-run change detection on every frame — opt out.
    this.zone.runOutsideAngular(() => {
      this.running = true;
      this.loop();
    });

    document.addEventListener('visibilitychange', this.onVisibility);
  }

  @HostListener('window:resize')
  onResize(): void {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.resize();
      this.seed();
    }, 180);
  }

  private onVisibility = (): void => {
    if (document.hidden) {
      this.running = false;
      cancelAnimationFrame(this.raf);
    } else if (!this.reduced && this.ctx) {
      this.running = true;
      this.zone.runOutsideAngular(() => this.loop());
    }
  };

  private resize(): void {
    const c = this.canvasRef.nativeElement;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    c.width = Math.floor(this.w * this.dpr);
    c.height = Math.floor(this.h * this.dpr);
    c.style.width = this.w + 'px';
    c.style.height = this.h + 'px';
    this.ctx?.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  private seed(): void {
    const area = this.w * this.h;
    // ~1 particle per 46k px² on desktop, halved on phones / low-end chips.
    let target = Math.round(area / 46000);
    if (this.w < 760) target = Math.round(target * 0.45);
    if (this.lowEnd) target = Math.round(target * 0.5);
    target = Math.max(6, Math.min(target, 46));

    this.particles = [];
    for (let i = 0; i < target; i++) this.particles.push(this.make(true));
  }

  private make(scatter: boolean): Particle {
    const roll = Math.random();
    const kind: ParticleKind = roll > 0.86 ? 'heart' : roll > 0.52 ? 'sparkle' : 'petal';
    const depth = 0.35 + Math.random() * 0.65; // 0.35 (far) .. 1 (near)
    return {
      kind,
      x: Math.random() * this.w,
      y: scatter ? Math.random() * this.h : -30 - Math.random() * 120,
      size: kind === 'sparkle' ? 2 + depth * 4 : 7 + depth * 14,
      speedY: (kind === 'sparkle' ? 6 : 16) + depth * (kind === 'heart' ? 26 : 34),
      drift: (Math.random() - 0.5) * 26,
      phase: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 1.4,
      opacity: (kind === 'sparkle' ? 0.5 : 0.3) + depth * 0.4,
      hue: Math.random(),
    };
  }

  private loop = (): void => {
    if (!this.running || !this.ctx) return;
    const ctx = this.ctx;
    const dt = 1 / 60;

    ctx.clearRect(0, 0, this.w, this.h);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.phase += dt * 1.1;
      p.y += p.speedY * dt;
      p.x += Math.sin(p.phase) * 0.5 + p.drift * dt;
      p.rotation += p.rotationSpeed * dt;

      if (p.y > this.h + 60 || p.x < -80 || p.x > this.w + 80) {
        this.particles[i] = this.make(false);
        continue;
      }

      const twinkle =
        p.kind === 'sparkle' ? 0.45 + 0.55 * Math.abs(Math.sin(p.phase * 2.1)) : 1;
      ctx.globalAlpha = Math.min(1, p.opacity * twinkle);

      if (p.kind === 'petal') this.drawPetal(ctx, p);
      else if (p.kind === 'heart') this.drawHeart(ctx, p);
      else this.drawSparkle(ctx, p);
    }

    ctx.globalAlpha = 1;
    this.raf = requestAnimationFrame(this.loop);
  };

  private drawPetal(ctx: CanvasRenderingContext2D, p: Particle): void {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    const near = p.size / 21;
    const g = ctx.createLinearGradient(0, -p.size, 0, p.size);
    g.addColorStop(0, p.hue > 0.5 ? '#f9c8da' : '#f7b3cc');
    g.addColorStop(1, p.hue > 0.5 ? '#e75480' : '#d97e9e');
    ctx.fillStyle = g;
    ctx.beginPath();
    // simple rose-petal shape
    ctx.moveTo(0, -p.size * 0.55);
    ctx.bezierCurveTo(
      p.size * 0.62,
      -p.size * 0.35,
      p.size * 0.5,
      p.size * 0.5,
      0,
      p.size * 0.55,
    );
    ctx.bezierCurveTo(
      -p.size * 0.5,
      p.size * 0.5,
      -p.size * 0.62,
      -p.size * 0.35,
      0,
      -p.size * 0.55,
    );
    ctx.fill();
    ctx.strokeStyle = `rgba(255,255,255,${0.3 * near})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  private drawHeart(ctx: CanvasRenderingContext2D, p: Particle): void {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.sin(p.phase) * 0.3);
    ctx.scale(p.size / 24, p.size / 24);
    ctx.fillStyle = 'rgba(231,84,128,0.75)';
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.bezierCurveTo(-14, -4, -9, -18, 0, -10);
    ctx.bezierCurveTo(9, -18, 14, -4, 0, 8);
    ctx.fill();
    ctx.restore();
  }

  private drawSparkle(ctx: CanvasRenderingContext2D, p: Particle): void {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    const s = p.size;
    ctx.fillStyle = p.hue > 0.4 ? '#f4dca8' : '#ffd9e7';
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(s * 0.22, -s * 0.22, 0, -s);
      ctx.quadraticCurveTo(-s * 0.22, -s * 0.22, 0, 0);
    }
    ctx.fill();
    ctx.restore();
  }

  ngOnDestroy(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
    clearTimeout(this.resizeTimer);
    document.removeEventListener('visibilitychange', this.onVisibility);
  }
}
