package com.davidmuns.investing.api.controller;

import com.davidmuns.investing.domain.Portfolio;
import com.davidmuns.investing.service.PortfolioService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.davidmuns.investing.api.dto.CreatePortfolioRequest;
import com.davidmuns.investing.api.dto.PortfolioResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portfolios")
public class PortfolioController {

    private final PortfolioService service;

    public PortfolioController(PortfolioService service) {
        this.service = service;
    }

    @GetMapping
    public List<PortfolioResponse> list() {
        return service.findAll().stream().map(PortfolioController::toResponse).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PortfolioResponse create(@Valid @RequestBody CreatePortfolioRequest req) {
        Portfolio created = service.create(req);
        return toResponse(created);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    private static PortfolioResponse toResponse(Portfolio p) {
        return new PortfolioResponse(p.getId(), p.getName(), p.getType());
    }
}