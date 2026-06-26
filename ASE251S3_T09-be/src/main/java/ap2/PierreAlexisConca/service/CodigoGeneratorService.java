package ap2.PierreAlexisConca.service;

import ap2.PierreAlexisConca.repository.PedidoRepository;
import ap2.PierreAlexisConca.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Genera códigos secuenciales buscando el número más alto
 * que ya existe en la tabla y sumando 1.
 *
 * Ejemplo: si existen PROD-001 ... PROD-016, el siguiente es PROD-017.
 * Si se eliminaron registros intermedios no importa — siempre va
 * por encima del máximo actual.
 */
@Service
public class CodigoGeneratorService {

    private final ProductoRepository productoRepository;
    private final PedidoRepository pedidoRepository;

    @Autowired
    public CodigoGeneratorService(ProductoRepository productoRepository,
                                   PedidoRepository pedidoRepository) {
        this.productoRepository = productoRepository;
        this.pedidoRepository = pedidoRepository;
    }

    /**
     * Siguiente código de Producto.
     * Lee el máximo número en códigos "PROD-NNN" y devuelve PROD-(max+1).
     * Si la tabla está vacía o sin códigos PROD-, empieza en PROD-1.
     */
    public String siguienteCodigoProducto() {
        Integer max = productoRepository.findMaxCodigoNumero();
        int siguiente = (max == null ? 0 : max) + 1;
        return "PROD-" + siguiente;
    }

    /**
     * Siguiente número de Pedido.
     * Lee el máximo número en números "PED-NNN" y devuelve PED-(max+1).
     */
    public String siguienteNumeroPedido() {
        Integer max = pedidoRepository.findMaxNumeroNumero();
        int siguiente = (max == null ? 0 : max) + 1;
        return "PED-" + siguiente;
    }
}
