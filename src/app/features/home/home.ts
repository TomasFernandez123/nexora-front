import { Component, inject } from '@angular/core';
import { Auth } from '../auth/services/auth';
import { Sidebar } from "../../core/components/sidebar/sidebar";

@Component({
  selector: 'app-home',
  imports: [Sidebar],
  templateUrl: './home.html',
})
export class Home {
  auth = inject(Auth);

}
