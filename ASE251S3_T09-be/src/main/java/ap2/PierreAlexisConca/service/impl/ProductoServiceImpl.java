package ap2.PierreAlexisConca.service.impl;

import ap2.PierreAlexisConca.model.MovimientoProducto;
import ap2.PierreAlexisConca.model.Producto;
import ap2.PierreAlexisConca.repository.MovimientoProductoRepository;
import ap2.PierreAlexisConca.repository.ProductoRepository;
import ap2.PierreAlexisConca.service.CodigoGeneratorService;
import ap2.PierreAlexisConca.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class ProductoServiceImpl implements ProductoService {
    private final ProductoRepository productoRepository;
    private final CodigoGeneratorService codigoGeneratorService;
    private final MovimientoProductoRepository movimientoProductoRepository;

    @Autowired
    public ProductoServiceImpl(ProductoRepository productoRepository,
                                CodigoGeneratorService codigoGeneratorService,
                                MovimientoProductoRepository movimientoProductoRepository) {
        this.productoRepository = productoRepository;
        this.codigoGeneratorService = codigoGeneratorService;
        this.movimientoProductoRepository = movimientoProductoRepository;
    }

    @Override
    public List<Producto> findAll() {
        return productoRepository.findAll();
    }

    @Override
    public List<Producto> findByState(String state) {
        return productoRepository.findByState(state);
    }

    @Override
    public Optional<Producto> findById(Long id) {
        return productoRepository.findById(Objects.requireNonNull(id, "id no puede ser null"));
    }

    @Override
    public Producto save(Producto producto) {
        if (producto.getCodigo() == null || producto.getCodigo().isBlank()) {
            producto.setCodigo(codigoGeneratorService.siguienteCodigoProducto());
        }
        if (producto.getStock() == null) {
            producto.setStock(100);
        }
        if (producto.getStock() < 0) {
            throw new IllegalArgumentException("El stock no puede ser negativo");
        }
        if (producto.getState() == null || producto.getState().isBlank()) {
            producto.setState("A");
        }
        return productoRepository.save(producto);
    }

    @Override
    public Producto update(Producto producto) {
        Long productoId = Objects.requireNonNull(producto.getId(), "producto.id no puede ser null");
        Producto existing = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto not found"));

        if (producto.getCodigo() == null || producto.getCodigo().isBlank()) {
            producto.setCodigo(existing.getCodigo());
        }
        if (producto.getStock() == null) {
            producto.setStock(existing.getStock() == null ? 100 : existing.getStock());
        }
        if (producto.getStock() < 0) {
            throw new IllegalArgumentException("El stock no puede ser negativo");
        }
        if (producto.getState() == null || producto.getState().isBlank()) {
            producto.setState(existing.getState());
        }
        return productoRepository.save(producto);
    }

    @Override
    public Producto delete(Long id) {
        Producto producto = productoRepository.findById(Objects.requireNonNull(id, "id no puede ser null"))
                .orElseThrow(() -> new RuntimeException("Producto not found"));

        producto.setState("I");
        return productoRepository.save(producto);
    }

    @Override
    public Producto restore(Long id) {
        Producto producto = productoRepository.findById(Objects.requireNonNull(id, "id no puede ser null"))
                .orElseThrow(() -> new RuntimeException("Producto not found"));

        producto.setState("A");
        return productoRepository.save(producto);
    }

    @Override
    @Transactional
    public Producto movimientoStock(Long productoId, Integer cantidad, String tipoMovimiento, String motivo) {
        Objects.requireNonNull(productoId, "productoId no puede ser null");
        Objects.requireNonNull(cantidad, "cantidad no puede ser null");
        Objects.requireNonNull(tipoMovimiento, "tipoMovimiento no puede ser null");

        if (cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor que 0");
        }

        String tipo = tipoMovimiento.trim().toUpperCase();
        if (!tipo.equals("ENTRADA") && !tipo.equals("SALIDA")) {
            throw new IllegalArgumentException("tipoMovimiento solo admite: ENTRADA o SALIDA");
        }

        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto not found"));

        int stockAnterior = producto.getStock() == null ? 0 : producto.getStock();
        int stockPosterior;

        if (tipo.equals("ENTRADA")) {
            stockPosterior = stockAnterior + cantidad;
        } else {
            if (stockAnterior < cantidad) {
                throw new IllegalArgumentException(
                        "Stock insuficiente. Stock actual: " + stockAnterior + ", solicitado: " + cantidad);
            }
            stockPosterior = stockAnterior - cantidad;
        }

        producto.setStock(stockPosterior);
        Producto productoActualizado = productoRepository.save(producto);

        MovimientoProducto movimiento = new MovimientoProducto();
        movimiento.setProducto(productoActualizado);
        movimiento.setTipoMovimiento(tipo);
        movimiento.setCantidad(cantidad);
        movimiento.setMotivo(motivo);
        movimiento.setStockAnterior(stockAnterior);
        movimiento.setStockPosterior(stockPosterior);
        movimiento.setCreatedAt(LocalDateTime.now());
        movimientoProductoRepository.save(movimiento);

        return productoActualizado;
    }
}
