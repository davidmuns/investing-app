package com.davidmuns.investing.repo;

import com.davidmuns.investing.entity.Instrument;
import com.davidmuns.investing.entity.Portfolio;
import com.davidmuns.investing.entity.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PositionRepository extends JpaRepository<Position, Long> {
    Optional<List<Position>> findBySymbolIgnoreCase(String symbol);
    Optional<List<Position>>findByPortfolio(Portfolio portfolio);
    void deleteByPortfolioId(Long portfolioId);
}
