package com.davidmuns.investing.entity;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

//import javax.persistence.*;
import java.time.LocalDateTime;

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

    @CreationTimestamp // This annotation generates current local date and time
    private LocalDateTime createdAt;

    protected Portfolio() {}

    public Portfolio(String name, PortfolioType type) {
        this.name = name;
        this.type = type;
    }
}
