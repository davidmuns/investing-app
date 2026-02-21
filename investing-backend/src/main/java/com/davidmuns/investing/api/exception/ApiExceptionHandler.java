package com.davidmuns.investing.api.exception;

import com.davidmuns.investing.service.DuplicatePortfolioException;
import com.davidmuns.investing.service.PortfolioNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

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

    @ExceptionHandler(PortfolioNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> handleNotFound(PortfolioNotFoundException ex) {
        return Map.of("error", "PORTFOLIO_NOT_FOUND", "message", ex.getMessage());
    }

}