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

    @PatchMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void edit(@RequestBody UpdatePositionRequest req) {
        positionService.edit(req);
    }

    @PutMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PositionCloseResponse close(@RequestBody UpdatePositionRequest req) {
        return positionService.close(req);
    }

    @GetMapping("/{portfolioId}")
    @ResponseStatus(HttpStatus.CREATED)
    public SearchResponse<PositionResponse> listByPortfolioID(@PathVariable Long portfolioId) {
        return positionService.findAllByPortfolioID(portfolioId);
    }

    @GetMapping("/closed")
    @ResponseStatus(HttpStatus.CREATED)
    public SearchResponse<PositionCloseResponse> list() {
        return positionService.findAllClosed();
    }

    @GetMapping("/{portfolioId}/summary")
    @ResponseStatus(HttpStatus.OK)
    public SearchResponse<PositionSummaryResponse> summaryByPortfolioId(@PathVariable Long portfolioId) {
        return positionService.findSummaryByPortfolioId(portfolioId);
    }

    @DeleteMapping("/closed/{id}")
    public ResponseEntity<Void> deletePositionClose(@PathVariable Long id) {
        positionService.deletePositionClose(id);
        return ResponseEntity.noContent().build(); // 204 ✅
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePosition(@PathVariable Long id) {
        positionService.deletePosition(id);
        return ResponseEntity.noContent().build(); // 204 ✅
    }
}
