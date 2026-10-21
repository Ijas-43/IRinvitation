import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FloralFrameComponent } from '../../shared/floral-frame.component';
import { TiltDirective } from '../../shared/tilt.directive';
import { revealOnScroll } from '../../shared/animations';
import { INVITE, formatLongDate } from '../../invitation.config';

@Component({
  selector: 'app-venue',
  standalone: true,
  imports: [CommonModule, FloralFrameComponent, TiltDirective],
  templateUrl: './venue.component.html',
  styleUrl: './venue.component.scss',
})
export class VenueComponent implements AfterViewInit, OnDestroy {
  @ViewChild('section') sectionRef?: ElementRef<HTMLElement>;

  readonly cfg = INVITE.venue;
  readonly longDate = formatLongDate(INVITE.meta.date);

  private ctx?: ReturnType<typeof revealOnScroll>;

  ngAfterViewInit(): void {
    if (this.sectionRef) {
      this.ctx = revealOnScroll(this.sectionRef.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
