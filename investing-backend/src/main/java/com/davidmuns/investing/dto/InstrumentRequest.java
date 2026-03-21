package com.davidmuns.investing.dto;

public record InstrumentRequest(
        String name,
        String symbol,
        String exchange,
        String type,
        Integer portfolioId
){}
