package com.davidmuns.investing.repo;

import com.davidmuns.investing.entity.PositionClose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PositionCloseRepository extends JpaRepository<PositionClose, Long> {
}
