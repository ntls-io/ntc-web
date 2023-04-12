import { Component, HostBinding, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthenticationService } from '../../core/services/authentication.service';
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
  public searchForm: UntypedFormGroup = new UntypedFormGroup({});

  constructor(
    private appService: AuthenticationService,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.ui = this.store.select('ui');
    // this.ui.subscribe((state: UiState) => {
    //     this.classes = `${BASE_CLASSES} ${state.navbarVariant}`;
    // });
    this.searchForm = new UntypedFormGroup({
      search: new UntypedFormControl(null)
    });
  }

  logout() {
    this.appService.removeCurrentUser();
  }

  onToggleMenuSidebar() {
    this.store.dispatch(new ToggleSidebarMenu());
  }
}
