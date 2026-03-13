import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  OnDestroy,
  afterNextRender,
  inject,
} from '@angular/core';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

@Component({
  selector: 'app-particle-canvas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas></canvas>`,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      display: block;
      z-index: 0;
      pointer-events: none;
    }
    canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
  `,
})
export class ParticleCanvas implements OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private rafId = 0;
  private mouseX = -9999;
  private mouseY = -9999;
  private resizeObserver!: ResizeObserver;
  private readonly _cleanupFns: Array<() => void> = [];

  private readonly COUNT = 60;
  private readonly CONNECT_DIST = 130;
  private readonly GRAVITY = 0.018;
  private readonly MAX_SPEED = 2.2;
  private readonly FRICTION = 0.97;
  private readonly COLOR = '#1d9bf0';

  constructor() {
    afterNextRender(() => {
      this.canvas = this.el.nativeElement.querySelector('canvas')!;
      this.ctx = this.canvas.getContext('2d')!;
      this.resize();
      this.initParticles();
      this.bindEvents();
      this.loop();
    });
  }

  private resize() {
    const dpr = devicePixelRatio || 1;
    this.canvas.width = innerWidth * dpr;
    this.canvas.height = innerHeight * dpr;
    this.ctx.scale(dpr, dpr);
  }

  private initParticles() {
    this.particles = Array.from({ length: this.COUNT }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 1.8 + 0.8,
      opacity: Math.random() * 0.5 + 0.25,
    }));
  }

  private bindEvents() {
    const onMove = (e: MouseEvent) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    };
    const onLeave = () => {
      this.mouseX = -9999;
      this.mouseY = -9999;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave, { passive: true });
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(document.documentElement);
    this._cleanupFns.push(
      () => window.removeEventListener('mousemove', onMove),
      () => window.removeEventListener('mouseleave', onLeave),
      () => this.resizeObserver.disconnect(),
    );
  }

  private hexToRgba(hex: string, a: number) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  private loop = () => {
    const w = innerWidth;
    const h = innerHeight;
    this.ctx.clearRect(0, 0, w, h);
    for (const p of this.particles) {
      const dx = this.mouseX - p.x;
      const dy = this.mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0 && dist < 400) {
        const force = this.GRAVITY * (1 - dist / 400);
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
      p.vx *= this.FRICTION;
      p.vy *= this.FRICTION;
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > this.MAX_SPEED) {
        p.vx = (p.vx / speed) * this.MAX_SPEED;
        p.vy = (p.vy / speed) * this.MAX_SPEED;
      }
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = this.hexToRgba(this.COLOR, p.opacity);
      this.ctx.fill();
    }
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.CONNECT_DIST) {
          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.strokeStyle = this.hexToRgba(this.COLOR, (1 - dist / this.CONNECT_DIST) * 0.35);
          this.ctx.lineWidth = 0.8;
          this.ctx.stroke();
        }
      }
    }
    this.rafId = requestAnimationFrame(this.loop);
  };

  ngOnDestroy() {
    cancelAnimationFrame(this.rafId);
    this._cleanupFns.forEach((fn) => fn());
  }
}
