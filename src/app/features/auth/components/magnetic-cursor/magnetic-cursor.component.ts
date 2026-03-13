import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  afterNextRender,
  signal,
  computed,
} from '@angular/core';

type CursorState = 'default' | 'focus';

@Component({
  selector: 'app-magnetic-cursor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="cursor-ring"
      [style.transform]="transform()"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [class.cursor-focus]="state() === 'focus'"
    ></div>
    <div
      class="cursor-dot"
      [style.transform]="transform()"
      [class.cursor-dot--hidden]="state() !== 'default'"
    ></div>
  `,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: 99999;
      pointer-events: none;
      overflow: hidden;
    }

    .cursor-ring {
      position: fixed;
      border-radius: 50%;
      border: 1.5px solid rgba(29, 155, 240, 0.7);
      background: transparent;
      top: 0;
      left: 0;
      translate: -50% -50%;
      transition:
        width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
        height 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
        background 0.25s ease,
        border-color 0.25s ease;
      will-change: transform, width, height;
    }

    .cursor-ring.cursor-focus {
      background: rgba(29, 155, 240, 0.08);
      border-color: rgba(29, 155, 240, 0.9);
      border-radius: 14px;
    }

    .cursor-dot {
      position: fixed;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #1d9bf0;
      top: 0;
      left: 0;
      translate: -50% -50%;
      transition: opacity 0.2s ease;
      will-change: transform;
    }
    .cursor-dot--hidden {
      opacity: 0;
    }
  `,
})
export class MagneticCursor implements OnDestroy {
  private rawX = signal(0);
  private rawY = signal(0);
  readonly state = signal<CursorState>('default');

  readonly transform = computed(() => `translate(${this.rawX()}px, ${this.rawY()}px)`);
  readonly size = computed(() => (this.state() === 'focus' ? 52 : 26));

  private readonly _cleanupFns: Array<() => void> = [];

  constructor() {
    afterNextRender(() => {
      document.body.classList.add('hide-cursor');
      this._setup();
    });
  }

  private _setup() {
    let rafId = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const tick = () => {
      currentX = lerp(currentX, targetX, 0.18);
      currentY = lerp(currentY, targetY, 0.18);
      this.rawX.set(Math.round(currentX * 100) / 100);
      this.rawY.set(Math.round(currentY * 100) / 100);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };
    const INTERACTIVE = 'a, button, [role="button"], label, select, textarea';
    const INPUT_SEL = 'input, textarea';
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      if (t.matches(INPUT_SEL)) this.state.set('focus');
    };
    const onFocusOut = () => this.state.set('default');

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);

    this._cleanupFns.push(
      () => cancelAnimationFrame(rafId),
      () => window.removeEventListener('mousemove', onMove),
      () => document.removeEventListener('focusin', onFocusIn),
      () => document.removeEventListener('focusout', onFocusOut),
      () => document.body.classList.remove('hide-cursor'),
    );
  }

  ngOnDestroy() {
    this._cleanupFns.forEach((fn) => fn());
  }
}
