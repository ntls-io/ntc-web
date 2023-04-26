import { Component, HostBinding, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionQuery, SessionService } from 'src/app/states/session';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @HostBinding('class') class = 'login-box vh-100 d-flex align-items-center';

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required)
  });
  isBusy = false;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private sessionService: SessionService,
    private sessionQuery: SessionQuery
  ) {}

  ngOnInit(): void {
    this.renderer.addClass(document.querySelector('app-root'), 'login-page');

    const isAuthenticated = this.sessionQuery.isAuthenticated();
    if (isAuthenticated) {
      this.router.navigate(['dashboard']);
    }
  }

  get f() {
    return this.loginForm.controls;
  }
  async loginByAuth() {
    this.loginForm.markAsTouched();
    if (this.loginForm.valid) {
      this.isBusy = true;
      const { username, password } = this.loginForm.value;

      await this.sessionService
        .login(username!, password!)
        .then(result => {
          if (result !== 'success') {
            throw new Error(result);
          }
        })
        .catch(error => {
          Swal.fire({
            icon: 'error',
            titleText: 'Oops...',
            html:
              error +
              '<hr><p>If you have not created an account yet please sign up</p>',
            confirmButtonText: 'Sign up',
            confirmButtonColor: '#ff7042',
            showCancelButton: true,
            cancelButtonText: 'Try again',
            cancelButtonColor: '#28ba62',
            reverseButtons: true
          }).then(({ isConfirmed }) => {
            if (isConfirmed) {
              this.router.navigate(['auth', 'register']);
            }
          });
        })
        .finally(() => {
          this.isBusy = false;
        });
    }
  }
  ngOnDestroy() {
    this.renderer.removeClass(document.querySelector('app-root'), 'login-page');
  }
}
