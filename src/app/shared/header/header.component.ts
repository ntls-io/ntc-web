import { Component, HostBinding, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/state';
import { ToggleSidebarMenu } from '../../store/ui/actions';

const BASE_CLASSES = 'main-header navbar navbar-expand';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @HostBinding('class') classes: string = BASE_CLASSES;
  public ui: any;

  constructor(private store: Store<AppState>) {}

  ngOnInit() {
    this.ui = this.store.select('ui');
  }

  onToggleMenuSidebar() {
    this.store.dispatch(new ToggleSidebarMenu());
  }
}
