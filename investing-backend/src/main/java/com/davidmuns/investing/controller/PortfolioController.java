package com.davidmuns.investing.controller;

import com.davidmuns.investing.dto.CreatePortfolioRequest;
import com.davidmuns.investing.dto.PortfolioResponse;
import com.davidmuns.investing.dto.SearchResponse;
import com.davidmuns.investing.entity.Portfolio;
import com.davidmuns.investing.service.PortfolioService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/portfolios")
@CrossOrigin
@Slf4j
public class PortfolioController {

    private final PortfolioService service;

    public PortfolioController(PortfolioService service) {
        this.service = service;
    }

    @GetMapping
    public SearchResponse<PortfolioResponse> list() {
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PortfolioResponse create(@Valid @RequestBody CreatePortfolioRequest req) {
//        public PortfolioResponse create(@RequestBody CreatePortfolioRequest req) {
        log.debug("Create Portfolio Request: {}", req);
        return toResponse(service.create(req));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PatchMapping("/{id}/name")
    public PortfolioResponse rename(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        Portfolio updated = service.rename(id, body.get("name"));
        return PortfolioResponse.from(updated); // o new PortfolioResponse(...)
    }

    private static PortfolioResponse toResponse(Portfolio p) {
        return new PortfolioResponse(p.getId(), p.getName(), p.getType());
    }
}
