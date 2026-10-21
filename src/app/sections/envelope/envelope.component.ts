import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap, prefersReducedMotion } from '../../shared/animations';
import { EffectsService } from '../../shared/effects.service';
import { INVITE } from '../../invitation.config';

/**
 * The luxury 3D envelope that plays before the invitation is revealed.
 *
 * State flow:  closed → opening → preview → entering → completed
 *
 *  • closed   – sealed blush envelope with the rose-gold "I & R" wax seal
 *  • opening  – seal glows & breaks, flap rotates back, card rises out
 *  • preview  – the full invitation card is readable while a 3 second
 *               countdown runs; the guest never has to press anything
 *  • entering – cinematic hand-off to the homepage
 */
export type EnvelopeState = 'closed' | 'opening' | 'preview' | 'entering' | 'completed';

interface Petal {
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  drift: number;
}

interface Spark {
  left: number;
  top: number;
  delay: number;
  duration: number;
  size: number;
}

@Component({
  selector: 'app-envelope',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './envelope.component.html',
  styleUrl: './envelope.component.scss',
})
export class EnvelopeIntroComponent implements AfterViewInit, OnDestroy {
  /** Fired the instant the guest breaks the seal — inside their tap gesture. */
  @Output() open = new EventEmitter<void>();
  /** Fired the moment the cinematic hand-off to the homepage begins. */
  @Output() enter = new EventEmitter<void>();
  /** Fired once the overlay has fully faded out. */
  @Output() complete = new EventEmitter<void>();

  @ViewChild('root') rootRef?: ElementRef<HTMLElement>;
  @ViewChild('scene') sceneRef?: ElementRef<HTMLElement>;
  @ViewChild('seal') sealRef?: ElementRef<HTMLElement>;
  @ViewChild('sealGlow') sealGlowRef?: ElementRef<HTMLElement>;
  @ViewChild('sealLeft') sealLeftRef?: ElementRef<HTMLElement>;
  @ViewChild('sealRight') sealRightRef?: ElementRef<HTMLElement>;
  @ViewChild('flap') flapRef?: ElementRef<HTMLElement>;
  @ViewChild('card') cardRef?: ElementRef<HTMLElement>;
  @ViewChild('preview') previewRef?: ElementRef<HTMLElement>;
  @ViewChild('glow') glowRef?: ElementRef<HTMLElement>;
  @ViewChild('previewCard') previewCardRef?: ElementRef<HTMLElement>;
  @ViewChild('autoBlock') autoBlockRef?: ElementRef<HTMLElement>;
  @ViewChild('autoBar') autoBarRef?: ElementRef<HTMLElement>;
  @ViewChild('wash') washRef?: ElementRef<HTMLElement>;

  readonly cfg = INVITE;
  readonly uid = 'env' + Math.random().toString(36).slice(2, 8);
  /** True when the visitor asked the OS for reduced motion. */
  readonly reduced = prefersReducedMotion();

  state: EnvelopeState = 'closed';

  /** Slow drifting rose petals across the backdrop. */
  readonly petals: Petal[] = Array.from({ length: 14 }, (_, i) => {
    const depth = 0.3 + ((i * 29) % 70) / 100;
    return {
      left: (i * 47 + 5) % 100,
      delay: -((i * 17) % 26),
      duration: 15 + (i % 5) * 4,
      size: Math.round(8 + depth * 16),
      opacity: 0.25 + depth * 0.45,
      drift: ((i % 3) - 1) * 26,
    };
  });

  /** Soft ambient light motes. */
  readonly sparks: Spark[] = Array.from({ length: 16 }, (_, i) => ({
    left: (i * 31 + 11) % 100,
    top: (i * 43 + 7) % 100,
    delay: -((i * 13) % 18),
    duration: 5 + (i % 4) * 1.6,
    size: 2 + (i % 3),
  }));

