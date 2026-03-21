package com.davidmuns.investing.dto;

public record InstrumentResponse(
        Long id,
        String name,
        String symbol,
        String type,
        String exchange,
        Long portfolioId,
        Double open,
        Double close,
        Double high,
        Double low,
        Double change,
        Double percentChange
) {
    public InstrumentResponse(Long id, String name, String symbol, String type, String exchange, Long portfolioId) {
        this(id, name, symbol, type, exchange, portfolioId, null, null, null, null, null, null);
    }

    public InstrumentResponse(Long id, String name, String symbol, String type) {
        this(id, name, symbol, type, null, null, null, null, null, null, null, null);
    }

}
