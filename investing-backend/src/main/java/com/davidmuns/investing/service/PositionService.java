package com.davidmuns.investing.service;

import com.davidmuns.investing.dto.PositionRequest;
import com.davidmuns.investing.dto.SearchResponse;
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

    public PositionService(PositionRepository positionRepository, PortfolioRepository portfolioRepository) {
        this.positionRepository = positionRepository;
        this.portfolioRepository = portfolioRepository;
    }

    @Transactional
    public void save(PositionRequest req, Long portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));
        Optional<List<Position>> optional = positionRepository.findBySymbolIgnoreCase(req.symbol());
        if(optional.isPresent()) {
            int size = optional.get().size();
//            if(size > 0) {
//                optional.get().forEach(position -> {
//                    Double quantity = position.getQuantity();
//                    Double total = quantity++;
//                });
//
//            }

        }
        this.positionRepository.save(buildPosition(req, portfolio));

    }

    public SearchResponse<Position> findAllByPortfolioID(Long portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));
        List<Position> positions = null;

        Optional<List<Position>> optionalPosition = positionRepository.findByPortfolio(portfolio);
        positions = optionalPosition.get();

        SearchResponse<Position> response = new SearchResponse<>(positions, positions.size());
        return response;
    }

    private Position buildPosition(PositionRequest req, Portfolio portfolio) {
        Position position = new Position();
        position.setName(req.name());
        position.setSymbol(req.symbol());
        position.setType(req.type());
        Double netAmount = req.price() * req.quantity();
        position.setNetAmount(netAmount);
        position.setQuantity(req.quantity());
        Double fee = req.fee() != null ? req.fee(): 0;
        position.setFee(fee);
        Double averagePrice = getAveragePrice(req.price(), req.quantity());
        position.setAveragePrice(averagePrice);
        position.setCreatedAt(req.date());
        position.setPortfolio(portfolio);
        return position;
    }

    private Double getAveragePrice(Double price, Double quantity){
        return (price * quantity)/quantity;
    }
}
