package com.davidmuns.investing.dto;

import java.time.LocalDate;

public record PositionResponse(
        Long id,
        String name,
        String symbol,
        String type,
        Double quantity,
        Long portfolioId,
        Double price,
        Double close,
        Double previousClose,
        Double fee,
        LocalDate createdAt,
        Double netAmount,
        Double grossAmount
) {
    public PositionResponse(Long id, String symbol, Double quantity, Long portfolioId, Double price, Double fee, LocalDate createdAt) {
        this(id, null, symbol, null, quantity, portfolioId, price, null, null, fee, createdAt, null, null);
    }
}
