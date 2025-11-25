import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appRipple]',
  host: {
    '(click)': 'createRipple($event)',
    'style.position': '"relative"',
    'style.overflow': '"hidden"',
    'aria-label': '"Ripple effect button"'
  }
})
export class RippleDirective {

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  createRipple(event: MouseEvent): void {
    const host = this.el.nativeElement;

    // Remove old ripple if exists
    const oldRipple = host.querySelector('.ripple');
    if (oldRipple) {
      oldRipple.remove();
    }

    const ripple = this.renderer.createElement('span');
    this.renderer.addClass(ripple, 'ripple');

    const diameter = Math.max(host.clientWidth, host.clientHeight);
    const radius = diameter / 2;

    this.renderer.setStyle(ripple, 'width', `${diameter}px`);
    this.renderer.setStyle(ripple, 'height', `${diameter}px`);
    this.renderer.setStyle(ripple, 'left', `${event.clientX - host.getBoundingClientRect().left - radius}px`);
    this.renderer.setStyle(ripple, 'top', `${event.clientY - host.getBoundingClientRect().top - radius}px`);
    this.renderer.setStyle(ripple, 'position', 'absolute');
    this.renderer.setStyle(ripple, 'background', 'rgba(255,255,255,0.35)');
    this.renderer.setStyle(ripple, 'border-radius', '50%');
    this.renderer.setStyle(ripple, 'transform', 'scale(0)');
    this.renderer.setStyle(ripple, 'animation', 'rippleEffect 600ms ease-out');
    this.renderer.setStyle(ripple, 'pointer-events', 'none');

    host.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }
}
