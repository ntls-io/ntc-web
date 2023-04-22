import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  public user: any;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  logout() {
    this.router.navigate(['/auth/login']);
  }
}
