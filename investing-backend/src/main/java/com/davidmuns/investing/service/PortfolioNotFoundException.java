package com.davidmuns.investing.service;

public class PortfolioNotFoundException extends RuntimeException {
    public PortfolioNotFoundException(Long id) {
        super("No existe la cartera con id " + id);
    }
}
