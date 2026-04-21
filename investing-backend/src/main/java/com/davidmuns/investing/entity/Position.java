package com.davidmuns.investing.entity;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "positions")
@Data
public class Position {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String symbol;

    @Column(nullable = false)
    private String exchange;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private Double quantity;

    @Column
    private Double netAmount;

    @Column
    private Double grossAmount;

    @Column
    private Double price;

//    @Column(name = "current_price", nullable = false, precision = 19, scale = 4)
//    private BigDecimal currentPrice;
//
//    @Column(name = "daily_profit_loss", nullable = false, precision = 19, scale = 4)
//    private BigDecimal dailyProfitLoss;
//
//    @Column(name = "daily_profit_loss_percent", nullable = false, precision = 19, scale = 4)
//    private BigDecimal dailyProfitLossPercent;
//
//    @Column(name = "net_profit_loss", nullable = false, precision = 19, scale = 4)
//    private BigDecimal netProfitLoss;

    @Column
    private Double fee;

    @Column
    private LocalDate createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

}
