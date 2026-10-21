import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Placement {
  x: number;
  y: number;
  s: number;
  rot?: number;
}

/**
 * Decorative botanical SVG artwork used across the invitation
 * (hero arch, finale, dividers, card corners).
 *
 * Every instance mints its own id prefix so multiple frames can safely live
 * on the same page without SVG id collisions.
 */
@Component({
  selector: 'app-floral-frame',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [class]="'ff-svg ff-' + variant"
      [attr.viewBox]="viewBox"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient [attr.id]="uid + '-gold'" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f2dfb6" />
          <stop offset="40%" stop-color="#d4af77" />
          <stop offset="100%" stop-color="#a8783f" />
        </linearGradient>

        <linearGradient [attr.id]="uid + '-rose'" x1="0.2" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stop-color="#ffd9e7" />
          <stop offset="55%" stop-color="#f3a2bf" />
          <stop offset="100%" stop-color="#e0739a" />
        </linearGradient>

        <linearGradient [attr.id]="uid + '-roseDeep'" x1="0.2" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stop-color="#f7b6cd" />
          <stop offset="60%" stop-color="#e75480" />
          <stop offset="100%" stop-color="#a83a63" />
        </linearGradient>

        <linearGradient [attr.id]="uid + '-leaf'" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#cddcc0" />
          <stop offset="100%" stop-color="#a3ba91" />
        </linearGradient>

        <!-- Soft rose -->
        <symbol [attr.id]="uid + '-rose'" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" [attr.fill]="'url(#' + uid + '-rose)'" />
          <path
            d="M50 12C71 12 87 28 87 49C87 71 69 87 48 87C29 87 13 72 13 54C13 37 26 25 42 25C57 25 67 35 67 48C67 59 58 67 48 67"
            fill="none"
            stroke="#ffffff"
            stroke-opacity="0.65"
            stroke-width="6.5"
            stroke-linecap="round"
          />
          <path
            d="M50 31C62 31 73 41 73 53C73 65 63 75 51 75C41 75 33 67 33 57"
            fill="none"
            stroke="#ffffff"
            stroke-opacity="0.5"
            stroke-width="4.5"
            stroke-linecap="round"
          />
          <circle cx="52" cy="53" r="6.5" [attr.fill]="'url(#' + uid + '-roseDeep)'" />
        </symbol>

        <!-- Deep rose accent -->
        <symbol [attr.id]="uid + '-roseDeep'" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" [attr.fill]="'url(#' + uid + '-roseDeep)'" />
          <path
            d="M50 14C70 14 85 29 85 49C85 70 68 86 48 86C30 86 15 71 15 53C15 37 27 26 42 26C56 26 66 36 66 48C66 59 57 67 47 67"
            fill="none"
            stroke="#ffdbe8"
            stroke-opacity="0.55"
            stroke-width="6"
            stroke-linecap="round"
          />
          <circle cx="51" cy="52" r="7" fill="#7d2b4d" fill-opacity="0.55" />
        </symbol>

        <!-- Champagne bud / pearl -->
        <symbol [attr.id]="uid + '-bud'" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="13" [attr.fill]="'url(#' + uid + '-gold)'" />
          <circle cx="16" cy="15" r="4" fill="#fff8e8" fill-opacity="0.8" />
        </symbol>

        <!-- Eucalyptus style leaf -->
        <symbol [attr.id]="uid + '-leaf'" viewBox="0 0 100 56">
          <path
            d="M3 40C22 6 68 -8 97 8C82 44 34 60 3 40Z"
            [attr.fill]="'url(#' + uid + '-leaf)'"
            fill-opacity="0.92"
          />
          <path
            d="M7 40C36 32 66 20 93 10"
            fill="none"
            stroke="#ffffff"
            stroke-opacity="0.55"
            stroke-width="3"
            stroke-linecap="round"
          />
        </symbol>

        <!-- Sprig: three tiny leaves -->
        <symbol [attr.id]="uid + '-sprig'" viewBox="0 0 100 40">
          <path d="M2 34C24 30 52 20 96 4" fill="none" stroke="#a3ba91" stroke-width="3" stroke-linecap="round" />
          <ellipse cx="26" cy="22" rx="12" ry="7" [attr.fill]="'url(#' + uid + '-leaf)'" transform="rotate(-22 26 22)" />
          <ellipse cx="52" cy="15" rx="12" ry="7" [attr.fill]="'url(#' + uid + '-leaf)'" transform="rotate(-20 52 15)" />
          <ellipse cx="76" cy="8" rx="11" ry="6" [attr.fill]="'url(#' + uid + '-leaf)'" transform="rotate(-18 76 8)" />
        </symbol>
      </defs>

      <!-- ============ ARCH ============ -->
      <g *ngIf="variant === 'arch'">
        <path
          class="ff-line"
          d="M60 620A440 440 0 0 1 940 620"
          fill="none"
          [attr.stroke]="'url(#' + uid + '-gold)'"
          stroke-width="2.4"
          stroke-linecap="round"
        />
        <path
          class="ff-line ff-line-soft"
          d="M92 620A408 408 0 0 1 908 620"
          fill="none"
          stroke="#e75480"
          stroke-opacity="0.35"
          stroke-width="1.2"
          stroke-dasharray="2 12"
          stroke-linecap="round"
        />

        <ng-container *ngFor="let l of archLeaves">
          <use
            [attr.href]="'#' + uid + '-leaf'"
            [attr.x]="l.x - l.s / 2"
            [attr.y]="l.y - (l.s * 0.56) / 2"
            [attr.width]="l.s"
            [attr.height]="l.s * 0.56"
            [attr.transform]="'rotate(' + (l.rot || 0) + ' ' + l.x + ' ' + l.y + ')'"
          />
        </ng-container>

        <ng-container *ngFor="let r of archRoses">
          <use
            [attr.href]="'#' + uid + (r.deep ? '-roseDeep' : '-rose')"
            [attr.x]="r.x - r.s / 2"
            [attr.y]="r.y - r.s / 2"
            [attr.width]="r.s"
            [attr.height]="r.s"
          />
        </ng-container>

        <ng-container *ngFor="let b of archBuds">
          <use
            [attr.href]="'#' + uid + '-bud'"
            [attr.x]="b.x - b.s / 2"
            [attr.y]="b.y - b.s / 2"
            [attr.width]="b.s"
            [attr.height]="b.s"
          />
        </ng-container>

        <!-- dangling pearls at the arch feet -->
        <g class="ff-dangle">
          <path d="M60 620v46" stroke="#d4af77" stroke-width="1.6" />
          <use [attr.href]="'#' + uid + '-rose'" x="34" y="660" width="52" height="52" />
          <path d="M940 620v46" stroke="#d4af77" stroke-width="1.6" />
          <use [attr.href]="'#' + uid + '-rose'" x="914" y="660" width="52" height="52" />
        </g>
      </g>

      <!-- ============ CORNER ============ -->
      <g *ngIf="variant === 'corner'">
        <g *ngFor="let c of cornerGroups" [attr.transform]="c">
          <use [attr.href]="'#' + uid + '-sprig'" x="8" y="8" width="150" height="60" />
          <use [attr.href]="'#' + uid + '-leaf'" x="-6" y="52" width="96" height="54" [attr.transform]="'rotate(38 42 79)'" />
          <use [attr.href]="'#' + uid + '-rose'" x="34" y="34" width="74" height="74" />
          <use [attr.href]="'#' + uid + '-roseDeep'" x="92" y="14" width="46" height="46" />
          <use [attr.href]="'#' + uid + '-bud'" x="24" y="104" width="26" height="26" />
        </g>
      </g>

      <!-- ============ DIVIDER ============ -->
      <g *ngIf="variant === 'divider'">
        <path d="M10 30H150" [attr.stroke]="'url(#' + uid + '-gold)'" stroke-width="1.6" stroke-linecap="round" />
        <path d="M250 30H490" [attr.stroke]="'url(#' + uid + '-gold)'" stroke-width="1.6" stroke-linecap="round" />
        <use [attr.href]="'#' + uid + '-leaf'" x="150" y="8" width="60" height="34" />
        <use [attr.href]="'#' + uid + '-leaf'" x="240" y="8" width="60" height="34" [attr.transform]="'scale(-1,1) translate(-540,0)'" />
        <use [attr.href]="'#' + uid + '-rose'" x="192" y="2" width="56" height="56" />
        <use [attr.href]="'#' + uid + '-bud'" x="146" y="44" width="18" height="18" />
        <use [attr.href]="'#' + uid + '-bud'" x="336" y="44" width="18" height="18" />
      </g>
    </svg>
  `,
  styles: [
    `
      :host {
        display: block;
        pointer-events: none;
      }
      .ff-svg {
        width: 100%;
        height: auto;
        overflow: visible;
        display: block;
      }
      .ff-svg.ff-corner {
        height: 100%;
      }
      .ff-line-soft {
        animation: ff-dash 26s linear infinite;
      }
      @keyframes ff-dash {
        to {
          stroke-dashoffset: -280;
        }
      }
      .ff-dangle {
        animation: ff-sway 7s ease-in-out infinite;
        transform-origin: 60px 620px;
      }
      @keyframes ff-sway {
        0%,
        100% {
          transform: rotate(-1.4deg);
        }
        50% {
          transform: rotate(1.4deg);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .ff-line-soft,
        .ff-dangle {
          animation: none;
        }
      }
    `,
  ],
})
export class FloralFrameComponent {
  @Input() variant: 'arch' | 'corner' | 'divider' = 'arch';

  readonly uid = 'ff' + Math.random().toString(36).slice(2, 8);

  /** Arch florals — points sampled along a 440r arc centred at (500, 620). */
  readonly archRoses: (Placement & { deep?: boolean })[] = [
    { x: 60, y: 620, s: 104 },
    { x: 93.5, y: 451.6, s: 78, deep: true },
    { x: 188.9, y: 318.9, s: 86 },
    { x: 331.6, y: 211.6, s: 70, deep: true },
    { x: 500, y: 180, s: 96 },
    { x: 668.4, y: 211.6, s: 70, deep: true },
    { x: 811.1, y: 318.9, s: 86 },
    { x: 906.5, y: 451.6, s: 78, deep: true },
    { x: 940, y: 620, s: 104 },
  ];

  readonly archLeaves: Placement[] = [
    { x: 68.4, y: 534.2, s: 96, rot: -66 },
    { x: 134.1, y: 375.5, s: 104, rot: -42 },
    { x: 255.5, y: 254.1, s: 96, rot: -22 },
    { x: 414.2, y: 188.4, s: 92, rot: -8 },
    { x: 585.8, y: 188.4, s: 92, rot: 8 },
    { x: 744.5, y: 254.1, s: 96, rot: 22 },
    { x: 865.9, y: 375.5, s: 104, rot: 42 },
    { x: 931.6, y: 534.2, s: 96, rot: 66 },
  ];

  readonly archBuds: Placement[] = [
    { x: 150, y: 330, s: 26 },
    { x: 268, y: 226, s: 22 },
    { x: 400, y: 168, s: 24 },
    { x: 600, y: 168, s: 24 },
    { x: 732, y: 226, s: 22 },
    { x: 850, y: 330, s: 26 },
  ];

  readonly cornerGroups = [
    'translate(0,0)',
    'translate(600,0) scale(-1,1)',
    'translate(0,400) scale(1,-1)',
    'translate(600,400) scale(-1,-1)',
  ];

  get viewBox(): string {
    switch (this.variant) {
      case 'corner':
        return '0 0 600 400';
      case 'divider':
        return '0 0 500 60';
      default:
        return '0 0 1000 730';
    }
  }
}
