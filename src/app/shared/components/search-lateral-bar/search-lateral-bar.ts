import { Component, input, output } from '@angular/core';
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

  onFollowed(userId: string) {
    this.userRemoved.emit(userId);
  }
}
