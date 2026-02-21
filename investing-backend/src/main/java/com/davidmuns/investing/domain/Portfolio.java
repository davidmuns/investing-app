package com.davidmuns.investing.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(
        name = "portfolios",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_portfolio_name_type", columnNames = {"name", "type"})
        }
)
@Data
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PortfolioType type;

    protected Portfolio() {}

    public Portfolio(String name, PortfolioType type) {
        this.name = name;
        this.type = type;
    }
}