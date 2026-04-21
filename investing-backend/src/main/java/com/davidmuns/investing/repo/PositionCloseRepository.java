package com.davidmuns.investing.repo;

import com.davidmuns.investing.entity.Portfolio;
import com.davidmuns.investing.entity.PositionClose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PositionCloseRepository extends JpaRepository<PositionClose, Long> {
    void deleteByPortfolioId(Long portfolioId);
//    Optional<List<PositionClose>> findByPortfolio(Portfolio portfolio);
    List<PositionClose> findByPortfolio(Portfolio portfolio);
}