  /** Copy of the automatic hand-off message (empty until the preview shows). */
  get autoLabel(): string {
    return this.state === 'preview' || this.state === 'entering'
      ? this.cfg.envelope.openingLabel
      : '';
  }

  private ctx?: gsap.Context;
  private timeline?: gsap.core.Timeline;
  /** Reduced-motion cross-fade (a plain tween, not a timeline). */
  private fadeTween?: gsap.core.Tween;
  /** Drives the progress line of the 3 second countdown. */
  private countdown?: gsap.core.Timeline;
  private focusTimer?: ReturnType<typeof setTimeout>;
  /** Safety net: guarantees the overlay is never left covering the page. */
  private watchdog?: ReturnType<typeof setTimeout>;
  /** The single timer that triggers the automatic hand-off. */
  private autoEnterTimer?: ReturnType<typeof setTimeout>;
  /** Guards against arming the countdown twice. */
  private autoEnterArmed = false;
  /** Guards against navigating to the homepage twice. */
  private navigating = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private effects: EffectsService,
  ) {}

  ngAfterViewInit(): void {
    const root = this.rootRef?.nativeElement;
    this.ctx = gsap.context(() => {
      if (this.reduced) return;
      const scene = this.sceneRef?.nativeElement;
      const preview = this.previewRef?.nativeElement;
      const card = this.cardRef?.nativeElement;
      if (scene) gsap.set(scene, { opacity: 0, scale: 0.9, y: 28 });
      if (preview) gsap.set(preview, { opacity: 0, scale: 0.95 });
      if (card) gsap.set(card, { opacity: 0, y: 34, scale: 0.9, rotationX: 14 });
    }, root);

    if (!this.reduced) {
      const scene = this.sceneRef?.nativeElement;
      if (scene) {
        gsap.to(scene, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.15,
          ease: 'power3.out',
          delay: 0.12,
        });
      }
    }
  }

  /* ------------------------------ interactions ----------------------------- */

  /** Keyboard support for the envelope (role="button"). */
  onEnvelopeKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
    event.preventDefault();
    this.openEnvelope();
  }

  /**
   * Step 1–3: break the seal, fold the flap back and let the invitation
   * card rise out of the envelope.
   */
  openEnvelope(): void {
    if (this.state !== 'closed') return; // ignore repeat clicks
    this.state = 'opening';
    this.cdr.markForCheck();

    // Emitted synchronously so the app can unlock the audio element inside
    // the guest's real tap gesture — mobile browsers only allow the
    // gesture-less playback that the automatic hand-off needs once the
    // element has been unlocked once.
    this.open.emit();

    const seal = this.sealRef?.nativeElement;
    const glow = this.sealGlowRef?.nativeElement;
    const sealLeft = this.sealLeftRef?.nativeElement;
    const sealRight = this.sealRightRef?.nativeElement;
    const flap = this.flapRef?.nativeElement;
    const card = this.cardRef?.nativeElement;
    const scene = this.sceneRef?.nativeElement;
    const preview = this.previewRef?.nativeElement;

    // Golden sparkle + petal burst from the seal.
    if (seal) {
      const r = seal.getBoundingClientRect();
      this.effects.burst(r.left + r.width / 2, r.top + r.height / 2, 'sparkles', 18);
      this.effects.burst(r.left + r.width / 2, r.top + r.height / 2, 'petals', 10);
    }

    if (this.reduced) {
      this.goToPreview();
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => this.goToPreview(),
    });
    this.timeline = tl;

    /* ---- 1 · wax seal: glow, swell, break ---- */
    if (glow) {
      tl.to(glow, { opacity: 1, scale: 1.35, duration: 0.5, ease: 'power2.out' }, 0);
    }
    if (seal) {
      tl.to(seal, { scale: 1.16, duration: 0.45, ease: 'power2.out' }, 0);
    }
    if (sealLeft && sealRight) {
      tl.to(
          sealLeft,
          { x: -54, y: 32, rotation: -42, opacity: 0, duration: 0.55, ease: 'power2.in' },
          0.36,
        )
        .to(
          sealRight,
          { x: 54, y: 32, rotation: 42, opacity: 0, duration: 0.55, ease: 'power2.in' },
          0.36,
        );
    }

    /* ---- 2 · flap folds backwards (3D) ---- */
    if (flap) {
      tl.to(flap, { rotationX: -168, duration: 1.05, ease: 'power2.inOut' }, 0.6);
    }

    /* ---- 3 · invitation card rises out ---- */
    if (card) {
      tl.to(
        card,
        { opacity: 1, y: -44, scale: 1.03, rotationX: -5, duration: 1.15, ease: 'power3.out' },
        1.02,
      );
    }

    /* ---- 4 · hand over to the readable preview ---- */
    if (scene) {
      tl.to(scene, { opacity: 0.3, scale: 0.88, y: 42, duration: 0.9, ease: 'power2.inOut' }, 1.5);
    }
    if (preview) {
      tl.to(preview, { opacity: 1, scale: 1, duration: 0.95, ease: 'power3.out' }, 1.62);
    }

    // Watchdog — if the timeline is interrupted (tab switch, slow device)
    // the guest still gets the invitation instead of a frozen overlay.
    this.armWatchdog(6000, () => {
      if (this.state !== 'opening') return;
      this.timeline?.kill();
      this.goToPreview();
    });
  }

  /**
   * The cinematic hand-off to the homepage. It runs automatically three
   * seconds after the preview card is revealed — the guest never has to
   * press anything (Escape still skips the wait).
   */
  enterInvitation(): void {
    if (this.state !== 'preview') return; // ignore repeat clicks
    if (this.navigating) return; // never navigate twice
    this.navigating = true;

    // The countdown is over — tear it down before the transition starts.
    this.cancelAutoEnter();

    this.state = 'entering';
    this.cdr.markForCheck();

    // Emitted synchronously so the app can start the music the moment the
    // hand-off begins (the element was already unlocked by the seal tap).
    this.enter.emit();

    const previewCard = this.previewCardRef?.nativeElement;
    const wash = this.washRef?.nativeElement;
    const root = this.rootRef?.nativeElement;
    const glow = this.glowRef?.nativeElement;

    if (this.reduced) {
      this.fadeOutAndFinish();
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => this.finish(),
    });
    this.timeline = tl;

    /* ---- 1 · the card drifts closer and blooms with a blush-pink glow ---- */
    if (glow) {
      tl.fromTo(
        glow,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1.12, duration: 1, ease: 'power2.out' },
        0,
      );
    }
    if (previewCard) {
      tl.to(previewCard, { scale: 1.07, y: -16, duration: 1.0, ease: 'power2.in' }, 0);
    }

    /* ---- 2 · the cinematic light wash blooms over everything ---- */
    if (wash) {
      tl.fromTo(
        wash,
        { opacity: 0, scale: 0.3 },
        { opacity: 1, scale: 1.75, duration: 1.2, ease: 'power2.in' },
        0.05,
      );
    }

    /* ---- 3 · the preview dissolves, the homepage takes over ---- */
    if (root) {
      tl.to(root, { opacity: 0, scale: 1.05, duration: 1.2, ease: 'power2.inOut' }, 0.34);
    }

    // Watchdog — the overlay must never stay on top of the homepage.
    this.armWatchdog(5000, () => {
      if (this.state !== 'entering') return;
      this.timeline?.kill();
      this.finish();
    });
  }

  /** Escape = skip the remaining steps (keyboard shortcut). */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.state === 'closed') {
      this.openEnvelope();
      return;
    }
    if (this.state === 'preview') {
      this.enterInvitation();
    }
  }

  /* -------------------------------- helpers -------------------------------- */

  /** Seconds the preview waits before the automatic hand-off. */
  private get autoEnterDelay(): number {
    const delay = this.cfg.envelope.autoEnterDelay;
    return Number.isFinite(delay) && delay > 0 ? delay : 3;
  }

  /**
   * Starts the countdown that ends in the automatic hand-off.
   *
   * One timer + one GSAP timeline ⇒ exactly one transition, never two.
   * The timer is a plain `setTimeout` (not a GSAP call) so the hand-off
   * still happens when the browser throttles animations in a background tab.
   */
  private armAutoEnter(): void {
    if (this.autoEnterArmed || this.navigating) return;
    this.autoEnterArmed = true;

    const delay = this.autoEnterDelay;
    const block = this.autoBlockRef?.nativeElement;
    const bar = this.autoBarRef?.nativeElement;

    if (this.reduced) {
      // Reduced motion: no progress animation, just the message.
      if (block) block.style.opacity = '1';
    } else {
      this.countdown = gsap.timeline();
      // Only the slide is animated — the block itself is visible through CSS
      // so it can never stay invisible if the browser throttles rAF.
      if (block) {
        this.countdown.fromTo(
          block,
          { y: 12 },
          { y: 0, duration: 0.7, ease: 'power2.out' },
          0,
        );
      }
      if (bar) {
        this.countdown.fromTo(
          bar,
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: delay, ease: 'none' },
          0,
        );
      }
    }

    this.autoEnterTimer = setTimeout(() => {
      this.autoEnterTimer = undefined;
      this.enterInvitation();
    }, delay * 1000);
  }

  /** Stops the countdown — the hand-off is already under way. */
  private cancelAutoEnter(): void {
    if (this.autoEnterTimer) {
      clearTimeout(this.autoEnterTimer);
      this.autoEnterTimer = undefined;
    }
    this.countdown?.kill();
    this.countdown = undefined;
  }

  /** Schedules a fallback that runs only if the state was not advanced. */
  private armWatchdog(ms: number, fn: () => void): void {
    if (this.watchdog) clearTimeout(this.watchdog);
    this.watchdog = setTimeout(() => {
      this.watchdog = undefined;
      fn();
    }, ms);
  }

  private goToPreview(): void {
    if (this.watchdog) {
      clearTimeout(this.watchdog);
      this.watchdog = undefined;
    }
    this.state = 'preview';

    if (this.reduced) {
      // No animation available: show the finished state straight away.
      const preview = this.previewRef?.nativeElement;
      const scene = this.sceneRef?.nativeElement;
      if (preview) {
        preview.style.opacity = '1';
        preview.style.transform = 'none';
      }
      if (scene) scene.style.opacity = '0.25';
    }

    this.cdr.markForCheck();

    // The invitation card is fully visible → start the automatic hand-off.
    this.armAutoEnter();

    // Move the focus into the revealed preview (the CTA button is gone).
    this.focusTimer = setTimeout(() => {
      const el = this.previewRef?.nativeElement;
      if (!el) return;
      try {
        el.focus({ preventScroll: true });
      } catch {
        el.focus();
      }
    }, 120);
  }

  /** Reduced motion: a plain cross-fade instead of the full choreography. */
  private fadeOutAndFinish(): void {
    const root = this.rootRef?.nativeElement;
    if (!root) {
      this.finish();
      return;
    }
    this.fadeTween = gsap.to(root, {
      opacity: 0,
      duration: 0.6,
      ease: 'power1.inOut',
      onComplete: () => this.finish(),
    });
  }

  private finish(): void {
    if (this.watchdog) {
      clearTimeout(this.watchdog);
      this.watchdog = undefined;
    }
    this.state = 'completed';
    this.cdr.markForCheck();
    this.complete.emit();
  }

  ngOnDestroy(): void {
    this.cancelAutoEnter();
    if (this.focusTimer) clearTimeout(this.focusTimer);
    if (this.watchdog) clearTimeout(this.watchdog);
    this.fadeTween?.kill();
    this.timeline?.kill();
    this.ctx?.revert();
  }
}
