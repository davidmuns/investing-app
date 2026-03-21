package com.davidmuns.investing.entity;
import jakarta.persistence.*;
import lombok.Data;

//import javax.persistence.*;

@Entity
@Table(
        name = "instruments",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"symbol", "exchange"})
        }
)
@Data
public class Instrument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 200)
    private String name;
    @Column(nullable = false, length = 30)
    private String symbol;
    @Column(nullable = false, length = 30)
    private String type;
    @Column(nullable = false, length = 30)
    private String exchange;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    public Instrument() {
    }
}
