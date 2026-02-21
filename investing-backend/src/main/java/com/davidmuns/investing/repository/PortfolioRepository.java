package com.davidmuns.investing.repository;

import com.davidmuns.investing.domain.Portfolio;
import com.davidmuns.investing.domain.PortfolioType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    boolean existsByNameIgnoreCaseAndType(String name, PortfolioType type);

}