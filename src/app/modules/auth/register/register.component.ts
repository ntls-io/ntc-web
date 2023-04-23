import { Component, HostBinding, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @HostBinding('class') class = 'register-box vh-100 d-flex align-items-center';
  submitted: boolean = false;
  registerForm = new FormGroup({
    firstname: new FormControl('', [Validators.required]),
    lastname: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    retypePassword: new FormControl('', Validators.required)
  });
  constructor(private renderer: Renderer2, private route: Router) {}

  registerByAuth() {
    this.route.navigate(['/auth/login']);
  }

  get f() {
    return this.registerForm.controls;
  }

  ngOnInit(): void {
    this.renderer.addClass(document.querySelector('app-root'), 'register-page');
  }
  ngOnDestroy() {
    this.renderer.removeClass(
      document.querySelector('app-root'),
      'register-page'
    );
  }
}
