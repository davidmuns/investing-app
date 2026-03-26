package com.davidmuns.investing.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

public record PositionRequest(
        String name,
        String symbol,
        Double quantity,
        String type,
        Double price,
        Double fee,
        LocalDate date,
        Long portfolioId
) {
}
