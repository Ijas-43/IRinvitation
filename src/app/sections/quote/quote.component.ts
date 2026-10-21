import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { prefersReducedMotion, revealOnScroll } from '../../shared/animations';
import { INVITE } from '../../invitation.config';

@Component({
  selector: 'app-quote',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quote.component.html',
  styleUrl: './quote.component.scss',
})
export class QuoteComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('section', { static: true }) sectionRef!: ElementRef<HTMLElement>;

  readonly verse = INVITE.verse;
  readonly brand = INVITE.meta.brand;

  private ctx?: ReturnType<typeof revealOnScroll>;

  ngOnInit(): void {
    this.ctx = revealOnScroll(this.sectionRef.nativeElement, { y: 50, stagger: 0.1 });
  }

  ngAfterViewInit(): void {
    // Reveal triggered by revealOnScroll
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
