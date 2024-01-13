import { Component, OnInit } from "@angular/core";
import { UserCredentials } from "../model/user-credentials";
import { AuthenticationService } from "../authentication.service";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-login-page",
  templateUrl: "./login-page.component.html",
  styleUrls: ["./login-page.component.css"],
})
export class LoginPageComponent implements OnInit {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  errorMessage: string | null = null;

  async onLogin(userCredentials: UserCredentials) {
    try {
      await this.authenticationService.login(userCredentials);
      this.router.navigate(['/chat']);
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = "Mot de passe invalide";
      }
    }
  }
  
}
