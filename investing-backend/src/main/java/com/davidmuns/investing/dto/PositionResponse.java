package com.davidmuns.investing.dto;

import com.davidmuns.investing.entity.Portfolio;

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
}
