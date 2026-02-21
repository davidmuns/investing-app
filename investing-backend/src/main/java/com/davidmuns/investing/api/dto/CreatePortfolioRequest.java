package com.davidmuns.investing.api.dto;

import com.davidmuns.investing.domain.PortfolioType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreatePortfolioRequest(
        @NotBlank @Size(max = 80) String name,
        @NotNull PortfolioType type
) {}