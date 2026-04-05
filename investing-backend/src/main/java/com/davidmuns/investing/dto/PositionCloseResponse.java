package com.davidmuns.investing.dto;

import java.time.LocalDate;

public record PositionCloseResponse(
        Long id,
        String name,
        String symbol,
        LocalDate openedAt,
        String type,
        Double quantity,
        Double entryPrice,
        LocalDate closedAt,
        Double closedPrice,
        Double profitLossPercentage,
        Double profitLoss,
        Long portfolioId
) {
}
