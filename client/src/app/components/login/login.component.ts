import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  nicknameFormControl = new FormControl('', Validators.required);

  constructor(
    private _authService: AuthService,
    private _router: Router,
  ) { }

  submit() {
    if (this.nicknameFormControl.valid) {
      this._authService.login(this.nicknameFormControl.value)
        .then(res => {
          if (res.success) this._router.navigate(['game', 'list']);
        })
        .catch(err => console.log(err));
    }
  }

}
