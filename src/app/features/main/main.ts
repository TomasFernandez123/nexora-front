import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { Sidebar } from "../../core/components/sidebar/sidebar";

@Component({
  selector: 'app-main',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './main.html',
})
export class Main {

}
