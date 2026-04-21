package com.davidmuns.investing.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "closed_positions")
@Data
public class PositionClose {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String symbol;

    @Column
    private LocalDate openedAt;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private Double quantity;

    @Column
    private Double entryPrice;

    @Column
    private LocalDate closedAt;

    @Column
    private Double exitPrice;

    @Column
    private Double profitLossPercentage;

    @Column
    private Double profitLoss;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;
}
