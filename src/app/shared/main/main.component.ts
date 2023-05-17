import { Component, HostBinding, OnInit, Renderer2 } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AlgoService } from 'src/app/states/algo';
import { AppState } from '../../store/state';
import { ToggleSidebarMenu } from '../../store/ui/actions';
import { UiState } from '../../store/ui/state';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  @HostBinding('class') class = 'wrapper';
  public ui: Observable<UiState> = new Observable<UiState>();

  constructor(
    private renderer: Renderer2,
    private store: Store<AppState>,
    private algoService: AlgoService
  ) {
    this.loadAlgoAccount();
  }

  ngOnInit(): void {
    this.ui = this.store.select('ui');
    this.renderer.removeClass(document.querySelector('body'), 'login-page');
    this.renderer.removeClass(document.querySelector('body'), 'register-page');
    this.renderer.addClass(document.querySelector('body'), 'layout-fixed');
    this.renderer.addClass(
      document.querySelector('body'),
      'layout-navbar-fixed'
    );

    this.ui.subscribe(({ menuSidebarCollapsed }) => {
      if (menuSidebarCollapsed) {
        this.renderer.removeClass(
          document.querySelector('body'),
          'sidebar-open'
        );
        this.renderer.addClass(
          document.querySelector('body'),
          'sidebar-collapse'
        );
      } else {
        this.renderer.removeClass(
          document.querySelector('body'),
          'sidebar-collapse'
        );
        this.renderer.addClass(document.querySelector('body'), 'sidebar-open');
      }
    });
  }
  onToggleMenuSidebar() {
    this.store.dispatch(new ToggleSidebarMenu());
  }

  loadAlgoAccount() {
    this.algoService.getAccountData();
  }
}
