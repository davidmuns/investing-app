package com.davidmuns.investing.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class TwelveDataSymbolSearchResponse {

    private List<Item> data;
    private String status;
    private Integer count;

    @Data
    public static class Item {
        private String symbol;
        @JsonProperty("instrument_name")
        private String instrumentName;
        private String exchange;
        @JsonProperty("mic_code")
        private String micCode;
        @JsonProperty("exchange_timezone")
        private String exchangeTimezone;
        @JsonProperty("instrument_type")
        private String instrumentType;
        private String country;
        private String currency;
    }
}