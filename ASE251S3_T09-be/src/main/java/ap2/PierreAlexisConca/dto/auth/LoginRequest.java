package ap2.PierreAlexisConca.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene un formato válido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Pattern(regexp = "^[0-9]{5}$", message = "La contraseña debe ser exactamente 5 dígitos numéricos")
    private String password;
}
