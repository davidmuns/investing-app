package com.davidmuns.investing.api.dto;

import com.davidmuns.investing.domain.PortfolioType;

public record PortfolioResponse(
        Long id,
        String name,
        PortfolioType type
) {}