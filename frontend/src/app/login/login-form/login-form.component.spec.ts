import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { LoginFormComponent } from "./login-form.component";
import { HttpClientModule } from "@angular/common/http";
import { TestHelper } from "./test-helper";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { UserCredentials } from "../model/user-credentials";
import { EventEmitter } from "@angular/core";

describe("LoginFormComponent", () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let testHelper: TestHelper<LoginFormComponent>;
  let mockEventEmitter: jasmine.SpyObj<EventEmitter<any>>;
  
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LoginFormComponent],
      providers: [
        {
          provide: LoginFormComponent,
          useValue: { login: mockEventEmitter },
        },
      ],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    testHelper = new TestHelper(fixture);
    spyOn(component.login, 'emit');
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("n'envoie pas la valeur de Password si Username est vide et affiche message d'erreur", () => {
    testHelper.writeInInput(testHelper.getInput("username"), "");
    testHelper.writeInInput(testHelper.getInput("password"), "password");
    fixture.detectChanges();
    const button  = testHelper.getButton("login-button");
    button.click();
    fixture.detectChanges();
      const errorMessages = testHelper.getErrorMessages();
      expect(errorMessages).toContain(
        "Veuillez remplir tous les champs correctement."
      );
      expect(component.login.emit).not.toHaveBeenCalled();
  });

  it("n'envoie pas la valeur de Username si Password est vide et affiche message d'erreur", () => {
    testHelper.writeInInput(testHelper.getInput("username"), "username");
    testHelper.writeInInput(testHelper.getInput("password"), "");
    fixture.detectChanges();
    const button = testHelper.getButton("login-button");
    button.click();
    fixture.detectChanges();
      const errorMessages = testHelper.getErrorMessages();
      expect(errorMessages).toContain(
        "Veuillez remplir tous les champs correctement."
      );
      expect(component.login.emit).not.toHaveBeenCalled();
  });

  it("Affiche erreur et n'envoie pas les contenus des champs Username et Password vide", () => {
    testHelper.writeInInput(testHelper.getInput("username"), "");
    testHelper.writeInInput(testHelper.getInput("password"), "");
    fixture.detectChanges();
    const button = testHelper.getButton("login-button");
    button.click();
    fixture.detectChanges();
      const errorMessages = testHelper.getErrorMessages();
      expect(errorMessages).toContain(
        "Veuillez remplir tous les champs correctement."
      );
      expect(component.login.emit).not.toHaveBeenCalled();
  });

  it("Envoie lorsque Username et Password sont présents", () => {
    const username = "username";
    const password = "password";
    testHelper.writeInInput(testHelper.getInput("username"), username);
    testHelper.writeInInput(testHelper.getInput("password"), password);
    fixture.detectChanges();
    const button = testHelper.getButton("login-button");
    button.click();
    fixture.detectChanges();
    const errorMessages = testHelper.getErrorMessages();
    expect(errorMessages).toBeNull;
  expect(component.login.emit).toHaveBeenCalled()
  });
});
