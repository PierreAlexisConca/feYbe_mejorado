package ap2.PierreAlexisConca.service.impl;

import ap2.PierreAlexisConca.model.Pedido;
import ap2.PierreAlexisConca.repository.PedidoRepository;
import ap2.PierreAlexisConca.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PedidoServiceImpl implements PedidoService {
    private final PedidoRepository pedidoRepository;

    @Autowired
    public PedidoServiceImpl(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    @Override
    public List<Pedido> findAll() {
        return pedidoRepository.findAll();
    }

    @Override
    public List<Pedido> findByState(String state) {
        return pedidoRepository.findByState(state);
    }

    @Override
    public Optional<Pedido> findById(Long id) {
        return pedidoRepository.findById(id);
    }

    @Override
    public Pedido save(Pedido pedido) {
        if (pedido.getNumero() == null || pedido.getNumero().isBlank()) {
            pedido.setNumero("PED-" + System.currentTimeMillis());
        }
        if (pedido.getState() == null || pedido.getState().isBlank()) {
            pedido.setState("A");
        }
        return pedidoRepository.save(pedido);
    }

    @Override
    public Pedido update(Pedido pedido) {
        Pedido existing = pedidoRepository.findById(pedido.getId())
                .orElseThrow(() -> new RuntimeException("Pedido not found"));

        if (pedido.getNumero() == null || pedido.getNumero().isBlank()) {
            pedido.setNumero(existing.getNumero());
        }
        if (pedido.getState() == null || pedido.getState().isBlank()) {
            pedido.setState(existing.getState());
        }
        return pedidoRepository.save(pedido);
    }

    @Override
    public Pedido delete(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido not found"));

        pedido.setState("I");
        return pedidoRepository.save(pedido);
    }

    @Override
    public Pedido restore(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido not found"));

        pedido.setState("A");
        return pedidoRepository.save(pedido);
    }
}
