package com.davidmuns.investing.service;

import com.davidmuns.investing.client.TwelveDataClient;
import com.davidmuns.investing.dto.*;
import com.davidmuns.investing.entity.Portfolio;
import com.davidmuns.investing.entity.Position;
import com.davidmuns.investing.entity.PositionClose;
import com.davidmuns.investing.exception.NotFoundException;
import com.davidmuns.investing.repo.PortfolioRepository;
import com.davidmuns.investing.repo.PositionCloseRepository;
import com.davidmuns.investing.repo.PositionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class PositionService {
    private final PositionRepository positionRepository;
    private final PortfolioRepository portfolioRepository;
    private final TwelveDataClient twelveDataClient;
    private final PositionCloseRepository positionCloseRepository;

    public PositionService(PositionRepository positionRepository, PortfolioRepository portfolioRepository, TwelveDataClient twelveDataClient, PositionCloseRepository positionCloseRepository) {
        this.positionRepository = positionRepository;
        this.portfolioRepository = portfolioRepository;
        this.twelveDataClient = twelveDataClient;
        this.positionCloseRepository = positionCloseRepository;
    }

    @Transactional
    public void save(PositionRequest req, Long portfolioId) {
        Portfolio portfolio = getPortfolio(portfolioId);
        this.positionRepository.save(buildPosition(req, portfolio));
    }

    public SearchResponse<PositionResponse> findAllByPortfolioID(Long portfolioId) {
        Portfolio portfolio = getPortfolio(portfolioId);
        List<Position> positions = null;

        Optional<List<Position>> optionalPosition = positionRepository.findByPortfolio(portfolio);
        positions = optionalPosition.get();
        List<PositionResponse> resp = positions
                .stream()
                .map(this::toPositionResponse)
                .toList();
        return new SearchResponse<>(resp, positions.size());
    }

    public SearchResponse<PositionSummaryResponse> findSummaryByPortfolioId(Long portfolioId) {
        Portfolio portfolio = getPortfolio(portfolioId);

        List<Position> positions = positionRepository.findByPortfolio(portfolio)
                .orElse(List.of());

        Map<String, List<Position>> grouped = positions.stream()
                .collect(Collectors.groupingBy(position ->
                        position.getSymbol() + "|" + position.getExchange() + "|" + position.getType()
                ));

        List<PositionSummaryResponse> summaries = grouped.values().stream()
                .map(this::toSummaryResponse)
                .toList();

        return new SearchResponse<>(summaries, summaries.size());
    }

    public void delete(Long id) {
        Position position = getPosition(id);
        positionRepository.delete(position);
    }

    public void edit(UpdatePositionRequest req) {
        Position position = getPosition(req.id());
        position.setQuantity(req.quantity());
        position.setPrice(req.price());
        position.setFee(req.fee());
        position.setCreatedAt(req.createdAt());
        Double gross = calculateGross(req.quantity(), req.price());
        Double net = calculateNet(gross, req.fee());
        position.setGrossAmount(gross);
        position.setNetAmount(net);
        positionRepository.save(position);
    }

    public PositionCloseResponse close(UpdatePositionRequest req) {
        Position position = getPosition(req.id());
        PositionClose positionClose = buildPositionClose(position, req);
        return toPositionCloseResponse(positionCloseRepository.save(positionClose));
    }

    private PositionClose buildPositionClose(Position position, UpdatePositionRequest req) {
        PositionClose positionClose = new PositionClose();
        Double purchasePrice = position.getPrice();
        Double sellingPrice = req.price();
        Double soldShares = req.quantity();
        Double totalPurchasePrice = soldShares * purchasePrice;
        Double totalSellingPrice = soldShares * sellingPrice;
        Double profitLoss = totalSellingPrice - totalPurchasePrice - req.fee();
        Double totalSellingPriceLessPurchaseFee = totalSellingPrice - position.getFee();
        Double profitLossPercentage = ((totalSellingPrice/(totalPurchasePrice)-1)) * 100;
        Double remainShares = position.getQuantity() - req.quantity();
        if (remainShares > 0) {
            UpdatePositionRequest newReq = new UpdatePositionRequest(
                    position.getId(),
                    remainShares,
                    position.getPrice(),
                    position.getFee(),
                    position.getCreatedAt());
            edit(newReq);
        }else{
            delete(position.getId());
        }
        positionClose.setName(position.getName());
        positionClose.setSymbol(position.getSymbol());
        positionClose.setOpenedAt(position.getCreatedAt());
        positionClose.setType(position.getType());
        positionClose.setQuantity(soldShares);
        positionClose.setEntryPrice(position.getPrice());
        positionClose.setClosedAt(req.createdAt());
        positionClose.setExitPrice(req.price());
        positionClose.setProfitLoss(profitLoss);
        positionClose.setProfitLossPercentage(profitLossPercentage);
        positionClose.setPortfolio(getPortfolio(position.getPortfolio().getId()));

        return positionClose;
    }

    private Position buildPosition(PositionRequest req, Portfolio portfolio) {
        Position position = new Position();
        position.setName(req.name());
        position.setSymbol(req.symbol());
        position.setExchange(req.exchange());
        position.setType(req.type());
        position.setQuantity(req.quantity());
        Double fee = req.fee() != null ? req.fee(): 0;
        position.setFee(fee);
        position.setPrice(req.price());
        Double grossAmount = calculateGross(req.quantity(), req.price());
        position.setGrossAmount(grossAmount);
        position.setNetAmount(calculateNet(grossAmount, req.fee()));
        position.setCreatedAt(req.date());
        position.setPortfolio(portfolio);
        return position;
    }

    private PositionResponse toPositionResponse(Position position) {
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
                quote != null? quote.close(): 0.0,
                quote != null? quote.previousClose(): 0.0,
                position.getFee(),
                position.getCreatedAt(),
                position.getNetAmount(),
                position.getGrossAmount()
        );
    }

    private PositionCloseResponse toPositionCloseResponse(PositionClose positionClose) {

        return new PositionCloseResponse(
                positionClose.getId(),
                positionClose.getName(),
                positionClose.getSymbol(),
                positionClose.getOpenedAt(),
                positionClose.getType(),
                positionClose.getQuantity(),
                positionClose.getEntryPrice(),
                positionClose.getClosedAt(),
                positionClose.getExitPrice(),
                positionClose.getProfitLossPercentage(),
                positionClose.getProfitLoss(),
                positionClose.getPortfolio().getId()
        );
    }

    private PositionSummaryResponse toSummaryResponse(List<Position> positions) {
        Position first = positions.get(0);

        double totalQuantity = positions.stream()
                .mapToDouble(Position::getQuantity)
                .sum();

        double totalGrossCost = positions.stream()
                .mapToDouble(position -> position.getPrice() * position.getQuantity())
                .sum();

        double totalFees = positions.stream()
                .mapToDouble(position -> position.getFee() != null ? position.getFee() : 0.0)
                .sum();

        double averagePrice = totalQuantity != 0 ? totalGrossCost / totalQuantity : 0.0;
        double totalNetCost = totalGrossCost + totalFees;

        TwelveDataQuoteResponse quote = null;

        try {
            quote = twelveDataClient.getQuote(first.getSymbol());
        } catch (Exception e) {
            log.error(e.getMessage());
        }

        double currentPrice = quote != null ? quote.close() : 0.0;
        double previousClose = quote != null ? quote.previousClose() : 0.0;

        double marketValue = currentPrice * totalQuantity;
        double previousMarketValue = previousClose * totalQuantity;
        double dailyProfitLoss = (currentPrice - previousClose) * totalQuantity;
        double dailyProfitLossPercentage = previousMarketValue != 0 ? (dailyProfitLoss / previousMarketValue) * 100 : 0.0;
        double netProfitLoss = marketValue - totalNetCost;
        double netProfitLossPercentage = totalNetCost != 0 ? (netProfitLoss / totalNetCost) * 100 : 0.0;

        return new PositionSummaryResponse(
                first.getName(),
                first.getSymbol(),
                first.getType(),
                totalQuantity,
                averagePrice,
                currentPrice,
                marketValue,
                dailyProfitLoss,
                dailyProfitLossPercentage,
                netProfitLossPercentage,
                netProfitLoss
        );
    }

    private Double calculateGross(Double quantity, Double price){
        return quantity * price;
    }

    private Double calculateNet(Double gross, Double fee){
        return gross + fee;
    }

    private Portfolio getPortfolio(Long portfolioId) {
        return portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));
    }

    private Position getPosition(Long positionId) {
        return positionRepository.findById(positionId)
                .orElseThrow(() -> new NotFoundException(positionId, "Position not found with id: "));
    }


}
