package com.davidmuns.investing.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record TwelveDataSymbolSearchResponse(
        List<Item> data,
        String status,
        Integer count
) {
    public record Item(
            String symbol,
            @JsonProperty("instrument_name") String instrumentName,
            String exchange,
            @JsonProperty("mic_code") String micCode,
            @JsonProperty("exchange_timezone") String exchangeTimezone,
            @JsonProperty("instrument_type") String instrumentType,
            String country,
            String currency
    ) {
    }
}