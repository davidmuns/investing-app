package com.davidmuns.investing.dto;

import java.time.LocalDate;

public record UpdatePositionRequest(
        Long id,
        Double quantity,
        Double price,
        Double fee,
        LocalDate createdAt
) {
}
