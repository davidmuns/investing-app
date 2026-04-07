package com.davidmuns.investing.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(DuplicatePortfolioException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicate(DuplicatePortfolioException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "error", "DUPLICATE_PORTFOLIO",
                "message", ex.getMessage()
        ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        return ResponseEntity.badRequest().body(Map.of(
                "error", "VALIDATION_ERROR",
                "message", "Datos inválidos"
        ));
    }

    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> handleNotFound(NotFoundException ex) {
        return Map.of("error", "PORTFOLIO_NOT_FOUND", "message", ex.getMessage());
    }

    @ExceptionHandler(InvalidSellQuantityException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, String> handleInvalidSellQuantity(InvalidSellQuantityException ex) {
        return Map.of(
                "error", "INVALID_SELL_QUANTITY",
                "message", ex.getMessage()
        );
    }

}
