package com.davidmuns.investing.dto;

public record PositionSummaryResponse(
        String name,
        String symbol,
        String type,
        Double totalQuantity,
        Double averagePrice,
        Double currentPrice,
        Double marketValue,
        Double dailyProfitLoss,
        Double dailyProfitLossPercentage,
        Double netProfitLossPercentage,
        Double netProfitLoss
) {
}
