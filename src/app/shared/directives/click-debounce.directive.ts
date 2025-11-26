import { Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';

@Directive({
  selector: '[appClickDebounce]',
  standalone: true
})
export class ClickDebounceDirective {
  @Input({ required: false }) debounceTime = 300; // ms
  @Output() debounced = new EventEmitter<Event>();

  private lastClick = 0;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit() {
    this.el.nativeElement.addEventListener('click', (event: Event) => {
      const now = Date.now();

      if (now - this.lastClick >= this.debounceTime) {
        this.lastClick = now;
        this.debounced.emit(event);
      }
    });
  }
}
