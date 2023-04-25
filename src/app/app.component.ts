import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SessionQuery } from './states/session';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private sessionQuery: SessionQuery, private router: Router) {
    this.initializeApp();
  }

  initializeApp() {
    this.sessionQuery
      .select('vault')
      .pipe(untilDestroyed(this))
      .subscribe(vault => {
        const path = vault?.username ? '' : 'auth';
        this.router.navigate([path]);
      });
  }
}
