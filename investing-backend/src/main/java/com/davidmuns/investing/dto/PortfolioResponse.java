package com.davidmuns.investing.dto;

import com.davidmuns.investing.entity.PortfolioType;

public record PortfolioResponse(
        Long id,
        String name,
        PortfolioType type
){}
