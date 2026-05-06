package ap2.PierreAlexisConca.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
@Table(name = "pedido")
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "total", nullable = false)
    private Double total;

    @Column(name = "numero", nullable = false, unique = true)
    private String numero;

    @Column(name = "state", nullable = false)
    private String state;
}
