import { NgModule } from "@angular/core";
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from "./login/login-page/login-page.component";
import { ChatPageComponent } from "./chat/chat-page/chat-page.component";
import { loginPageGuard } from "./login/guards/login-page.guard";
import { chatPageGuard } from "./login/guards/chat-page.guard";

const routes: Routes = [
  { path: '', component: LoginPageComponent, canActivate: [loginPageGuard] },
  { path: 'login', component: LoginPageComponent, canActivate: [loginPageGuard] }, 
  { path: 'chat', component: ChatPageComponent, canActivate: [chatPageGuard] }, 
  { path: '**', redirectTo: '', pathMatch: 'full' }, 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}