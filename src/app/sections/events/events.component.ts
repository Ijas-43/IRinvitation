import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TiltDirective } from '../../shared/tilt.directive';
import { revealOnScroll } from '../../shared/animations';
import {
  INVITE,
  WeddingEventItem,
  calendarUrlFor,
  icsDataUrl,
} from '../../invitation.config';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, TiltDirective],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss',
})
export class EventsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('section') sectionRef?: ElementRef<HTMLElement>;

  readonly cfg = INVITE.events;
  readonly meta = INVITE.meta;

  private ctx?: ReturnType<typeof revealOnScroll>;

  ngAfterViewInit(): void {
    if (this.sectionRef) {
      this.ctx = revealOnScroll(this.sectionRef.nativeElement);
    }
  }

  calendarUrl(ev: WeddingEventItem): string {
    return calendarUrlFor(
      ev.iso,
      `${ev.title} — ${this.meta.groom} & ${this.meta.bride} (${this.meta.brand})`,
      ev.description,
      ev.venue,
    );
  }

  icsUrl(ev: WeddingEventItem): string {
    return icsDataUrl(
      ev.iso,
      `${ev.title} — ${this.meta.groom} & ${this.meta.bride}`,
      ev.description,
      ev.venue,
    );
  }

  trackById(_i: number, ev: WeddingEventItem): string {
    return ev.id;
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
