package com.davidmuns.investing.repo;

import com.davidmuns.investing.entity.Portfolio;
import com.davidmuns.investing.entity.PortfolioType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    boolean existsByNameIgnoreCaseAndType(String name, PortfolioType type);

}
