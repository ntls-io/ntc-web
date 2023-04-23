import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionQuery, SessionStore } from 'src/app/states/session';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  public user: any;

  constructor(
    private router: Router,
    public sessionQuery: SessionQuery,
    private sessionStore: SessionStore
  ) {}

  ngOnInit(): void {}

  logout() {
    this.sessionStore.reset();
  }
}
