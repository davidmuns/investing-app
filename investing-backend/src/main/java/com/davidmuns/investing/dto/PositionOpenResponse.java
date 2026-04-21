package com.davidmuns.investing.dto;

import java.time.LocalDate;

public record PositionOpenResponse(
        Long id,
        String name,
        String symbol,
        String type,
        Double quantity,
        Long portfolioId,
        Double price,
        Double close,
        Double marketValue,
        LocalDate createdAt,
        Double netProfitLossValue,
        Double netProfitLossPercentage,
        Double dailyProfitLoss
) {
}
