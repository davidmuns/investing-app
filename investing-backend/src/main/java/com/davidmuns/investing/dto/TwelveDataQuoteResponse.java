package com.davidmuns.investing.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TwelveDataQuoteResponse(
        String name,
        String symbol,
        Double close,
        Double open,
        Double high,
        Double low,
        Double change,
        @JsonProperty("percent_change")
        Double percentChange,
        @JsonProperty("previous_close")
        Double previousClose,
        Long volume,
        String datetime
){}
