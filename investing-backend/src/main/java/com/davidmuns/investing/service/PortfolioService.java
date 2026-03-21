package com.davidmuns.investing.service;

import com.davidmuns.investing.dto.CreatePortfolioRequest;
import com.davidmuns.investing.dto.PortfolioResponse;
import com.davidmuns.investing.dto.SearchResponse;
import com.davidmuns.investing.entity.Portfolio;
import com.davidmuns.investing.exception.DuplicatePortfolioException;
import com.davidmuns.investing.exception.NotFoundException;
import com.davidmuns.investing.repo.InstrumentRepository;
import com.davidmuns.investing.repo.PortfolioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PortfolioService {

    private final PortfolioRepository repository;
    private final InstrumentRepository instrumentRepository;

    public PortfolioService(PortfolioRepository repository, InstrumentRepository instrumentRepository) {
        this.repository = repository;
        this.instrumentRepository = instrumentRepository;
    }

    public SearchResponse<PortfolioResponse> findAll() {
        List<PortfolioResponse> dtoList = repository.findAll()
                .stream()
                .map(pr -> new PortfolioResponse(
                        pr.getId(),
                        pr.getName(),
                        pr.getType()
                )).collect(Collectors.toList());
        return new SearchResponse<PortfolioResponse>(dtoList, dtoList.size());
    }

    @Transactional
    public Portfolio create(CreatePortfolioRequest req) {
        String name = req.getName().trim();

        if (repository.existsByNameIgnoreCaseAndType(name, req.getType())) {
            throw new DuplicatePortfolioException("Ya existe una cartera '" + name + "' de tipo " + req.getType());
        }

        return repository.save(new Portfolio(name, req.getType()));
    }

    @Transactional
    public void delete(Long id) {
        String msg = "No existe portfolio con id:";
        if (!repository.existsById(id)) {
            throw new NotFoundException(id, msg);
        }
        instrumentRepository.deleteByPortfolioId(id);
        repository.deleteById(id);
    }

    public Portfolio rename(Long id, String newName) {
        String msg = "No existe portfolio con id:";
        Portfolio portfolio = repository.findById(id)
                .orElseThrow(() -> new NotFoundException(id, msg));
        portfolio.setName(newName.trim());
        return repository.save(portfolio);
    }
}