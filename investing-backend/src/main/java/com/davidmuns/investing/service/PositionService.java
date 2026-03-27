package com.davidmuns.investing.service;

import com.davidmuns.investing.client.TwelveDataClient;
import com.davidmuns.investing.dto.*;
import com.davidmuns.investing.entity.Portfolio;
import com.davidmuns.investing.entity.Position;
import com.davidmuns.investing.repo.PortfolioRepository;
import com.davidmuns.investing.repo.PositionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class PositionService {
    private final PositionRepository positionRepository;
    private final PortfolioRepository portfolioRepository;
    private final TwelveDataClient twelveDataClient;

    public PositionService(PositionRepository positionRepository, PortfolioRepository portfolioRepository, TwelveDataClient twelveDataClient) {
        this.positionRepository = positionRepository;
        this.portfolioRepository = portfolioRepository;
        this.twelveDataClient = twelveDataClient;
    }

    @Transactional
    public void save(PositionRequest req, Long portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));
        this.positionRepository.save(buildPosition(req, portfolio));
    }

    public SearchResponse<PositionResponse> findAllByPortfolioID(Long portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));
        List<Position> positions = null;

        Optional<List<Position>> optionalPosition = positionRepository.findByPortfolio(portfolio);
        positions = optionalPosition.get();
        List<PositionResponse> resp = positions
                .stream()
                .map(this::toResponse)
                .toList();
        return new SearchResponse<>(resp, positions.size());
    }

    private Position buildPosition(PositionRequest req, Portfolio portfolio) {
        Position position = new Position();
        position.setName(req.name());
        position.setSymbol(req.symbol());
        position.setType(req.type());
        position.setQuantity(req.quantity());
        Double fee = req.fee() != null ? req.fee(): 0;
        position.setFee(fee);
        position.setPrice(req.price());
        Double grossAmount = req.price() * req.quantity();
        position.setGrossAmount(grossAmount);
        position.setNetAmount(grossAmount + fee);
        position.setCreatedAt(req.date());
        position.setPortfolio(portfolio);
        return position;
    }

    private PositionResponse toResponse(Position position) {
        TwelveDataQuoteResponse quote = null;

        try {
            quote = twelveDataClient.getQuote(position.getSymbol());
        } catch (Exception e) {
            log.error(e.getMessage());
        }

        return new PositionResponse(
                position.getId(),
                position.getName(),
                position.getSymbol(),
                position.getType(),
                position.getQuantity(),
                position.getPortfolio().getId(),
                position.getPrice(),
                quote.close(),
                quote.previousClose(),
                position.getFee(),
                position.getCreatedAt(),
                position.getNetAmount(),
                position.getGrossAmount()
        );
    }
}
