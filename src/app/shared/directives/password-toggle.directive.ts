import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appPasswordToggle]',
  host: {
    '(click)': 'toggle()',
    'style.cursor': '"pointer"',
    'aria-label': '"Toggle password visibility"'
  }
})
export class PasswordToggleDirective {
  private icon!: HTMLElement;
  private input!: HTMLInputElement;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.icon = this.el.nativeElement;
    this.input = this.icon.previousElementSibling as HTMLInputElement;
  }

  toggle(): void {
    if (!this.input) return;

    const type = this.input.type === 'password' ? 'text' : 'password';
    this.input.type = type;

    this.icon.classList.toggle('active');
  }
}
