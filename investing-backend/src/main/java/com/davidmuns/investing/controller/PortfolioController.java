package com.davidmuns.investing.controller;


import com.davidmuns.investing.dto.PortfolioRequest;
import com.davidmuns.investing.dto.PortfolioResponse;
import com.davidmuns.investing.dto.SearchResponse;
import com.davidmuns.investing.service.PortfolioService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.List;
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

    @GetMapping("/{id}")
    public PortfolioResponse one(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PortfolioResponse create(@Valid @RequestBody PortfolioRequest req) {
//        public PortfolioResponse create(@RequestBody CreatePortfolioRequest req) {
        log.debug("Create Portfolio Request: {}", req);
        return service.create(req);
    }

    @PutMapping("/reorder")
    public SearchResponse<PortfolioResponse> reorder(@Valid @RequestBody List<PortfolioRequest> req) {
        SearchResponse<PortfolioResponse> resp = service.reorder(req);
        return resp;
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

        return service.rename(id, body.get("name"));
    }
}
