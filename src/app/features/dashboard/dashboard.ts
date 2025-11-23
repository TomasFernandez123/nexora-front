import { Component } from '@angular/core';
import { Sidebar } from "../../core/components/sidebar/sidebar";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-dashboard',
  imports: [Sidebar, RouterOutlet],
  templateUrl: './dashboard.html',
})
export class Dashboard {

}
