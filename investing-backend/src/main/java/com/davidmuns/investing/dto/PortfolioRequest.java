package com.davidmuns.investing.dto;

import com.davidmuns.investing.entity.PortfolioType;
import jakarta.validation.constraints.*;

public record PortfolioRequest(
        Long id,
        @NotBlank
        @Size(max = 80)
        String name,
        @NotNull
        PortfolioType type,
        Integer displayOrder
) {}