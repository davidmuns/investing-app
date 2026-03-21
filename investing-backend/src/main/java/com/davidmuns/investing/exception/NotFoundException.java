package com.davidmuns.investing.exception;

public class NotFoundException extends RuntimeException {
    public NotFoundException(Long id, String msg) {
        super(msg + id);
    }
}
