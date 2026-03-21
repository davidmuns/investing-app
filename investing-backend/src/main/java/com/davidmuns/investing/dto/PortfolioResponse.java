package com.davidmuns.investing.dto;

import com.davidmuns.investing.entity.Portfolio;
import com.davidmuns.investing.entity.PortfolioType;

public class PortfolioResponse {

    private Long id;
    private String name;
    private PortfolioType type;

    public PortfolioResponse(Long id, String name, PortfolioType type) {
        this.id = id;
        this.name = name;
        this.type = type;
    }

    public static PortfolioResponse from(Portfolio p) {
        return new PortfolioResponse(p.getId(), p.getName(), p.getType());
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public PortfolioType getType() {
        return type;
    }
}
