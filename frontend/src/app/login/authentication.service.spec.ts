import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AuthenticationService } from "./authentication.service";
import { environment } from "src/environments/environment";
import { firstValueFrom } from "rxjs";
describe("AuthenticationService", () => {
  let service: AuthenticationService;
  let httpTestingController: HttpTestingController;

  const loginData = {
    username: "username",
    password: "pwd",
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthenticationService],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthenticationService);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  describe("on login", () => {
    it("should call POST with login data to auth/login", async () => {
      const loginPromise = service.login(loginData);
      const req = httpTestingController.expectOne(`${environment.backendUrl}/auth/login`);
      expect(req.request.method).toBe("POST");
      expect(req.request.body).toEqual(loginData);
      req.flush({ username: loginData.username });
      await loginPromise;
    });

    it("should store and emit the username", async () => {
      const loginPromise = service.login(loginData);
      const req = httpTestingController.expectOne(`${environment.backendUrl}/auth/login`);
      req.flush({ username: loginData.username });
      await loginPromise;
      const username = await firstValueFrom(service.getUsername());
      expect(username).toBe(loginData.username);
    });
  });

  describe("on logout", () => {
    it("should call POST with login data to auth/logout", async () => {
      localStorage.setItem("username", loginData.username);
      const logoutPromise = service.logout();
      const req = httpTestingController.expectOne(`${environment.backendUrl}/auth/logout`);
      expect(req.request.method).toBe("POST");
      req.flush({});
      await logoutPromise;
    });

    it("should remove the username from the service and local storage", async () => {
      const loginPromise = service.login(loginData);
      const req = httpTestingController.expectOne(`${environment.backendUrl}/auth/login`);
      req.flush({ username: loginData.username });
      await loginPromise;
      const usernameValue1 = await firstValueFrom(service.getUsername());
      expect(usernameValue1).toBe(loginData.username);
      const usernameLocal1 = localStorage.getItem('username');
      expect(usernameLocal1).toBe(loginData.username);
      
      const logoutPromise = service.logout();
      const req2 = httpTestingController.expectOne(`${environment.backendUrl}/auth/logout`);
      req2.flush({});
      await logoutPromise;
      const usernameValue2 = await firstValueFrom(service.getUsername());
      const usernameLocal2 = localStorage.getItem('username');
      expect(usernameLocal2).toBeNull();
      expect(usernameValue2).toBeNull();
    });
  });
});
