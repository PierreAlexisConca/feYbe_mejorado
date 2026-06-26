package ap2.PierreAlexisConca.rest;

import ap2.PierreAlexisConca.dto.auth.LoginRequest;
import ap2.PierreAlexisConca.dto.auth.LoginResponse;
import ap2.PierreAlexisConca.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthRest {

    private final AuthService authService;

    @Autowired
    public AuthRest(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
