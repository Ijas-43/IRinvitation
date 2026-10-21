import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TiltDirective } from '../../shared/tilt.directive';
import { FloralFrameComponent } from '../../shared/floral-frame.component';
import { EffectsService } from '../../shared/effects.service';
import { revealOnScroll } from '../../shared/animations';
import { INVITE, formatDisplayDate } from '../../invitation.config';

/**
 * Groom & Bride introduction — symmetrical glassmorphism cards,
 * Islamic medallions, family parentage, qualification badges,
 * and central intertwined I & R Jasbika monogram.
 */
@Component({
  selector: 'app-couple',
  standalone: true,
  imports: [CommonModule, TiltDirective, FloralFrameComponent],
  templateUrl: './couple.component.html',
  styleUrl: './couple.component.scss',
})
export class CoupleComponent implements AfterViewInit, OnDestroy {
  @ViewChild('section') sectionRef?: ElementRef<HTMLElement>;

  readonly cfg = INVITE;
  readonly displayDate = formatDisplayDate(INVITE.meta.date);

  private ctx?: ReturnType<typeof revealOnScroll>;

  constructor(private effects: EffectsService) {}

  ngAfterViewInit(): void {
    if (this.sectionRef) this.ctx = revealOnScroll(this.sectionRef.nativeElement);
  }

  onAmpersandClick(event: Event): void {
    const el = event.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    this.effects.burst(r.left + r.width / 2, r.top + r.height / 2, 'sparkles', 16);
    this.effects.burst(r.left + r.width / 2, r.top + r.height / 2, 'petals', 12);
  }

  onCardHover(card: HTMLElement | null): void {
    this.effects.burstOnElement(card, 'sparkles', 8);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
