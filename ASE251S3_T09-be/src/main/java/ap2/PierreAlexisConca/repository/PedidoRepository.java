package ap2.PierreAlexisConca.repository;

import ap2.PierreAlexisConca.model.Pedido;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    @Override
    @EntityGraph(attributePaths = {"cliente", "detalle", "detalle.producto"})
    @NonNull List<Pedido> findAll();

    @Override
    @EntityGraph(attributePaths = {"cliente", "detalle", "detalle.producto"})
    @NonNull Optional<Pedido> findById(@NonNull Long id);

    @EntityGraph(attributePaths = {"cliente", "detalle", "detalle.producto"})
    @NonNull List<Pedido> findByState(@NonNull String state);

    @Query("SELECT MAX(CAST(SUBSTRING(p.numero, 5, LEN(p.numero)) AS int)) FROM Pedido p WHERE p.numero LIKE 'PED-%' AND SUBSTRING(p.numero, 5, LEN(p.numero)) LIKE '[0-9]%'")
    Integer findMaxNumeroNumero();
}
