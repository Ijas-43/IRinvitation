import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  INVITE,
  calendarUrlFor,
  formatDisplayDate,
} from '../../invitation.config';
import { revealOnScroll } from '../../shared/animations';

interface FlipUnit {
  key: 'days' | 'hours' | 'minutes' | 'seconds';
  label: string;
  value: string;
  prev: string;
  flipping: boolean;
}

/**
 * Wedding Date & Animated Countdown section:
 * Includes Section 5 (Beautiful Beginning Message) and Section 6 (Date & Countdown).
 * Target: 2026-12-26 17:30 IST.
 */
@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './countdown.component.html',
  styleUrl: './countdown.component.scss',
})
export class CountdownComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('section') sectionRef?: ElementRef<HTMLElement>;

  readonly cfg = INVITE;
  readonly calendarUrl = calendarUrlFor();
  /** Verified Google Maps link for the wedding venue (ECR Masjid, Kottaipattinam). */
  readonly locationUrl = INVITE.meta.map;
  readonly displayDate = formatDisplayDate(INVITE.meta.date);

  finished = false;

  units: FlipUnit[] = [
    { key: 'days', label: 'Days', value: '000', prev: '000', flipping: false },
    { key: 'hours', label: 'Hours', value: '00', prev: '00', flipping: false },
    { key: 'minutes', label: 'Minutes', value: '00', prev: '00', flipping: false },
    { key: 'seconds', label: 'Seconds', value: '00', prev: '00', flipping: false },
  ];

  private timer?: ReturnType<typeof setInterval>;
  private flipTimers: Record<string, ReturnType<typeof setTimeout>> = {};
  private ctx?: ReturnType<typeof revealOnScroll>;

  ngOnInit(): void {
    this.tick();
    this.timer = setInterval(() => this.tick(), 1000);
  }

  ngAfterViewInit(): void {
    if (this.sectionRef) {
      this.ctx = revealOnScroll(this.sectionRef.nativeElement);
    }
  }

  private tick(): void {
    const target = new Date(INVITE.meta.date).getTime();
    const delta = Math.max(0, target - Date.now());

    if (delta <= 0 && !this.finished) {
      this.finished = true;
      return;
    }

    const values: Record<FlipUnit['key'], string> = {
      days: String(Math.floor(delta / 86400000)).padStart(3, '0'),
      hours: String(Math.floor(delta / 3600000) % 24).padStart(2, '0'),
      minutes: String(Math.floor(delta / 60000) % 60).padStart(2, '0'),
      seconds: String(Math.floor(delta / 1000) % 60).padStart(2, '0'),
    };

    for (const unit of this.units) {
      const next = values[unit.key];
      if (next === unit.value) continue;

      unit.prev = unit.value;
      unit.value = next;
      unit.flipping = true;

      clearTimeout(this.flipTimers[unit.key]);
      this.flipTimers[unit.key] = setTimeout(() => {
        unit.flipping = false;
      }, 380);
    }
  }

  trackByKey(_: number, unit: FlipUnit): string {
    return unit.key;
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    Object.values(this.flipTimers).forEach(clearTimeout);
    this.ctx?.revert();
  }
}
