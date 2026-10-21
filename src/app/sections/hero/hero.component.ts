import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FloralFrameComponent } from '../../shared/floral-frame.component';
import { EffectsService } from '../../shared/effects.service';
import { gsap, revealOnScroll } from '../../shared/animations';
import { INVITE, formatDisplayDate } from '../../invitation.config';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, FloralFrameComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroSectionComponent implements AfterViewInit, OnDestroy {
  /** Flips to true when the intro finishes — starts the entrance timeline. */
  @Input() set active(value: boolean) {
    if (value && this.viewReady && !this.entered) this.runEntrance();
  }

  @ViewChild('content') contentRef?: ElementRef<HTMLElement>;
  @ViewChild('names') namesRef?: ElementRef<HTMLElement>;

  readonly cfg = INVITE;
  readonly displayDate = formatDisplayDate(INVITE.meta.date);
  /** Layered petals: depth 0 (far, blurred) … 1 (near, crisp). */
  readonly petals = Array.from({ length: 16 }, (_, i) => {
    const depth = 0.25 + ((i * 37) % 70) / 100;
    return {
      left: (i * 61 + 7) % 100,
      delay: -((i * 13) % 22),
      duration: 16 + (i % 6) * 4,
      size: Math.round(7 + depth * 16),
      depth,
      blur: depth < 0.45 ? 1.5 : 0,
      opacity: 0.25 + depth * 0.45,
    };
  });

  private viewReady = false;
  private entered = false;
  private ctx?: gsap.Context;

  constructor(private effects: EffectsService) {}

  ngAfterViewInit(): void {
    this.viewReady = true;
    if (this.entered) this.runEntrance();
  }

  private runEntrance(): void {
    this.entered = true;
    const root = this.contentRef?.nativeElement?.closest('.hero');
    if (!root) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealOnScroll(root);
      return;
    }

    this.ctx = gsap.context(() => {
      gsap.set('.hero-arch', { opacity: 0, scale: 0.92, y: 40 });
      gsap.set('.hero-glow', { opacity: 0 });
      gsap.set('.h-anim', { opacity: 0, y: 44 });
      gsap.set(
        '.hero-names .names__word, .hero-names .names__amp',
        { opacity: 0, yPercent: 60, rotateX: -58, scale: 0.94, transformOrigin: '50% 100%' },
      );
      gsap.set('.scroll-cue', { opacity: 0, y: 18 });
      gsap.set('.hero-bottom', { opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to('.hero-arch', { opacity: 1, scale: 1, y: 0, duration: 1.5 }, 0)
        .to('.hero-glow', { opacity: 1, duration: 1.6, stagger: 0.15 }, 0.05)
        .to('.h-anim', { opacity: 1, y: 0, duration: 1.05, stagger: 0.12 }, 0.3)
        .to(
          '.hero-names .names__word, .hero-names .names__amp',
          { opacity: 1, yPercent: 0, rotateX: 0, scale: 1, duration: 1.15, stagger: 0.16 },
          0.7,
        )
        .to('.scroll-cue', { opacity: 1, y: 0, duration: 0.8 }, 1.35)
        .to('.hero-bottom', { opacity: 1, duration: 0.9 }, 1.45);

      // scroll-linked depth for arch / petals / ornaments
      revealOnScroll(root);
    }, root);
  }

  /** Golden sparkles whenever someone plays with the couple's names. */
  onNamesHover(): void {
    this.effects.burstOnElement(this.namesRef?.nativeElement, 'sparkles', 14);
  }

  onNamesClick(): void {
    this.effects.burstOnElement(this.namesRef?.nativeElement, 'petals', 18);
  }

  /** Hidden little surprise: tapping the heart bursts rose petals. */
  onHeartClick(event: Event): void {
    const el = event.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    this.effects.burst(r.left + r.width / 2, r.top + r.height / 2, 'petals', 16);
    this.effects.burst(r.left + r.width / 2, r.top + r.height / 2, 'hearts', 5);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
