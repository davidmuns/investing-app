package com.davidmuns.investing.service;

import com.davidmuns.investing.client.TwelveDataClient;
import com.davidmuns.investing.dto.*;
import com.davidmuns.investing.entity.Instrument;
import com.davidmuns.investing.entity.Portfolio;
import com.davidmuns.investing.exception.NotFoundException;
import com.davidmuns.investing.repo.InstrumentRepository;
import com.davidmuns.investing.repo.PortfolioRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class InstrumentService {

    private final InstrumentRepository instrumentRepository;
    private final PortfolioRepository portfolioRepository;
    private final TwelveDataClient twelveDataClient;

    public InstrumentService(InstrumentRepository instrumentRepository, PortfolioRepository portfolioRepository, TwelveDataClient twelveDataClient) {
        this.instrumentRepository = instrumentRepository;
        this.portfolioRepository =  portfolioRepository;
        this.twelveDataClient = twelveDataClient;
    }

    @Transactional
    public InstrumentResponse create(InstrumentRequest req, Long portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));
        String name = normalize(req.getName());
        String symbol = normalize(req.getSymbol().toUpperCase());
        String type = normalize(req.getType());
        String exchange = normalize(req.getExchange().toUpperCase());
        return instrumentRepository.findBySymbolIgnoreCaseAndExchangeIgnoreCase(symbol, exchange)
                .map(this::toResponse)
                .orElseGet(() -> {
                    Instrument instrument = buildInstrument(name, symbol, type, exchange, portfolio);
                    return toResponse(instrumentRepository.save(instrument));
                });
    }

    public void delete(Long id) {
        Instrument instrument = instrumentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(id, "Instrument not found with id: "));
        instrumentRepository.delete(instrument);
    }

    public SearchResponse<InstrumentResponse> findAll() {
        List<InstrumentResponse> dtoList = instrumentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return new SearchResponse<InstrumentResponse>(dtoList, dtoList.size());
    }

    public SearchResponse<InstrumentResponse> search(String query) {

        if (query == null || query.trim().isEmpty()) {
            return new SearchResponse<>(List.of(), 0);
        }

        String normalizedQuery = query.trim();

        List<InstrumentResponse> dtoList =
                instrumentRepository.searchByQuery(normalizedQuery, PageRequest.of(0, 20))
                        .stream()
                        .map(i -> new InstrumentResponse(
                                i.getId(),
                                i.getName(),
                                i.getSymbol(),
                                i.getType()
                        ))
                        .collect(Collectors.toList());

        return new SearchResponse<>(dtoList, dtoList.size());
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private Instrument buildInstrument(String name, String symbol, String type, String exchange, Portfolio portfolio) {
        Instrument instrument = new Instrument();
        instrument.setName(name);
        instrument.setSymbol(symbol);
        instrument.setType(type);
        instrument.setExchange(exchange);
        instrument.setPortfolio(portfolio);
        return instrument;
    }

    private InstrumentResponse toResponse(Instrument instrument) {
        InstrumentResponse response = new InstrumentResponse();
        TwelveDataQuoteResponse quote = null;

        try {
            quote = twelveDataClient.getQuote(instrument.getSymbol());
        } catch (Exception e) {
            log.error(e.getMessage());
        }

        response.setId(instrument.getId());
        response.setName(instrument.getName());
        response.setSymbol(instrument.getSymbol());
        response.setType(instrument.getType());
        response.setExchange(instrument.getExchange());
        response.setPortfolioId(instrument.getPortfolio().getId());

        response.setOpen(quote != null ? quote.getOpen() : null);
        response.setClose(quote != null ? quote.getClose() : null);
        response.setHigh(quote != null ? quote.getHigh() : null);
        response.setLow(quote != null ? quote.getLow() : null);
        response.setChange(quote != null ? quote.getChange() : null);
        response.setPercentChange(quote != null ? quote.getPercentChange() : null);

        return response;
    }
}
