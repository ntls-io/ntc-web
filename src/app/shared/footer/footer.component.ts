import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  @HostBinding('class') classes: string = 'main-footer';
  public currentYear: string = new Date().getFullYear().toString();
}
