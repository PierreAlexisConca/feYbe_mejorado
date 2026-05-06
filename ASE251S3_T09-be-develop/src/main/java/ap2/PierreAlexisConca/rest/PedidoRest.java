package ap2.PierreAlexisConca.rest;

import ap2.PierreAlexisConca.model.Pedido;
import ap2.PierreAlexisConca.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoRest {
    private final PedidoService pedidoService;

    @Autowired
    public PedidoRest(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @GetMapping
    public List<Pedido> getAllPedidos() {
        return pedidoService.findAll();
    }

    @GetMapping("/state/{state}")
    public List<Pedido> findByState(@PathVariable String state) {
        return pedidoService.findByState(state);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> getPedidoById(@PathVariable Long id) {
        Optional<Pedido> pedido = pedidoService.findById(id);
        return pedido.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Pedido createPedido(@RequestBody Pedido pedido) {
        return pedidoService.save(pedido);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pedido> updatePedido(@PathVariable Long id, @RequestBody Pedido pedido) {
        if (!pedidoService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        pedido.setId(id);
        return ResponseEntity.ok(pedidoService.update(pedido));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePedido(@PathVariable Long id) {
        if (!pedidoService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        pedidoService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/delete")
    public ResponseEntity<Pedido> logicalDeletePedido(@PathVariable Long id) {
        if (pedidoService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(pedidoService.delete(id));
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<Pedido> restorePedido(@PathVariable Long id) {
        if (pedidoService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(pedidoService.restore(id));
    }
}
