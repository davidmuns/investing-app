package com.davidmuns.investing.api.exception;

import com.davidmuns.investing.api.dto.AiResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClientResponseException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private final ObjectMapper mapper;

    public GlobalExceptionHandler(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @ExceptionHandler(RestClientResponseException.class)
    public ResponseEntity<AiResponse> handleOpenAiError(RestClientResponseException ex) {

        Map<String, Object> err;
        try {
            err = mapper.readValue(
                    ex.getResponseBodyAsString(),
                    new TypeReference<Map<String, Object>>() {}
            );
        } catch (Exception ignore) {
            err = Map.of("raw", ex.getResponseBodyAsString());
        }

        AiResponse body = new AiResponse(
                false,
                null,
                ex.getStatusCode().value(),
                err
        );

        return ResponseEntity.status(ex.getStatusCode()).body(body);
    }
}