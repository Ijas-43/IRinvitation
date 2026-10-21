import { Component, InjectionToken, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { BurstEvent, EffectsService } from './effects.service';

/** How long each burst lives on screen (ms). */
const LIFETIME = 1600;

/** Injection token so any component can fire a burst without a direct import. */
export const EFFECTS = new InjectionToken<EffectsService>('EFFECTS');

/**
 * Renders the surprise interactions: a burst of rose petals, golden sparkles
 * or flying hearts at exact screen coordinates.
 */
@Component({
  selector: 'app-effects',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="burst-layer" aria-hidden="true">
      <div
        *ngFor="let b of bursts; trackBy: trackById"
        class="burst"
        [style.left.px]="b.x"
        [style.top.px]="b.y"
      >
        <i
          *ngFor="let p of b.parts; trackBy: trackByIndex"
          [class]="'particle ' + b.kind"
          [style.--bx]="p.bx + 'px'"
          [style.--by]="p.by + 'px'"
          [style.--br]="p.br + 'deg'"
          [style.animation-delay.ms]="p.delay"
          [style.width.px]="p.size"
          [style.height.px]="p.size"
          >{{ b.kind === 'hearts' || b.kind === 'blessing' ? '♥' : b.kind === 'sparkles' ? '✦' : '' }}</i
        >
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        position: fixed;
        inset: 0;
        z-index: 60;
        pointer-events: none;
        display: block;
      }
      .burst-layer {
        position: absolute;
        inset: 0;
        overflow: hidden;
      }
      .burst {
        position: absolute;
        width: 0;
        height: 0;
      }
      .particle {
        position: absolute;
        left: -10px;
        top: -10px;
        display: block;
        border-radius: 80% 0 80% 0;
        background: linear-gradient(135deg, #f9c2d6, #e75480);
        opacity: 0;
        animation: petal-burst 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        will-change: transform, opacity;
      }
      .particle.sparkles {
        background: radial-gradient(circle, #fff6df, #d4af77);
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(212, 175, 119, 0.9);
        animation-name: sparkle-burst;
      }
      .particle.hearts,
      .particle.blessing {
        background: none;
        color: #e75480;
        font-style: normal;
        font-size: 18px;
        line-height: 1;
        border-radius: 0;
        text-shadow: 0 2px 8px rgba(231, 84, 128, 0.5);
        animation-name: heart-fly;
      }
      .particle.blessing {
        color: var(--gold);
        text-shadow: 0 2px 10px rgba(212, 175, 119, 0.8);
      }
      @keyframes sparkle-burst {
        0% {
          transform: translate3d(0, 0, 0) scale(0.2);
          opacity: 0;
        }
        25% {
          opacity: 1;
        }
        100% {
          transform: translate3d(var(--bx), var(--by), 0) scale(1.1);
          opacity: 0;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .particle {
          animation-duration: 0.01ms !important;
        }
      }
    `,
  ],
})
export class EffectsComponent implements OnInit, OnDestroy {
  bursts: Array<BurstEvent & { parts: Part[] }> = [];
  private sub?: Subscription;

  trackById = (_: number, b: BurstEvent) => b.id;
  trackByIndex = (i: number) => i;

  constructor(
    private effects: EffectsService,
    private zone: NgZone,
  ) {}

  ngOnInit(): void {
    this.sub = this.effects.bursts$.subscribe((event) => this.spawn(event));
  }

  private spawn(event: BurstEvent): void {
    const parts: Part[] = [];
    const spread = event.kind === 'sparkles' ? 90 : event.kind === 'hearts' || event.kind === 'blessing' ? 70 : 120;

    for (let i = 0; i < event.count; i++) {
      const angle = (Math.PI * 2 * i) / event.count + Math.random() * 0.6;
      const dist = spread * (0.5 + Math.random() * 0.9);
      parts.push({
        bx: Math.round(Math.cos(angle) * dist),
        by: Math.round(Math.sin(angle) * dist - (event.kind === 'sparkles' ? 20 : 60)),
        br: Math.round((Math.random() - 0.5) * 620),
        delay: Math.round(Math.random() * 160),
        size: Math.round(8 + Math.random() * 12),
      });
    }

    const entry = { ...event, parts };
    this.bursts = [...this.bursts, entry];

    setTimeout(() => {
      this.zone.runOutsideAngular(() => {
        this.bursts = this.bursts.filter((b) => b.id !== event.id);
      });
    }, LIFETIME + 400);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}

interface Part {
  bx: number;
  by: number;
  br: number;
  delay: number;
  size: number;
}
