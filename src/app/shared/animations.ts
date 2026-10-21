import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/** True when the visitor asked the OS for reduced motion. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Cheap device tier heuristic used to thin out particles on weak phones. */
export function isLowEndDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency ?? 4;
  return (mem !== undefined && mem <= 4) || cores <= 4;
}

/**
 * Splits an element's text into per-letter <span>s wrapped in a word layer so
 * long words never break mid-letter. Returns the created letter spans.
 */
export function splitLetters(el: HTMLElement): HTMLElement[] {
  if (!el) return [];
  if (el.dataset['split'] === 'true') {
    return Array.from(el.querySelectorAll<HTMLElement>('.split-char'));
  }
  const text = el.textContent ?? '';
  el.setAttribute('aria-label', text.trim());
  el.textContent = '';
  const chars: HTMLElement[] = [];

  text.split(/(\s+)/).forEach((token) => {
    if (!token) return;
    if (/^\s+$/.test(token)) {
      el.appendChild(document.createTextNode(' '));
      return;
    }
    const word = document.createElement('span');
    word.className = 'split-word';
    word.style.display = 'inline-block';
    word.style.whiteSpace = 'nowrap';
    for (const ch of token) {
      const span = document.createElement('span');
      span.className = 'split-char';
      span.style.display = 'inline-block';
      span.textContent = ch;
      word.appendChild(span);
      chars.push(span);
    }
    el.appendChild(word);
  });

  el.dataset['split'] = 'true';
  return chars;
}

export interface RevealOptions {
  /** Scroll start position, e.g. 'top 85%'. */
  start?: string;
  delay?: number;
  stagger?: number;
  y?: number;
  duration?: number;
  once?: boolean;
}

/**
 * Registers the shared "reveal on scroll" behaviour inside a GSAP context.
 * Every element carrying [data-reveal] inside `scope` fades/rises into view.
 */
export function revealOnScroll(
  scope: HTMLElement | Element,
  options: RevealOptions = {},
): gsap.Context {
  const {
    start = 'top 86%',
    delay = 0,
    stagger = 0.09,
    y = 54,
    duration = 1.1,
    once = true,
  } = options;

  // Reduced motion: leave every element fully visible, register nothing.
  if (prefersReducedMotion()) {
    return gsap.context(() => undefined, scope);
  }

  return gsap.context(() => {
    const groups = new Map<Element, HTMLElement[]>();
    gsap.utils.toArray<HTMLElement>('[data-reveal]', scope as Element).forEach((el) => {
      // Elements inside a [data-reveal-group] stagger together; lone elements
      // become their own ScrollTrigger so long sections reveal progressively.
      const parent = (el.closest('[data-reveal-group]') as HTMLElement) ?? el;
      const list = groups.get(parent) ?? [];
      list.push(el);
      groups.set(parent, list);
    });

    groups.forEach((els, parent) => {
      gsap.fromTo(
        els,
        { opacity: 0, y, willChange: 'transform, opacity' },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: 'power3.out',
          stagger,
          scrollTrigger: { trigger: parent, start, once },
          clearProps: 'willChange',
        },
      );
    });
    // Cinematic letter-by-letter headings
    gsap.utils.toArray<HTMLElement>('[data-split]', scope as Element).forEach((el) => {
      const chars = splitLetters(el);
      if (!chars.length) return;
      gsap.fromTo(
        chars,
        { opacity: 0, yPercent: 110, rotateX: -55 },
        {
          opacity: 1,
          yPercent: 0,
          rotateX: 0,
          duration: 0.95,
          ease: 'power3.out',
          stagger: 0.026,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        },
      );
    });

    // Image / block mask reveals (curtain lifting off the photo)
    gsap.utils.toArray<HTMLElement>('[data-mask]', scope as Element).forEach((el) => {
      gsap.fromTo(
        el,
        { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.14 },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          scale: 1,
          duration: 1.35,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        },
      );
    });

    // Parallax layers (flowers, ornaments, art)
    gsap.utils.toArray<HTMLElement>('[data-parallax]', scope as Element).forEach((el) => {
      const amount = parseFloat(el.dataset['parallax'] || '-90');
      const rotate = parseFloat(el.dataset['parallaxRotate'] || '0');
      gsap.to(el, {
        y: amount,
        rotate,
        ease: 'none',
        scrollTrigger: {
          trigger: (el.parentElement as HTMLElement) ?? el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    });
  }, scope);
}

/** Small helper: safe setTimeout that always clears. */
export function after(ms: number, fn: () => void): () => void {
  const id = setTimeout(fn, ms);
  return () => clearTimeout(id);
}
