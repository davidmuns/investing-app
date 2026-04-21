package com.davidmuns.investing.service;

import com.davidmuns.investing.client.TwelveDataClient;
import com.davidmuns.investing.dto.*;
import com.davidmuns.investing.entity.Portfolio;
import com.davidmuns.investing.entity.Position;
import com.davidmuns.investing.entity.PositionClose;
import com.davidmuns.investing.exception.InvalidSellQuantityException;
import com.davidmuns.investing.exception.NotFoundException;
import com.davidmuns.investing.repo.PortfolioRepository;
import com.davidmuns.investing.repo.PositionCloseRepository;
import com.davidmuns.investing.repo.PositionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.toList;

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

    public SearchResponse<PositionCloseResponse> findAllClosed() {
        List<PositionCloseResponse> dtoList = positionCloseRepository.findAll()
                .stream()
                .map(this::toPositionCloseResponse)
                .collect(toList());
        return new SearchResponse<>(dtoList, dtoList.size());
    }

    public SearchResponse<PositionCloseResponse> findAllClosedByPortfolioId(Long portfolioId) {
        Portfolio portfolio = getPortfolio(portfolioId);

        List<PositionCloseResponse> resp = positionCloseRepository.findByPortfolio(portfolio)
                .stream()
                .map(this::toPositionCloseResponse)
                .collect(toList());

        return new SearchResponse<>(resp, resp.size());
    }

    public SearchResponse<PositionResponse> findAllByPortfolioId(Long portfolioId) {
        Portfolio portfolio = getPortfolio(portfolioId);

        List<PositionResponse> resp = positionRepository.findByPortfolio(portfolio)
                .stream()
                .map(this::toPositionResponse)
                .collect(toList());
        return new SearchResponse<>(resp, resp.size());
    }

    public SearchResponse<PositionOpenResponse> findAllOpenByPortfolioId1(Long portfolioId) {
        Portfolio portfolio = getPortfolio(portfolioId);
        List<Position> positions = positionRepository.findByPortfolio(portfolio);
        Map<String, TwelveDataQuoteResponse> quotesBySymbol = positions.stream()
                .map(Position::getSymbol)
                .distinct()
                .collect(Collectors.toMap(
                        symbol -> symbol,
                        this::getTwelveDataQuoteResponse
                ));
        List<PositionOpenResponse> resp = positions.stream()
                .map(position -> toPositionOpenResponse(position, quotesBySymbol))
                .collect(toList());
        return new SearchResponse<>(resp, resp.size());
    }

    public SearchResponse<PositionOpenResponse> findAllOpenByPortfolioId(Long portfolioId) {
        Portfolio portfolio = getPortfolio(portfolioId);
        List<Position> positions = positionRepository.findByPortfolio(portfolio);

        Map<String, TwelveDataQuoteResponse> quotesBySymbol = new HashMap<>();

        for (Position position : positions) {
            String symbol = position.getSymbol();
            if (!quotesBySymbol.containsKey(symbol)) {
                quotesBySymbol.put(symbol, getTwelveDataQuoteResponse(symbol));
            }
        }

        List<PositionOpenResponse> resp = new ArrayList<>();
        for (Position position : positions) {
            resp.add(toPositionOpenResponse(position, quotesBySymbol));
        }

        return new SearchResponse<>(resp, resp.size());
    }

    public SearchResponse<PositionSummaryResponse> findSummaryByPortfolioId(Long portfolioId) {
        Portfolio portfolio = getPortfolio(portfolioId);

        List<Position> positions = positionRepository.findByPortfolio(portfolio);

        Map<String, List<Position>> grouped = positions.stream()
                .collect(Collectors.groupingBy(position ->
                        position.getSymbol() + "|" + position.getExchange() + "|" + position.getType()
                ));

        List<PositionSummaryResponse> summaries = grouped.values().stream()
                .map(this::toSummaryResponse)
                .toList();

        return new SearchResponse<>(summaries, summaries.size());
    }

    @Transactional
    public void deletePosition(Long id) {
        Position position = getPosition(id);
        positionRepository.delete(position);
    }

    @Transactional
    public void deletePositionClose(Long id) {
        PositionClose position = getPositionClose(id);
        positionCloseRepository.delete(position);
    }

    @Transactional
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

    @Transactional
    public PositionCloseResponse close(UpdatePositionRequest req) {
        Position position = getPosition(req.id());

        Double requestedQuantity = req.quantity();
        Double currentQuantity = position.getQuantity();

        if (Double.compare(requestedQuantity, currentQuantity) > 0) {
            throw new InvalidSellQuantityException(
                    "No es posible cerrar más cantidad de la que actualmente tiene."
            );
        }

        PositionClose positionClose = buildPositionClose(position, req);
        PositionClose savedClose = positionCloseRepository.save(positionClose);

        Double remainingShares = currentQuantity - requestedQuantity;

        if (Double.compare(remainingShares, 0.0) == 0) {
            deletePosition(position.getId());
        } else {
            Double feePerShare = position.getFee() / currentQuantity;
            Double remainingFee = feePerShare * remainingShares;

            UpdatePositionRequest update = new UpdatePositionRequest(
                    position.getId(),
                    remainingShares,
                    position.getPrice(),
                    remainingFee,
                    position.getCreatedAt()
            );

            edit(update);
        }

        return toPositionCloseResponse(savedClose);
    }

    private PositionClose buildPositionClose(Position position, UpdatePositionRequest req) {
        PositionClose positionClose = new PositionClose();

        Double feePerShare = position.getFee() / position.getQuantity();
        Double totalNetPurchasePrice = req.quantity() * (position.getPrice() + feePerShare);
        Double totalNetSellingPrice = (req.quantity() * req.price()) - req.fee();
        Double profitLoss = totalNetSellingPrice - totalNetPurchasePrice;
        Double profitLossPercentage = ((totalNetSellingPrice / totalNetPurchasePrice) - 1) * 100;

        positionClose.setName(position.getName());
        positionClose.setSymbol(position.getSymbol());
        positionClose.setOpenedAt(position.getCreatedAt());
        positionClose.setType(position.getType());
        positionClose.setQuantity(req.quantity());
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
        return new PositionResponse(
                position.getId(),
                position.getSymbol(),
                position.getQuantity(),
                position.getPortfolio().getId(),
                position.getPrice(),
                position.getFee(),
                position.getCreatedAt()
        );
    }

    private PositionOpenResponse toPositionOpenResponse(Position position, Map<String, TwelveDataQuoteResponse> quotesBySymbol) {
        TwelveDataQuoteResponse quote = quotesBySymbol.get(position.getSymbol());

        double currentPrice = quote != null ? quote.close() : 0.0;
        double previousClose = quote != null ? quote.previousClose() : 0.0;
        double marketValue = position.getQuantity() * currentPrice;
        double netProfitLossValue = marketValue - position.getNetAmount();
        double netProfitLossPercentage = position.getNetAmount() != 0 ? ((marketValue / position.getNetAmount()) - 1) * 100 : 0.0;
        double dailyProfitLoss = (currentPrice - previousClose) * position.getQuantity();

        return new PositionOpenResponse(
                position.getId(),
                position.getName(),
                position.getSymbol(),
                position.getType(),
                position.getQuantity(),
                position.getPortfolio().getId(),
                position.getPrice(),
                currentPrice,
                marketValue,
                position.getCreatedAt(),
                netProfitLossValue,
                netProfitLossPercentage,
                dailyProfitLoss
        );
    }

    private PositionCloseResponse  toPositionCloseResponse(PositionClose positionClose) {
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

        TwelveDataQuoteResponse quote = getTwelveDataQuoteResponse(first.getSymbol());

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
                .orElseThrow(() -> new NotFoundException(portfolioId, "Portfolio not found with id: "));
    }

    private Position getPosition(Long positionId) {
        return positionRepository.findById(positionId)
                .orElseThrow(() -> new NotFoundException(positionId, "Position not found with id: "));
    }

    private PositionClose getPositionClose(Long positionId) {
        return positionCloseRepository.findById(positionId)
                .orElseThrow(() -> new NotFoundException(positionId, "Position not found with id: "));
    }

    private TwelveDataQuoteResponse getTwelveDataQuoteResponse(String symbol) {
        log.info("inside getTwelveDataQuoteResponse method");
        TwelveDataQuoteResponse quote = null;
        try {
            quote = twelveDataClient.getQuote(symbol);
        } catch (Exception e) {
            log.error(e.getMessage());
        }
        return quote;
    }


}
