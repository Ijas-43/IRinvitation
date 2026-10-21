import { Directive, ElementRef, HostListener, Input } from '@angular/core';

/**
 * Luxury 3D tilt on hover (pointer devices only — touch is left alone so the
 * page never fights with scrolling). Updates the transform directly on the
 * element, so no change detection runs during pointer movement.
 *
 * Usage: <article appTilt [appTilt]="12"></article>
 */
@Directive({
  selector: '[appTilt]',
  standalone: true,
})
export class TiltDirective {
  @Input('appTilt') maxDeg = 11;
  @Input() appTiltTranslate = -8;

  private el: HTMLElement;
  private cachedRect: DOMRect | null = null;
  private cachedAt = 0;

  constructor(host: ElementRef<HTMLElement>) {
    this.el = host.nativeElement;
    this.el.style.transformStyle = 'preserve-3d';
    this.el.style.transition = 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)';
  }

  @HostListener('pointermove', ['$event'])
  onMove(event: PointerEvent): void {
    if (event.pointerType === 'touch' || event.pointerType === 'pen') return;

    const now = Date.now();
    if (!this.cachedRect || now - this.cachedAt > 300) {
      this.cachedRect = this.el.getBoundingClientRect();
      this.cachedAt = now;
    }
    const r = this.cachedRect;
    const px = (event.clientX - r.left) / r.width - 0.5;
    const py = (event.clientY - r.top) / r.height - 0.5;

    this.el.style.transform =
      `perspective(1000px) rotateX(${(-py * this.maxDeg).toFixed(2)}deg) ` +
      `rotateY(${(px * this.maxDeg).toFixed(2)}deg) translateY(${this.appTiltTranslate}px)`;
    this.el.style.setProperty('--gx', `${((px + 0.5) * 100).toFixed(1)}%`);
    this.el.style.setProperty('--gy', `${((py + 0.5) * 100).toFixed(1)}%`);
  }

  @HostListener('pointerleave')
  onLeave(): void {
    this.el.style.transform = '';
    this.cachedRect = null;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.cachedRect = null;
  }
}
