package com.davidmuns.investing.exception;

public class InvalidSellQuantityException extends RuntimeException {
    public InvalidSellQuantityException(String message) {
        super(message);
    }
}
