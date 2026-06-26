package ap2.PierreAlexisConca.dto.producto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class MovimientoStockRequest {

    @NotNull(message = "productoId es obligatorio")
    private Long productoId;

    @NotNull(message = "cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    private Integer cantidad;

    @NotBlank(message = "tipoMovimiento es obligatorio")
    @Pattern(regexp = "^(ENTRADA|SALIDA)$", message = "tipoMovimiento solo admite: ENTRADA o SALIDA")
    private String tipoMovimiento;

    private String motivo;
}
