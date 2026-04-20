package com.davidmuns.investing.service;

import com.davidmuns.investing.dto.PortfolioRequest;
import com.davidmuns.investing.dto.PortfolioResponse;
import com.davidmuns.investing.dto.SearchResponse;
import com.davidmuns.investing.entity.Portfolio;
import com.davidmuns.investing.entity.PortfolioType;
import com.davidmuns.investing.exception.DuplicatePortfolioException;
import com.davidmuns.investing.exception.NotFoundException;
import com.davidmuns.investing.repo.InstrumentRepository;
import com.davidmuns.investing.repo.PortfolioRepository;
import com.davidmuns.investing.repo.PositionCloseRepository;
import com.davidmuns.investing.repo.PositionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final InstrumentRepository instrumentRepository;
    private final PositionRepository positionRepository;
    private final PositionCloseRepository positionCloseRepository;

    public PortfolioService(PortfolioRepository portfolioRepository, InstrumentRepository instrumentRepository, PositionRepository positionRepository, PositionCloseRepository positionCloseRepository) {
        this.portfolioRepository = portfolioRepository;
        this.instrumentRepository = instrumentRepository;
        this.positionRepository = positionRepository;
        this.positionCloseRepository = positionCloseRepository;
    }

    public SearchResponse<PortfolioResponse> findAllByUsername(String username) {
        createDefaultPortfolio(username);
        List<PortfolioResponse> dtoList = portfolioRepository
                .findAllByUsernameOrderByDisplayOrderAsc(username)
                .stream()
                .map(this::toResponse)
                .toList();
        return new SearchResponse<>(dtoList, dtoList.size());
    }

    public PortfolioResponse findById(Long portfolioId) {
        Portfolio portfolio = getPortfolio(portfolioId);
        return toResponse(portfolio);
    }

    @Transactional
    public PortfolioResponse create(PortfolioRequest req) {
        String name = req.name().trim();
        if (portfolioRepository.existsByNameIgnoreCaseAndTypeAndUsername(name, req.type(), req.username())) {
            throw new DuplicatePortfolioException("Ya existe una cartera '" + name + "' de tipo " + req.type());
        }
        return toResponse(portfolioRepository.save(new Portfolio(name, req.type(), req.username())));
    }

    @Transactional
    public void delete(Long id) {
        String msg = "No existe portfolio con id:";
        if (!portfolioRepository.existsById(id)) {
            throw new NotFoundException(id, msg);
        }
        String username = portfolioRepository.findById(id).get().getUsername();
        instrumentRepository.deleteByPortfolioId(id);
        positionRepository.deleteByPortfolioId(id);
        positionCloseRepository.deleteByPortfolioId(id);
        portfolioRepository.deleteById(id);
        createDefaultPortfolio(username);
    }

    public PortfolioResponse rename(Long id, String newName) {
        String msg = "No existe portfolio con id:";
        Portfolio portfolio = portfolioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(id, msg));
        portfolio.setName(newName.trim());
        return toResponse(portfolioRepository.save(portfolio));
    }

    @Transactional
    public SearchResponse<PortfolioResponse> reorder(List<PortfolioRequest> request) {
        String username = request.get(0).username().trim();
        request.forEach(req -> {
            Portfolio portfolio = getPortfolio(req.id());
            portfolio.setDisplayOrder(req.displayOrder());
            portfolioRepository.save(portfolio);
        });
        return findAllByUsername(username);
    }

    private PortfolioResponse toResponse(Portfolio p) {
        return new PortfolioResponse(p.getId(), p.getName(), p.getType(), p.getDisplayOrder());
    }

    private Portfolio getPortfolio(Long portfolioId) {
        return portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new NotFoundException(portfolioId, "Portfolio not found with id: "));
    }

    private void createDefaultPortfolio(String username) {
        int size = portfolioRepository.findByUsername(username).size();
        if (size == 0) {
            Portfolio defaultPortfolio = new Portfolio("Mi cartera", PortfolioType.POSITIONS, username);
            portfolioRepository.save(defaultPortfolio);
        }
    }

}