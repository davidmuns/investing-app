package com.davidmuns.investing.api.dto;

import com.davidmuns.investing.domain.Portfolio;
import com.davidmuns.investing.domain.PortfolioType;

public record PortfolioResponse(Long id, String name, PortfolioType type) {
    public static PortfolioResponse from(Portfolio p) {
        return new PortfolioResponse(p.getId(), p.getName(), p.getType());
    }
}