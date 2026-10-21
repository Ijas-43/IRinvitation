import { Component, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Thin cinematic scroll progress ribbon pinned to the top of the viewport.
 * Uses a passive scroll listener + rAF so it never triggers change detection
 * storms or layout thrash.
 */
@Component({
  selector: 'app-scroll-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-track" role="progressbar" aria-label="Invitation reading progress" aria-valuemin="0" aria-valuemax="100" [attr.aria-valuenow]="pct">
      <div class="progress-fill" [style.transform]="'scaleX(' + pct / 100 + ')'"></div>
      <span class="progress-spark" [style.left.%]="pct"></span>
    </div>
  `,
  styles: [
    `
      :host {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 45;
        display: block;
        pointer-events: none;
      }
      .progress-track {
        position: relative;
        height: 3px;
        background: rgba(183, 110, 121, 0.14);
        overflow: visible;
      }
      .progress-fill {
        height: 100%;
        transform-origin: 0 50%;
        transform: scaleX(0);
        background: linear-gradient(90deg, #e75480, #b76e79 55%, #d4af77);
        box-shadow: 0 0 12px rgba(212, 175, 119, 0.65);
        will-change: transform;
      }
      .progress-spark {
        position: absolute;
        top: 50%;
        width: 9px;
        height: 9px;
        margin: -4.5px 0 0 -4.5px;
        border-radius: 50%;
        background: radial-gradient(circle, #fffaf1, #d4af77);
        box-shadow: 0 0 12px rgba(212, 175, 119, 0.95);
        opacity: 0;
        transition: opacity 0.4s;
      }
      .progress-track:hover .progress-spark,
      :host-context(.has-scrolled) .progress-spark {
        opacity: 1;
      }
      @media (prefers-reduced-motion: reduce) {
        .progress-fill {
          transition: none;
        }
      }
    `,
  ],
})
export class ScrollProgressComponent {
  pct = 0;
  private ticking = false;

  constructor(elementRef: ElementRef<HTMLElement>) {
    elementRef.nativeElement.style.setProperty('--pct', '0');
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const next = max > 0 ? (window.scrollY / max) * 100 : 0;
      this.pct = Math.max(0, Math.min(100, next));
      document.body.classList.toggle('has-scrolled', this.pct > 1);
      this.ticking = false;
    });
  }
}
