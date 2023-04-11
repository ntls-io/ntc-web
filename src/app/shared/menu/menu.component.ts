import { Component, HostBinding, OnInit } from "@angular/core";
import { AuthenticationService } from "../../core/services/authentication.service";

const BASE_CLASSES = "main-sidebar elevation-1";

@Component({
  selector: "app-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.scss"]
})
export class MenuComponent implements OnInit {
  @HostBinding("class") classes: string = BASE_CLASSES;
  public menu = MENU;

  constructor(public appService: AuthenticationService) {}

  ngOnInit(): void {}
}

export const MENU = [
  {
    name: "Home",
    iconClasses: "bi-house",
    path: ["/home"]
  },
  {
    name: "Pools",
    iconClasses: "bi-columns-gap",
    path: ["/pools"]
  }
];
