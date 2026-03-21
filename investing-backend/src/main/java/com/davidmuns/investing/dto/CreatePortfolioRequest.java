package com.davidmuns.investing.dto;

import com.davidmuns.investing.entity.PortfolioType;
import jakarta.validation.constraints.*;

public record CreatePortfolioRequest(
        @NotBlank
        @Size(max = 80)
        String name,
        @NotNull
        PortfolioType type
) {}