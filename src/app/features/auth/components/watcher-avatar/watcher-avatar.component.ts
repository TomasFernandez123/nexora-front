import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  afterNextRender,
  OnDestroy,
  ElementRef,
  inject,
} from '@angular/core';

type WatcherState = 'tracking' | 'covering' | 'approving';

const MAX_TRAVEL = 3.5; // SVG units

@Component({
  selector: 'app-watcher-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: flex;
      justify-content: center;
      margin-bottom: 6px;
    }

    svg {
      width: 90px;
      height: 90px;
      filter: drop-shadow(0 0 10px rgba(29, 155, 240, 0.3));
      transition:
        filter 0.4s ease,
        transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .eye-normal {
      transition: opacity 0.22s ease;
    }
    .eye-normal.hidden {
      opacity: 0;
    }

    .eye-happy {
      opacity: 0;
      transition: opacity 0.22s ease;
    }
    .eye-happy.visible {
      opacity: 1;
    }

    .eyelid {
      transform-box: fill-box;
      transform-origin: 50% 0%;
      transform: scaleY(0);
      transition: transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .eyelid.closed {
      transform: scaleY(1);
    }

    .eyebrow {
      transform-box: fill-box;
      transform-origin: center;
      transition: transform 0.3s ease;
    }
    .eyebrow.up {
      transform: translateY(-2.5px);
    }

    .approval-bounce {
      animation: none;
    }
    .approval-bounce.active {
      animation: nod 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    @keyframes nod {
      0% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-5px);
      }
      70% {
        transform: translateY(2px);
      }
      100% {
        transform: translateY(0);
      }
    }
  `,
  template: `
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      class="approval-bounce"
      [class.active]="justApproved()"
      aria-label="Nexora watcher"
      role="img"
    >
      <!-- Face -->
      <circle cx="50" cy="53" r="44" fill="#0f1419" />
      <circle
        cx="50"
        cy="53"
        r="44"
        fill="none"
        stroke="#1d9bf0"
        stroke-width="1.2"
        opacity="0.4"
      />

      <!-- Antenna -->
      <circle cx="50" cy="10" r="3.5" fill="#1d9bf0" opacity="0.7" />
      <line x1="50" y1="13.5" x2="50" y2="21" stroke="#1d9bf0" stroke-width="1.2" opacity="0.4" />

      <!-- Eyebrows -->
      <path
        class="eyebrow"
        [class.up]="state() === 'approving'"
        d="M 21 38 Q 32 33 43 38"
        stroke="#1d9bf0"
        stroke-width="1.8"
        fill="none"
        stroke-linecap="round"
        opacity="0.65"
      />
      <path
        class="eyebrow"
        [class.up]="state() === 'approving'"
        d="M 57 38 Q 68 33 79 38"
        stroke="#1d9bf0"
        stroke-width="1.8"
        fill="none"
        stroke-linecap="round"
        opacity="0.65"
      />

      <!-- Eye sockets -->
      <ellipse cx="33" cy="51" rx="10.5" ry="11.5" fill="#060d1a" />
      <ellipse
        cx="33"
        cy="51"
        rx="10.5"
        ry="11.5"
        fill="none"
        stroke="#1d9bf0"
        stroke-width="0.9"
        opacity="0.8"
      />
      <ellipse cx="67" cy="51" rx="10.5" ry="11.5" fill="#060d1a" />
      <ellipse
        cx="67"
        cy="51"
        rx="10.5"
        ry="11.5"
        fill="none"
        stroke="#1d9bf0"
        stroke-width="0.9"
        opacity="0.8"
      />

      <!-- Normal pupils (tracking) -->
      <g class="eye-normal" [class.hidden]="state() !== 'tracking'">
        <circle [attr.cx]="lpx()" [attr.cy]="lpy()" r="5.5" fill="#1d9bf0" />
        <circle [attr.cx]="lpx()" [attr.cy]="lpy()" r="2" fill="white" opacity="0.9" />
        <circle
          [attr.cx]="lpx() + 1.5"
          [attr.cy]="lpy() - 1.5"
          r="0.8"
          fill="white"
          opacity="0.55"
        />

        <circle [attr.cx]="rpx()" [attr.cy]="rpy()" r="5.5" fill="#1d9bf0" />
        <circle [attr.cx]="rpx()" [attr.cy]="rpy()" r="2" fill="white" opacity="0.9" />
        <circle
          [attr.cx]="rpx() + 1.5"
          [attr.cy]="rpy() - 1.5"
          r="0.8"
          fill="white"
          opacity="0.55"
        />
      </g>

      <!-- Happy arc eyes (approving) -->
      <g class="eye-happy" [class.visible]="state() === 'approving'">
        <path
          d="M 23.5 52 Q 33 41 42.5 52"
          stroke="#1d9bf0"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
        />
        <path
          d="M 57.5 52 Q 67 41 76.5 52"
          stroke="#1d9bf0"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
        />
      </g>

      <!-- Eyelids — rendered last to sit on top -->
      <ellipse
        class="eyelid"
        [class.closed]="state() === 'covering'"
        cx="33"
        cy="51"
        rx="11.5"
        ry="12.5"
        fill="#0f1419"
      />
      <ellipse
        class="eyelid"
        [class.closed]="state() === 'covering'"
        cx="67"
        cy="51"
        rx="11.5"
        ry="12.5"
        fill="#0f1419"
      />

      <!-- Mouth -->
      @if (state() === 'approving') {
        <path
          d="M 34 70 Q 50 82 66 70"
          stroke="#1d9bf0"
          stroke-width="2.2"
          fill="none"
          stroke-linecap="round"
          opacity="0.9"
        />
      } @else {
        <path
          d="M 39 70 Q 50 77 61 70"
          stroke="#1d9bf0"
          stroke-width="1.6"
          fill="none"
          stroke-linecap="round"
          opacity="0.6"
        />
      }
    </svg>
  `,
})
export class WatcherAvatar implements OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);

  readonly state = signal<WatcherState>('tracking');
  readonly justApproved = signal(false);

  private readonly _nx = signal(0);
  private readonly _ny = signal(0);

  readonly lpx = computed(() => 33 + this._nx() * MAX_TRAVEL);
  readonly lpy = computed(() => 51 + this._ny() * MAX_TRAVEL);
  readonly rpx = computed(() => 67 + this._nx() * MAX_TRAVEL);
  readonly rpy = computed(() => 51 + this._ny() * MAX_TRAVEL);

  private readonly _cleanups: Array<() => void> = [];
  private _approvalTimeout = 0;

  constructor() {
    afterNextRender(() => this._init());
  }

  private _init() {
    const SOCIAL_SEL = '[aria-label="Log in with Google"], [aria-label="Log in with GitHub"]';
    const PASSWORD_SEL = 'input[type="password"]';

    // Eye tracking
    const onMove = (e: MouseEvent) => {
      const svg = this.el.nativeElement.querySelector('svg') as SVGSVGElement;
      const rect = svg?.getBoundingClientRect();
      if (!rect) return;

      const scale = rect.width / 100;
      const lx = rect.left + 33 * scale;
      const ly = rect.top + 51 * scale;
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) return;
      this._nx.set(dx / dist);
      this._ny.set(dy / dist);
    };

    // Password covering
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      if (t.matches(PASSWORD_SEL)) this.state.set('covering');
    };

    const onFocusOut = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      if (t.matches(PASSWORD_SEL) && this.state() === 'covering') {
        this.state.set('tracking');
      }
    };

    // Re-check after password toggle click
    const onClick = () => {
      requestAnimationFrame(() => {
        const active = document.activeElement as HTMLInputElement;
        if (active?.tagName === 'INPUT') {
          this.state.set(active.type === 'password' ? 'covering' : 'tracking');
        }
      });
    };

    // Social button hover
    const onMouseOver = (e: MouseEvent) => {
      if (this.state() === 'covering') return;
      if ((e.target as HTMLElement).closest(SOCIAL_SEL)) {
        this.state.set('approving');
        this.justApproved.set(true);
        clearTimeout(this._approvalTimeout);
        this._approvalTimeout = window.setTimeout(() => this.justApproved.set(false), 600);
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(SOCIAL_SEL) && this.state() === 'approving') {
        this.state.set('tracking');
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    document.addEventListener('click', onClick);
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseout', onMouseOut, { passive: true });

    this._cleanups.push(
      () => window.removeEventListener('mousemove', onMove),
      () => document.removeEventListener('focusin', onFocusIn),
      () => document.removeEventListener('focusout', onFocusOut),
      () => document.removeEventListener('click', onClick),
      () => document.removeEventListener('mouseover', onMouseOver),
      () => document.removeEventListener('mouseout', onMouseOut),
      () => clearTimeout(this._approvalTimeout),
    );
  }

  ngOnDestroy() {
    this._cleanups.forEach((fn) => fn());
  }
}
