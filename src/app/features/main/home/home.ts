import { Component, inject } from '@angular/core';
import { Auth } from '../../auth/services/auth';
import { Post } from "../../../shared/components/post/post";

@Component({
  selector: 'app-home',
  imports: [Post],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home {
  auth = inject(Auth);

}
