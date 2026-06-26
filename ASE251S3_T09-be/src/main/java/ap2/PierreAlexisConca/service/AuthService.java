package ap2.PierreAlexisConca.service;

import ap2.PierreAlexisConca.dto.auth.LoginRequest;
import ap2.PierreAlexisConca.dto.auth.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
}
