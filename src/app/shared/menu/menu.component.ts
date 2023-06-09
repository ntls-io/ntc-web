import { Component, HostBinding, OnInit } from '@angular/core';

const BASE_CLASSES = 'main-sidebar elevation-1';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  @HostBinding('class') classes: string = BASE_CLASSES;
  public menu = MENU;

  constructor() {}

  ngOnInit(): void {}
}

export const MENU = [
  {
    name: 'Home',
    iconClasses: 'bi-house',
    path: ['/home']
  },
  {
    name: 'Data Pools',
    iconClasses: 'bi-columns-gap',
    path: ['/pools']
  },
  {
    name: 'Analysis',
    iconClasses: 'bi-pie-chart',
    path: ['/analysis']
  },
  {
    name: 'Market',
    iconClasses: 'bi-cart3',
    path: ['/market']
  }
];
