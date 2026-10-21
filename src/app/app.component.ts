import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { INVITE } from './invitation.config';
import { gsap, prefersReducedMotion } from './shared/animations';
import { ParticlesComponent } from './shared/particles.component';
import { EffectsComponent } from './shared/effects.component';
import { ScrollProgressComponent } from './shared/scroll-progress.component';

import { EnvelopeIntroComponent } from './sections/envelope/envelope.component';
import { HeroSectionComponent } from './sections/hero/hero.component';
import { QuoteComponent } from './sections/quote/quote.component';
import { CoupleComponent } from './sections/couple/couple.component';
import { CountdownComponent } from './sections/countdown/countdown.component';
import { EventsComponent } from './sections/events/events.component';
import { VenueComponent } from './sections/venue/venue.component';
import { WishesComponent } from './sections/wishes/wishes.component';
import { FinaleComponent } from './sections/finale/finale.component';
import { MusicComponent } from './sections/music/music.component';

const INTRO_SESSION_KEY = 'jasbika-nikah-intro-viewed';

/**
 * Jasbika Nikah Invitation Root Application Component:
 * - Controls the cinematic Islamic opening intro
 * - Sticky navigation and mobile drawer
 * - Complete website section flow
 * - Global audio, particles, and scroll progress
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ParticlesComponent,
    EffectsComponent,
    ScrollProgressComponent,
    EnvelopeIntroComponent,
    HeroSectionComponent,
    QuoteComponent,
    CoupleComponent,
    CountdownComponent,
    EventsComponent,
    VenueComponent,
    WishesComponent,
    FinaleComponent,
    MusicComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('music') musicComponent?: MusicComponent;
  @ViewChild('main') mainRef?: ElementRef<HTMLElement>;

  readonly cfg = INVITE;
  readonly navItems = INVITE.nav.items;

  /** Whether the luxury envelope opening should run for this page view */
  showIntro = false;
  /** True once invitation content is revealed */
  opened = false;
  menuOpen = false;
  scrolled = false;

  private navObserver?: IntersectionObserver;
  /** Fade-in of the homepage, cancelled when the app is destroyed. */
  private revealTween?: gsap.core.Tween;
  /** Safety net: a hidden tab suspends rAF, so the fade can stall at opacity 0. */
  private revealSafety?: ReturnType<typeof setTimeout>;

  /** True when the envelope was requested explicitly (?intro=1) — in that
   *  case the session flag is not written, so the link always replays it. */
  private forcedByUrl = false;

  constructor() {
    this.showIntro = this.computeShowIntro();
    if (!this.showIntro) {
      this.opened = true;
    }
    if (this.opened) {
      document.body.classList.add('invitation-open');
    }
  }

  private computeShowIntro(): boolean {
    if (!INVITE.intro.enabled) return false;

    // ?intro=1 forces the envelope, ?intro=0 skips it — handy for previewing
    // the intro on a device where it was already dismissed.
    try {
      const forced = new URLSearchParams(window.location.search).get('intro');
      if (forced === '1' || forced === 'true') {
        this.forcedByUrl = true;
        return true;
      }
      if (forced === '0' || forced === 'false') return false;
    } catch {}

    switch (INVITE.intro.replay) {
      case 'always':
        return true;
      case 'never':
        return false;
      case 'session':
      default:
        try {
          return sessionStorage.getItem(INTRO_SESSION_KEY) !== '1';
        } catch {
          return true;
        }
    }
  }

  /**
   * Replays the 3D envelope opening from the already revealed homepage.
   * Without this the intro can only be seen once per browser session
   * (the session flag hides it on every later reload).
   */
  replayIntro(): void {
    if (this.showIntro) return;
    this.closeMenu();
    this.opened = false;
    this.showIntro = true;
    document.body.classList.remove('invitation-open');
    try {
      sessionStorage.removeItem(INTRO_SESSION_KEY);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  ngAfterViewInit(): void {
    const hero = document.getElementById('home');
    if (hero && 'IntersectionObserver' in window) {
      this.navObserver = new IntersectionObserver(
        ([entry]) => (this.scrolled = !entry.isIntersecting),
        { rootMargin: '-90px 0px 0px 0px', threshold: 0 },
      );
      this.navObserver.observe(hero);
    }
  }

  /* ------------------------------ Intro Flow ----------------------------- */

  /**
   * The guest broke the wax seal. This still runs inside their tap gesture,
   * so the audio element can be unlocked here — mobile browsers (iOS /
   * Safari) refuse a gesture-less `play()`, and the automatic hand-off
   * happens seconds later, outside of any gesture.
   */
  onEnvelopeOpen(): void {
    this.musicComponent?.primeForLaterPlayback();
  }

  /**
   * The cinematic hand-off starts (automatically, three seconds after the
   * invitation preview appeared). The invitation is revealed behind the
   * fading overlay and the music is started inside the very same moment.
   */
  onEnvelopeEnter(): void {
    this.opened = true;
    this.musicComponent?.attemptPlaybackOnOpen();
    this.revealHomepage();
    // NOTE: no ScrollTrigger.refresh() here — a refresh re-measures the whole
    // document and would starve the 1.5s fade-out. It runs once the overlay
    // is gone (see onEnvelopeComplete).
  }

  /** The envelope overlay has faded away — the homepage is now the only screen. */
  onEnvelopeComplete(): void {
    this.showIntro = false;
    document.body.classList.add('invitation-open');
    // A forced preview (?intro=1) must stay replayable on every reload.
    if (!this.forcedByUrl) {
      try {
        sessionStorage.setItem(INTRO_SESSION_KEY, '1');
      } catch {}
    }

    this.refreshScroll();
  }

  /**
   * Cinematic fade-in of the homepage while the envelope overlay dissolves.
   * The content is already laid out (only `visibility` was hidden), so a
   * plain opacity tween is enough — cheap on phones.
   */
  private revealHomepage(): void {
    const main = this.mainRef?.nativeElement;
    if (!main) return;

    this.revealTween?.kill();
    if (this.revealSafety) {
      clearTimeout(this.revealSafety);
      this.revealSafety = undefined;
    }

    if (prefersReducedMotion()) {
      // Reduced motion: the overlay cross-fade is the whole transition.
      main.style.opacity = '';
      return;
    }

    this.revealTween = gsap.fromTo(
      main,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1.25,
        delay: 0.2,
        ease: 'power2.inOut',
        clearProps: 'opacity',
        onComplete: () => {
          this.revealSafety = undefined;
        },
      },
    );

    // Safety net — a backgrounded tab suspends requestAnimationFrame, which
    // can leave the fade stuck at opacity 0. The homepage must never stay
    // invisible, so the inline opacity is dropped as a last resort.
    this.revealSafety = setTimeout(() => {
      this.revealSafety = undefined;
      main.style.opacity = '';
    }, 2600);
  }

  private refreshScroll(): void {
    const delay = prefersReducedMotion() ? 0 : 900;
    window.setTimeout(() => ScrollTrigger.refresh(), delay);
  }

  /* --------------------------------- Nav --------------------------------- */

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  scrollTo(href: string, event?: Event): void {
    if (!href.startsWith('#')) return;
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;
    event?.preventDefault();
    this.closeMenu();
    target.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
    try {
      history.replaceState(null, '', href);
    } catch {}
  }

  ngOnDestroy(): void {
    this.navObserver?.disconnect();
    this.revealTween?.kill();
    if (this.revealSafety) clearTimeout(this.revealSafety);
    document.body.classList.remove('invitation-open');
  }
}
