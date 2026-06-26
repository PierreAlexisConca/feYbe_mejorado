package ap2.PierreAlexisConca.service.impl;

import ap2.PierreAlexisConca.dto.auth.LoginRequest;
import ap2.PierreAlexisConca.dto.auth.LoginResponse;
import ap2.PierreAlexisConca.model.Usuario;
import ap2.PierreAlexisConca.repository.UsuarioRepository;
import ap2.PierreAlexisConca.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;

    @Autowired
    public AuthServiceImpl(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(request.getEmail().toLowerCase().trim());

        if (usuarioOpt.isEmpty()) {
            throw new RuntimeException("Credenciales incorrectas. Verifica tu email.");
        }

        Usuario usuario = usuarioOpt.get();

        if (!"A".equals(usuario.getEstado())) {
            throw new RuntimeException("El usuario no tiene acceso al sistema.");
        }

        if (!usuario.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta. Recuerda que son 5 dígitos.");
        }

        // Token simple: base64 del email + timestamp (sin JWT para no agregar dependencias)
        String tokenRaw = usuario.getEmail() + ":" + System.currentTimeMillis();
        String token = Base64.getEncoder().encodeToString(tokenRaw.getBytes());

        return new LoginResponse(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getNombre(),
                token,
                "Inicio de sesión exitoso"
        );
    }
}
