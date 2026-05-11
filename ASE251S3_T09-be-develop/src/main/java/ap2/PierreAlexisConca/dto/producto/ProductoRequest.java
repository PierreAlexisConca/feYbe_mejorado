package ap2.PierreAlexisConca.dto.producto;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class ProductoRequest {
    private String nombre;
    private String descripcion;
    private Double precio;
    private String codigo;

    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock = 100;

    private String state;
}
