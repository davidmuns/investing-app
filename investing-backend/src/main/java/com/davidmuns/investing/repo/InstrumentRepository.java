package com.davidmuns.investing.repo;

import com.davidmuns.investing.entity.Instrument;
import com.davidmuns.investing.entity.Portfolio;
import com.davidmuns.investing.entity.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstrumentRepository extends JpaRepository<Instrument, Long> {

    @Query(
            "SELECT i " +
                    "FROM Instrument i " +
                    "WHERE LOWER(i.symbol) LIKE LOWER(CONCAT(:query, '%')) " +
                    "OR LOWER(i.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
                    "ORDER BY i.symbol ASC"
    )
    List<Instrument> searchByQuery(@Param("query") String query, Pageable pageable);
    void deleteByPortfolioId(Long portfolioId);
    Optional<List<Instrument>>findByPortfolio(Portfolio portfolio);
    Optional<Instrument> findBySymbolIgnoreCaseAndExchangeIgnoreCase(String symbol, String exchange);
    Optional<Instrument> findByPortfolioAndSymbolIgnoreCaseAndExchangeIgnoreCase(
            Portfolio portfolio,
            String symbol,
            String exchange
    );
}
