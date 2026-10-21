import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FloralFrameComponent } from '../../shared/floral-frame.component';
import { EffectsService } from '../../shared/effects.service';
import { gsap, prefersReducedMotion, revealOnScroll } from '../../shared/animations';
import { INVITE, calendarUrlFor, getWhatsAppUrl } from '../../invitation.config';

@Component({
  selector: 'app-finale',
  standalone: true,
  imports: [CommonModule, FloralFrameComponent],
  templateUrl: './finale.component.html',
  styleUrl: './finale.component.scss',
})
export class FinaleComponent implements AfterViewInit, OnDestroy {
  @ViewChild('section') sectionRef?: ElementRef<HTMLElement>;

  readonly cfg = INVITE.finale;
  readonly meta = INVITE.meta;
  readonly whatsappUrl = getWhatsAppUrl(INVITE.meta.whatsapp, INVITE.meta.whatsappMessage);

  private ctx?: ReturnType<typeof revealOnScroll>;
  private tl?: gsap.core.Timeline;

  constructor(private effects: EffectsService) {}

  ngAfterViewInit(): void {
    if (!this.sectionRef) return;
    const el = this.sectionRef.nativeElement;
    this.ctx = revealOnScroll(el);

    if (prefersReducedMotion()) return;

    this.tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 68%', once: true },
    });

    this.tl
      .fromTo(
        el.querySelector('.finale__arch'),
        { opacity: 0, scale: 0.88 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' },
      )
      .fromTo(
        el.querySelector('.finale__names'),
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
        '-=0.6',
      );
  }

  get calendarUrl(): string {
    return calendarUrlFor(
      this.meta.date,
      `Nikah Ceremony: ${this.meta.groom} & ${this.meta.bride} (${this.meta.brand})`,
      'Join us for our Nikah celebration at ECR Masjid, Kottaipattinam.',
      this.meta.venue,
    );
  }

  celebrate(): void {
    const el = this.sectionRef?.nativeElement;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height * 0.35;
    this.effects.burst(cx, cy, 'hearts', 18);
    this.effects.burst(cx, cy, 'petals', 20);
    this.effects.burst(cx, cy, 'sparkles', 16);
  }

  ngOnDestroy(): void {
    this.tl?.scrollTrigger?.kill();
    this.tl?.kill();
    this.ctx?.revert();
  }
}
