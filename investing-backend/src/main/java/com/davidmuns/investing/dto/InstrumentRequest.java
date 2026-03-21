package com.davidmuns.investing.dto;

import lombok.Data;

@Data
public class InstrumentRequest {
    private String name;
    private String symbol;
    private String exchange;
    private String type;
    private Integer portfolioId;

    public InstrumentRequest() {
    }
}
