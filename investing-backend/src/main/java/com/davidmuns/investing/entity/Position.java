package com.davidmuns.investing.entity;
import jakarta.persistence.*;
import lombok.Data;

//import javax.persistence.*;
import java.math.BigDecimal;

//@Entity
//@Table(name = "positions")
@Data
public class Position {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "instrument_id", nullable = false)
    private Instrument instrument;

    @Column(nullable = false, length = 30)
    private String type; // Compra / Venta

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "average_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal averagePrice;

    @Column(name = "current_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal currentPrice;

    @Column(name = "market_value", nullable = false, precision = 19, scale = 4)
    private BigDecimal marketValue;

    @Column(name = "daily_profit_loss", nullable = false, precision = 19, scale = 4)
    private BigDecimal dailyProfitLoss;

    @Column(name = "daily_profit_loss_percent", nullable = false, precision = 19, scale = 4)
    private BigDecimal dailyProfitLossPercent;

    @Column(name = "net_profit_loss", nullable = false, precision = 19, scale = 4)
    private BigDecimal netProfitLoss;

    public Position() {
    }

    // getters y setters
}
