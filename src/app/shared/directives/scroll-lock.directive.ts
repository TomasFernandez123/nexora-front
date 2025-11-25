import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[appScrollLock]',
  host: {
    '[class.scroll-lock-active]': 'locked'
  }
})
export class ScrollLockDirective {
  @Input('appScrollLock') locked = false;

  ngOnChanges(): void {
    if (this.locked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }
}
