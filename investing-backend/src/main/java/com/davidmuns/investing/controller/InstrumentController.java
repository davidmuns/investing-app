package com.davidmuns.investing.controller;

import com.davidmuns.investing.dto.*;
import com.davidmuns.investing.service.InstrumentService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/instruments")
@CrossOrigin
@Slf4j
public class InstrumentController {

    private final InstrumentService instrumentService;

    public InstrumentController(InstrumentService instrumentService) {
        this.instrumentService = instrumentService;
    }

    @GetMapping
    public SearchResponse<InstrumentResponse> list() {
        return instrumentService.findAll();
    }

    @GetMapping("/{portfolioId}")
    @ResponseStatus(HttpStatus.CREATED)
    public SearchResponse<InstrumentResponse> listByPortfolioID(@PathVariable Long portfolioId) {
        return instrumentService.findAllByPortfolioId(portfolioId);
    }

    @GetMapping("/search")
    public SearchResponse<InstrumentResponse> search(@RequestParam String q) {
        return instrumentService.search(q);
    }

    @PostMapping("/{portfolioId}")
    @ResponseStatus(HttpStatus.CREATED)
    public InstrumentResponse create(@Valid @RequestBody InstrumentRequest req, @PathVariable Long portfolioId) {
        return instrumentService.create(req, portfolioId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        instrumentService.delete(id);
        return ResponseEntity.noContent().build(); // 204 ✅
    }
}
