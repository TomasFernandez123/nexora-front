import {
  Component,
  ElementRef,
  HostListener,
  input,
  output,
  signal,
  viewChild,
  afterNextRender,
} from '@angular/core';
import { SuggestionToFollow } from '../suggestion-to-follow/suggestion-to-follow';
import { User } from '../../../features/auth/services/auth';

@Component({
  selector: 'app-search-lateral-bar',
  imports: [SuggestionToFollow],
  templateUrl: './search-lateral-bar.html',
})
export class SearchLateralBar {
  users = input.required<User[]>();
  userRemoved = output<string>();

  sidebarContainer = viewChild<ElementRef<HTMLElement>>('sidebarContainer');
  stickyTop = signal(0);

  constructor() {
    afterNextRender(() => {
      this.calculateStickyTop();
    });
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onScrollOrResize() {
    this.calculateStickyTop();
  }

  private calculateStickyTop() {
    const el = this.sidebarContainer()?.nativeElement;
    if (!el) return;

    const vh = window.innerHeight;
    const height = el.offsetHeight;

    if (height <= vh) {
      this.stickyTop.set(0);
    } else {
      // Sticks softly to the bottom, leaving a 16px bottom padding
      this.stickyTop.set(vh - height - 16);
    }
  }

  onFollowed(userId: string) {
    this.userRemoved.emit(userId);
  }

  trends = [
    { tag: '#javascript', posts: '120K' },
    { tag: '#webdev', posts: '85K' },
    { tag: '#hiring', posts: '42K' },
  ];

  events = [
    { title: 'React Workshop', date: 'Tomorrow, 18:00', type: 'Webinar' },
    { title: 'Tech Meetup BsAs', date: 'This Friday', type: 'Meetup' },
    { title: 'Next.js 15 Release', date: 'Oct 26', type: 'Launch' },
  ];

  groups = [
    { name: 'React Developers', members: '15K' },
    { name: 'Ciberseguridad', members: '8.2K' },
    { name: 'Frontend Masters', members: '24K' },
  ];
}
