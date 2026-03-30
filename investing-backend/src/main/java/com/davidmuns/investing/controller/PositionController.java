package com.davidmuns.investing.controller;

import com.davidmuns.investing.dto.*;
import com.davidmuns.investing.service.PositionService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/positions")
@CrossOrigin
@Slf4j
public class PositionController {

    private final PositionService positionService;

    public PositionController(PositionService positionService) {
        this.positionService = positionService;
    }

    @PostMapping("/{portfolioId}")
    @ResponseStatus(HttpStatus.CREATED)
    public void create(@Valid @RequestBody PositionRequest req, @PathVariable Long portfolioId) {
        positionService.save(req, portfolioId);
    }

    @GetMapping("/{portfolioId}")
    @ResponseStatus(HttpStatus.CREATED)
    public SearchResponse<PositionResponse> listByPortfolioID(@PathVariable Long portfolioId) {
        return positionService.findAllByPortfolioID(portfolioId);
    }

    @GetMapping("/{portfolioId}/summary")
    @ResponseStatus(HttpStatus.OK)
    public SearchResponse<PositionSummaryResponse> summaryByPortfolioId(@PathVariable Long portfolioId) {
        return positionService.findSummaryByPortfolioId(portfolioId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        positionService.delete(id);
        return ResponseEntity.noContent().build(); // 204 ✅
    }
}
