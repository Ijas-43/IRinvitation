import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

export type BurstKind = 'petals' | 'sparkles' | 'hearts' | 'blessing';

export interface BurstEvent {
  id: number;
  x: number;
  y: number;
  kind: BurstKind;
  count: number;
}

/**
 * Tiny event bus for the tasteful "surprise" interactions:
 * petal bursts, golden sparkles, flying hearts. Components ask for a burst at
 * screen coordinates, EffectsComponent renders and retires the particles.
 */
@Injectable({ providedIn: 'root' })
export class EffectsService implements OnDestroy {
  private readonly events = new Subject<BurstEvent>();
  readonly bursts$ = this.events.asObservable();
  private counter = 0;

  burst(x: number, y: number, kind: BurstKind = 'petals', count = 14): void {
    this.events.next({ id: ++this.counter, x, y, kind, count });
  }

  /** Convenience: burst centred on an element (e.g. on hover / click). */
  burstOnElement(el: Element | null | undefined, kind: BurstKind = 'sparkles', count = 12): void {
    if (!el) return;
    const r = el.getBoundingClientRect();
    this.burst(r.left + r.width / 2, r.top + r.height / 2, kind, count);
  }

  ngOnDestroy(): void {
    this.events.complete();
  }
}
