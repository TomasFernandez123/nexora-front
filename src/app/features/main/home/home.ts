import { Component, inject } from '@angular/core';
import { Auth } from '../../auth/services/auth';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home {
  auth = inject(Auth);

}
