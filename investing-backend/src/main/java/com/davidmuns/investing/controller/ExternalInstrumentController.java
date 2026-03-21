package com.davidmuns.investing.controller;

import com.davidmuns.investing.dto.InstrumentResponse;
import com.davidmuns.investing.dto.SearchResponse;
import com.davidmuns.investing.dto.TwelveDataQuoteResponse;
import com.davidmuns.investing.dto.TwelveDataSymbolSearchResponse;
import com.davidmuns.investing.service.ExternalInstrumentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/external/instruments")
@CrossOrigin
@Slf4j
public class ExternalInstrumentController {

    private final ExternalInstrumentService externalInstrumentService;

    public ExternalInstrumentController(ExternalInstrumentService externalInstrumentService) {
        this.externalInstrumentService = externalInstrumentService;
    }

    @GetMapping("/search")
    public SearchResponse<InstrumentResponse> search(@RequestParam String q) {
        SearchResponse<InstrumentResponse> response = externalInstrumentService.search(q);
        log.debug(response.toString());
        return response;
    }

    @GetMapping("/search-quote")
    public TwelveDataQuoteResponse searchQuote(@RequestParam String q) {
        TwelveDataQuoteResponse response = externalInstrumentService.getQuote(q);
        log.debug(response.toString());
        return response;
    }
}