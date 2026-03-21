package com.davidmuns.investing.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TwelveDataQuoteResponse {
    private String name;
    private String symbol;
    private Double close;
    private Double open;
    private Double high;
    private Double low;
    private Double change;
    @JsonProperty("percent_change")
    private Double percentChange;
    @JsonProperty("previous_close")
    private Double previousClose;
    private Long volume;
    private String datetime; // o LocalDate más adelante
}
