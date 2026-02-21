package com.davidmuns.investing.service;

import com.davidmuns.investing.api.dto.CreatePortfolioRequest;
import com.davidmuns.investing.domain.Portfolio;
import com.davidmuns.investing.repository.PortfolioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PortfolioService {

    private final PortfolioRepository repository;

    public PortfolioService(PortfolioRepository repository) {
        this.repository = repository;
    }

    public List<Portfolio> findAll() {
        return repository.findAll();
    }

    @Transactional
    public Portfolio create(CreatePortfolioRequest req) {
        String name = req.name().trim();

        if (repository.existsByNameIgnoreCaseAndType(name, req.type())) {
            throw new DuplicatePortfolioException("Ya existe una cartera '" + name + "' de tipo " + req.type());
        }

        return repository.save(new Portfolio(name, req.type()));
    }
}