package ap2.PierreAlexisConca.repository;

import ap2.PierreAlexisConca.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByState(String state);

    /**
     * Extrae el número máximo del campo codigo que tenga formato PROD-{número}.
     * Así el siguiente código siempre continúa desde el último registrado,
     * sin importar cuántos registros haya en total.
     */
    @Query("SELECT MAX(CAST(SUBSTRING(p.codigo, 6, LEN(p.codigo)) AS int)) FROM Producto p WHERE p.codigo LIKE 'PROD-%' AND SUBSTRING(p.codigo, 6, LEN(p.codigo)) LIKE '[0-9]%'")
    Integer findMaxCodigoNumero();
}
