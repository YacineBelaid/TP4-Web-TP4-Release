package com.rls.chat.messages;

import org.assertj.core.api.Assert;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.client.TestRestTemplate.HttpClientOption;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.PropertySource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.net.HttpCookie;
import java.util.concurrent.ExecutionException;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.rls.chat.auth.model.LoginRequest;
import com.rls.chat.auth.model.LoginResponse;
import com.rls.chat.messages.model.Message;
import com.rls.chat.messages.model.NewMessageRequest;
import com.rls.chat.messages.repository.FirestoreMessage;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@PropertySource("classpath:firebase.properties")
public class ITestMessageController {
    private final FirestoreMessage message1 = new FirestoreMessage("u1", Timestamp.now(), "t1", null);
    private final FirestoreMessage message2 = new FirestoreMessage("u2", Timestamp.now(), "t2", null);

    @Value("${firebase.project.id}")
    private String firebaseProjectId;

    @Value("${firebase.emulator.port}")
    private String emulatorPort;

    @LocalServerPort
    private int port;

    private TestRestTemplate restTemplate;

    @Autowired
    private Firestore firestore;

    private String messagesEndpointUrl;
    private String loginEndpointUrl;

    @BeforeAll
    public static void checkRunAgainstEmulator() {
        checkEmulators();
    }

    @BeforeEach
    public void setup() throws InterruptedException, ExecutionException {
        this.restTemplate = new TestRestTemplate(HttpClientOption.ENABLE_COOKIES);
        this.messagesEndpointUrl = "http://localhost:" + port + "/messages";
        this.loginEndpointUrl = "http://localhost:" + port + "/auth/login";

        // Pour ajouter deux message dans firestore au début de chaque test.
        this.firestore.collection("messages").document("1")
                .create(this.message1).get();
        this.firestore.collection("messages").document("2")
                .create(this.message2).get();
    }

    @AfterEach
    public void testDown() {
        // Pour effacer le contenu de l'émulateur entre chaque test.
        this.restTemplate.delete(
                "http://localhost:" + this.emulatorPort + "/emulator/v1/projects/"
                        + this.firebaseProjectId
                        + "/databases/(default)/documents");
    }

    @Test
    public void getMessageNotLoggedIn() {
        ResponseEntity<String> response = this.restTemplate.getForEntity(this.messagesEndpointUrl,
                String.class);

        assertThat(response.getStatusCodeValue()).isEqualTo(403);
    }
    @Test
public void postMessageNotLoggedIn() {
    final HttpHeaders headers = this.createHeadersWithSessionCookie("");
    final HttpEntity<FirestoreMessage> requestEntity = new HttpEntity<FirestoreMessage>(this.message1, headers);

    ResponseEntity<Void> response = this.restTemplate.exchange(
            this.messagesEndpointUrl, 
            HttpMethod.POST, 
            requestEntity, 
            Void.class
    );

    assertThat(response.getStatusCodeValue()).isEqualTo(403);
}


    @Test
    public void getMessagesWithoutFromID() {
        final String sessionCookie = this.login();
        final HttpHeaders headers = this.createHeadersWithSessionCookie(sessionCookie);
        final HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        final ResponseEntity<Message[]> response = this.restTemplate.exchange(this.messagesEndpointUrl, HttpMethod.GET, requestEntity, Message[].class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).hasSize(2); 
    }
    @Test
    public void getMessagesFromID() {
        final String sessionCookie = this.login();
        final HttpHeaders headers = this.createHeadersWithSessionCookie(sessionCookie);
        final HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
        
        
         final String param = "?fromId=1";
        
        final ResponseEntity<Message[]> response = this.restTemplate.exchange(
                this.messagesEndpointUrl + param,
                HttpMethod.GET,
                requestEntity,
                Message[].class

        );
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).hasSize(1); 
    }
    @Test
    public void getMessagesFromUnknownID() {
          final String sessionCookie = this.login();
          final HttpHeaders headers = this.createHeadersWithSessionCookie(sessionCookie);
        final HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
        
       
        final String param ="?fromId=213";
        
        final ResponseEntity<Void> response = this.restTemplate.exchange(
                this.messagesEndpointUrl + param,
                HttpMethod.GET,
                requestEntity,
                Void.class
                
        );
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND); 
    }
    @Test
public void getTwentyMessages() {
    final String sessionCookie = this.login();
    final HttpHeaders headers = this.createHeadersWithSessionCookie(sessionCookie);
    for (int i = 1; i <= 20; i++) {
        createFirestoreMessage("u" + i, "t" + i);
    }
    try {
        Thread.sleep(5000); 
    } catch (InterruptedException e) {
        e.printStackTrace();
    }

    final ResponseEntity<Message[]> response = this.restTemplate.exchange(this.messagesEndpointUrl, HttpMethod.GET, new HttpEntity<>(headers), Message[].class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody()).hasSize(20);
}
    private void createFirestoreMessage(String userId, String content) {
        FirestoreMessage newMessage = new FirestoreMessage(userId, Timestamp.now(), content, null);
         String messageId = String.valueOf(System.currentTimeMillis());
        
        try {
                this.firestore.collection("messages").document(messageId)
                        .create(newMessage).get();
        } catch (InterruptedException e) {

                e.printStackTrace();
        } catch (ExecutionException e) {
                e.printStackTrace();
        }
    }
    
    /**
     * Se connecte et retourne le cookie de session.
     * 
     * @return le cookie de session.
     */
    private String login() {
        ResponseEntity<LoginResponse> response = this.restTemplate.postForEntity(this.loginEndpointUrl,
                new LoginRequest("username", "password"), LoginResponse.class);

        String setCookieHeader = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        HttpCookie sessionCookie = HttpCookie.parse(setCookieHeader).get(0);
        return sessionCookie.getName() + "=" + sessionCookie.getValue();
    }

    private HttpEntity<NewMessageRequest> createRequestEntityWithSessionCookie(NewMessageRequest messageRequest,
            String cookieValue) {
        HttpHeaders header = this.createHeadersWithSessionCookie(cookieValue);
        return new HttpEntity<NewMessageRequest>(
                messageRequest,
                header);
    }

    private HttpHeaders createHeadersWithSessionCookie(String cookieValue) {
        HttpHeaders header = new HttpHeaders();
        header.add(HttpHeaders.COOKIE, cookieValue);
        return header;
    }

    private static void checkEmulators() {
        final String firebaseEmulator = System.getenv().get("FIRESTORE_EMULATOR_HOST");
        if (firebaseEmulator == null || firebaseEmulator.length() == 0) {
            System.err.println(
                    "**********************************************************************************************************");
            System.err.println(
                    "******** You need to set FIRESTORE_EMULATOR_HOST=localhost:8181 in your system properties. ********");
            System.err.println(
                    "**********************************************************************************************************");
        }
        assertThat(firebaseEmulator).as(
                "You need to set FIRESTORE_EMULATOR_HOST=localhost:8181 in your system properties.")
                .isNotEmpty();
        final String storageEmulator = System.getenv().get("FIREBASE_STORAGE_EMULATOR_HOST");
        if (storageEmulator == null || storageEmulator.length() == 0) {
            System.err.println(
                    "**********************************************************************************************************");
            System.err.println(
                    "******** You need to set FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199 in your system properties. ********");
            System.err.println(
                    "**********************************************************************************************************");
        }
        assertThat(storageEmulator).as(
                "You need to set FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199 in your system properties.")
                .isNotEmpty();
    }
}