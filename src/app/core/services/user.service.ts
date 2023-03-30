import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  //userlist: any[] = [];
  // validateuser: boolean = false;

  login() {}

  register(data: any) {}

  getalluser() {}
}
