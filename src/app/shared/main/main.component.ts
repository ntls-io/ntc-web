import { Component, HostBinding, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AlgoService } from 'src/app/states/algo';
import { SessionQuery } from 'src/app/states/session';
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
    private store: Store<AppState>,
    private sessionQuery: SessionQuery,
    private algoService: AlgoService
  ) {
    this.loadAlgoAccount();
  }

  ngOnInit(): void {
    this.ui = this.store.select('ui');
    const body = document.querySelector('body');
    body?.classList.add('layout-fixed', 'layout-navbar-fixed');

    this.ui.subscribe(({ menuSidebarCollapsed }) => {
      if (menuSidebarCollapsed) {
        body?.classList.remove('sidebar-open');
        body?.classList.add('sidebar-collapse');
      } else {
        body?.classList.remove('sidebar-collapse');
        body?.classList.add('sidebar-open');
      }
    });
  }
  onToggleMenuSidebar() {
    this.store.dispatch(new ToggleSidebarMenu());
  }

  loadAlgoAccount() {
    const { vault } = this.sessionQuery.getValue();

    if (vault?.algorand_address_base32)
      this.algoService.getAccountData(vault.algorand_address_base32);
  }
}
