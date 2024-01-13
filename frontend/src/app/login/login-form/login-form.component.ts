import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { UserCredentials } from "../model/user-credentials";
import { AuthenticationService } from "../authentication.service";

@Component({
  selector: "app-login-form",
  templateUrl: "./login-form.component.html",
  styleUrls: ["./login-form.component.css"],
})
export class LoginFormComponent implements OnInit {
 loginForm = this.fb.group({
  username: ["", [Validators.required] ],
  password: ["", [Validators.required] ],
});

  errorMessage: string | null = null; 

  @Output()
  login = new EventEmitter<UserCredentials>();

  constructor(private fb: FormBuilder, private authService: AuthenticationService) {}

  ngOnInit(): void {}


  onLogin() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      this.login.emit({
        username: this.loginForm.value.username ?? "",
        password: this.loginForm.value.password ?? "",
      });
      this.loginForm.reset();
    } else {
      this.errorMessage = "Veuillez remplir tous les champs correctement.";
    }
  }
}
