package com.davidmuns.investing.dto;
import lombok.Data;

@Data
public class InstrumentResponse {
    private Long id;
    private String name;
    private String symbol;
    private String type;
    private String exchange;
    private Long portfolioId;
    private Double open;
    private Double close;
    private Double high;
    private Double low;
    private Double change;
    private Double percentChange;

    public InstrumentResponse() {
    }

    public InstrumentResponse(Long id, String name, String symbol, String type, String exchange, Long portfolioId) {
        this.id = id;
        this.name = name;
        this.symbol = symbol;
        this.type = type;
        this.exchange = exchange;
        this.portfolioId = portfolioId;
    }

    public InstrumentResponse(Long id, String name, String symbol, String type) {
        this.id = id;
        this.name = name;
        this.symbol = symbol;
        this.type = type;
    }
}
