import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsService } from '../../shared/effects.service';
import { revealOnScroll } from '../../shared/animations';
import { INVITE, getWhatsAppUrl } from '../../invitation.config';

/**
 * Wishes Section — Wishes strictly through WhatsApp only.
 * No reservations, RSVP forms, attendance counts or fake stores.
 */
@Component({
  selector: 'app-wishes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wishes.component.html',
  styleUrl: './wishes.component.scss',
})
export class WishesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('section') sectionRef?: ElementRef<HTMLElement>;

  readonly cfg = INVITE.wishes;
  readonly meta = INVITE.meta;
  readonly whatsappUrl = getWhatsAppUrl(INVITE.meta.whatsapp, INVITE.meta.whatsappMessage);

  copied = false;
  shared = false;

  private ctx?: ReturnType<typeof revealOnScroll>;
  private resetTimer?: ReturnType<typeof setTimeout>;

  constructor(private effects: EffectsService) {}

  ngAfterViewInit(): void {
    if (this.sectionRef) {
      this.ctx = revealOnScroll(this.sectionRef.nativeElement);
    }
  }

  onSendClick(): void {
    this.effects.burstOnElement(this.sectionRef?.nativeElement, 'sparkles', 16);
  }

  copyMessage(): void {
    const text = this.cfg.sampleMessage;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.copied = true;
        clearTimeout(this.resetTimer);
        this.resetTimer = setTimeout(() => (this.copied = false), 3500);
      });
    } else {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2500);
    }
  }

  async shareInvite(): Promise<void> {
    const shareData = {
      title: 'Ijaz & Rasbika Nikah Invitation — Jasbika',
      text: this.cfg.sampleMessage,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        this.shared = true;
        setTimeout(() => (this.shared = false), 3000);
      } catch {
        // User cancelled share
      }
    } else {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        this.shared = true;
        setTimeout(() => (this.shared = false), 3000);
      }
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.resetTimer);
    this.ctx?.revert();
  }
}
