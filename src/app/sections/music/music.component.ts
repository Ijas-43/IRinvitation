import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { prefersReducedMotion } from '../../shared/animations';
import { INVITE } from '../../invitation.config';

/**
 * Background Music Controller:
 * - Uses HTMLAudioElement with loop
 * - Configurable src from INVITE.music.src ('assets/audio/wedding-background.wav')
 * - Play/Pause and Mute/Unmute buttons with animated equalizer bars
 * - Fades in smoothly
 * - Attempted when the envelope opens and the invitation is revealed
 * - Respects browser autoplay restrictions
 * - Falls back cleanly to Web Audio ambient tone if the audio file is missing
 * - Full cleanup on destroy
 */
@Component({
  selector: 'app-music',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="music-dock"
      [class.music-dock--playing]="playing"
      [class.music-dock--muted]="muted"
      role="region"
      aria-label="Background music controls"
    >
      <!-- Equalizer Visualizer -->
      <span class="music__icon" aria-hidden="true">
        <span class="music__bar"></span>
        <span class="music__bar"></span>
        <span class="music__bar"></span>
        <span class="music__bar"></span>
      </span>

      <!-- Play / Pause Button -->
      <button
        type="button"
        class="music__btn play-btn"
        (click)="togglePlay()"
        [attr.aria-label]="playing ? 'Pause wedding music' : 'Play wedding music'"
        [attr.aria-pressed]="playing"
      >
        <span class="btn-text">{{ playing ? 'Pause' : 'Play Music' }}</span>
      </button>

      <!-- Mute / Unmute Button -->
      <button
        type="button"
        class="music__btn mute-btn"
        (click)="toggleMute()"
        [attr.aria-label]="muted ? 'Unmute music' : 'Mute music'"
        [attr.aria-pressed]="muted"
        *ngIf="playing"
      >
        <span class="mute-icon" aria-hidden="true">{{ muted ? '🔇' : '🔊' }}</span>
      </button>
    </div>
  `,
  styles: [
    `
      .music-dock {
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 950;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px 8px 12px;
        border-radius: 100px;
        border: 1px solid rgba(255, 255, 255, 0.85);
        background: rgba(255, 255, 255, 0.82);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        box-shadow: 0 12px 32px rgba(183, 110, 121, 0.28);
        color: var(--deep-burgundy);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s;
      }
      .music-dock:hover {
        transform: translateY(-2px);
        box-shadow: 0 16px 40px rgba(183, 110, 121, 0.38);
      }

      .music__btn {
        background: none;
        border: none;
        padding: 4px 6px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--deep-burgundy);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.1em;
      }

      .mute-btn {
        padding: 4px 8px;
        border-left: 1px solid rgba(183, 110, 121, 0.3);
        margin-left: 2px;
      }

      .mute-icon {
        font-size: 14px;
        line-height: 1;
      }

      .music__icon {
        display: inline-flex;
        align-items: flex-end;
        gap: 2.5px;
        height: 16px;
        padding-right: 4px;
      }
      .music__bar {
        width: 3px;
        height: 5px;
        border-radius: 2px;
        background: var(--primary-pink);
        transition: height 0.3s;
      }
      .music-dock--playing:not(.music-dock--muted) .music__bar {
        animation: eq 1.1s ease-in-out infinite;
      }
      .music-dock--playing:not(.music-dock--muted) .music__bar:nth-child(2) { animation-delay: 0.18s; }
      .music-dock--playing:not(.music-dock--muted) .music__bar:nth-child(3) { animation-delay: 0.36s; }
      .music-dock--playing:not(.music-dock--muted) .music__bar:nth-child(4) { animation-delay: 0.1s; }

      @keyframes eq {
        0%, 100% { height: 4px; }
        50% { height: 16px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .music-dock--playing .music__bar { animation: none; height: 12px; }
      }

      @media (max-width: 480px) {
        .music-dock {
          right: 12px;
          bottom: 12px;
          padding: 8px 12px 8px 10px;
        }
      }
    `,
  ],
})
export class MusicComponent implements OnDestroy {
  playing = false;
  muted = false;

  private audio?: HTMLAudioElement;
  private fadeTimer?: ReturnType<typeof setInterval>;
  private autoplayAttempted = false;
  /** True once the element has been primed inside a user gesture. */
  private primed = false;
  /** True once the browser confirmed the primed playback succeeded. */
  private unlocked = false;

  /** Web Audio fallback */
  private ac?: AudioContext;
  private master?: GainNode;
  private oscillators: OscillatorNode[] = [];
  private padTimer?: ReturnType<typeof setInterval>;
  /** The ambient bed is built only once — the mp3 error and the rejected
   *  play() promise can both fire, and the layer must not be doubled. */
  private ambientStarted = false;

  constructor() {
    // Check saved session preference
    if (sessionStorage.getItem('jasbika-music') === 'on') {
      this.playing = false; // awaits user gesture
    }
  }

  /** Called when user clicks "Open Our Invitation" in Intro */
  attemptPlaybackOnOpen(): void {
    if (this.autoplayAttempted) return;
    this.autoplayAttempted = true;
    this.start();
  }

  /**
   * Starts the track silently inside a real user gesture so the element is
   * unlocked for the automatic intro hand-off.
   *
   * The invitation now opens by itself, seconds after the guest tapped the
   * envelope — outside of any gesture. iOS/Safari refuse a `play()` that is
   * not tied to a gesture, so the element is primed here (volume 0, muted,
   * still playing) and the regular `attemptPlaybackOnOpen()` fades it in
   * later. Nothing is audible before the hand-off.
   */
  primeForLaterPlayback(): void {
    if (this.primed) return;
    this.primed = true;
    try {
      const audio = this.ensureAudio();
      audio.muted = true;
      audio.volume = 0;
      const promise = audio.play();
      if (promise && typeof promise.then === 'function') {
        promise
          .then(() => {
            this.unlocked = true;
          })
          .catch(() => {
            // Blocked anyway — the regular path will try again later.
            this.primed = false;
          });
      }
    } catch {
      this.primed = false;
    }
  }

  togglePlay(): void {
    if (this.playing) {
      this.pause();
    } else {
      this.start();
    }
  }

  toggleMute(): void {
    this.muted = !this.muted;
    if (this.audio) {
      this.audio.muted = this.muted;
    }
    if (this.master && this.ac) {
      const now = this.ac.currentTime;
      this.master.gain.setValueAtTime(this.muted ? 0 : INVITE.music.volume * 0.9, now);
    }
  }

  private start(): void {
    this.playing = true;
    try {
      sessionStorage.setItem('jasbika-music', 'on');
    } catch {}

    if (INVITE.music.src && INVITE.music.src.trim()) {
      this.startAudioElement();
    } else {
      this.startAmbient();
    }
  }

  private pause(): void {
    this.playing = false;
    try {
      sessionStorage.setItem('jasbika-music', 'off');
    } catch {}

    if (this.audio) {
      this.fadeAudio(this.audio, 0, 500, () => {
        this.audio?.pause();
      });
    }
    this.stopAmbient();
  }

  /* ------------------- HTMLAudioElement ------------------- */

  /** Creates the audio element (once) and keeps its error fallback wired. */
  private ensureAudio(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.src = INVITE.music.src;
      this.audio.loop = true;
      this.audio.preload = 'auto';

      this.audio.addEventListener('error', () => {
        // The audio file could not be loaded
        // Fall back seamlessly to Web Audio generative ambient so no error or crash occurs
        if (this.playing) {
          this.startAmbient();
        }
      });
    }
    return this.audio;
  }

  private startAudioElement(): void {
    const audio = this.ensureAudio();

    audio.muted = this.muted;
    audio.volume = 0;

    // The element was unlocked during the seal tap and has been playing
    // silently ever since — rewind it so the track starts exactly when the
    // invitation opens, just like it did when the guest pressed the button.
    if (this.unlocked) {
      try {
        audio.currentTime = 0;
      } catch {
        // Not seekable yet — the browser will start from the live position.
      }
    }

    // Already unlocked inside the guest's tap → it is playing, just fade it in.
    if (this.unlocked && !audio.paused) {
      this.fadeAudio(audio, INVITE.music.volume, 1200);
      return;
    }

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.fadeAudio(audio, INVITE.music.volume, 1200);
        })
        .catch(() => {
          // Autoplay was prevented by browser policy, or file missing
          // Fall back gracefully to ambient tone without continuous retries
          if (this.playing) {
            this.startAmbient();
          }
        });
    }
  }

  private fadeAudio(el: HTMLAudioElement, targetVolume: number, durationMs: number, done?: () => void): void {
    if (this.fadeTimer) clearInterval(this.fadeTimer);
    const steps = 15;
    const stepTime = durationMs / steps;
    const diff = targetVolume - el.volume;
    const increment = diff / steps;

    this.fadeTimer = setInterval(() => {
      const next = el.volume + increment;
      if ((increment > 0 && next >= targetVolume) || (increment < 0 && next <= targetVolume)) {
        el.volume = Math.max(0, Math.min(1, targetVolume));
        clearInterval(this.fadeTimer);
        this.fadeTimer = undefined;
        done?.();
      } else {
        el.volume = Math.max(0, Math.min(1, next));
      }
    }, stepTime);
  }

  /* ------------------- Web Audio Ambient Fallback ------------------- */

  private startAmbient(): void {
    try {
      if (!this.ac) {
        const AudioCtx: typeof AudioContext =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ac = new AudioCtx();
        this.master = this.ac.createGain();
        this.master.gain.value = 0;
        this.master.connect(this.ac.destination);
      }

      if (this.ac.state === 'suspended') {
        void this.ac.resume();
      }

      if (!prefersReducedMotion() && !this.ambientStarted) {
        this.ambientStarted = true;
        this.spawnDrone(110, 0.04);
        this.spawnDrone(164.81, 0.03);

        const scale = [440, 493.88, 554.37, 659.25, 739.99];
        let i = 0;
        const ring = (): void => {
          if (!this.ac || !this.master) return;
          const freq = scale[i % scale.length] * (i % 7 === 6 ? 0.5 : 1);
          this.ringBell(freq, 0.04);
          i++;
        };
        ring();
        this.padTimer = setInterval(ring, 2800);
      }

      if (this.master && this.ac) {
        const now = this.ac.currentTime;
        this.master.gain.cancelScheduledValues(now);
        this.master.gain.linearRampToValueAtTime(
          this.muted ? 0 : INVITE.music.volume * 0.85,
          now + 1.5,
        );
      }
    } catch {
      // AudioContext unavailable
      this.playing = false;
    }
  }

  private spawnDrone(freq: number, gainValue: number): void {
    if (!this.ac || !this.master) return;
    const osc = this.ac.createOscillator();
    const gain = this.ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = gainValue;

    const lfo = this.ac.createOscillator();
    const lfoGain = this.ac.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = gainValue * 0.4;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    osc.connect(gain);
    gain.connect(this.master);
    osc.start();
    lfo.start();
    this.oscillators.push(osc, lfo);
  }

  private ringBell(freq: number, gainValue: number): void {
    if (!this.ac || !this.master) return;
    const osc = this.ac.createOscillator();
    const gain = this.ac.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const now = this.ac.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(gainValue, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + 2.6);
  }

  private stopAmbient(): void {
    this.ambientStarted = false;
    if (this.padTimer) {
      clearInterval(this.padTimer);
      this.padTimer = undefined;
    }
    if (this.master && this.ac) {
      const now = this.ac.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(0, now + 0.5);
    }
    const oscs = this.oscillators;
    this.oscillators = [];
    setTimeout(() => {
      oscs.forEach((o) => {
        try {
          o.stop();
        } catch {}
      });
    }, 600);
  }

  ngOnDestroy(): void {
    if (this.fadeTimer) clearInterval(this.fadeTimer);
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
    }
    this.stopAmbient();
    void this.ac?.close();
  }
}
