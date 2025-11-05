import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { Sidebar } from "../../core/components/sidebar/sidebar";
import { SearchLateralBar } from "../../shared/components/search-lateral-bar/search-lateral-bar";

@Component({
  selector: 'app-main',
  imports: [RouterOutlet, Sidebar, SearchLateralBar],
  templateUrl: './main.html',
})
export class Main {

}
