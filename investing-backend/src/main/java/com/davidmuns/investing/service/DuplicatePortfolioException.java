package com.davidmuns.investing.service;

public class DuplicatePortfolioException extends RuntimeException {
    public DuplicatePortfolioException(String message) {
        super(message);
    }
}
