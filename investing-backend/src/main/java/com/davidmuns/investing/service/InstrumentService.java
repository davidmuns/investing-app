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

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class InstrumentService {

    private final InstrumentRepository instrumentRepository;
    private final PortfolioRepository portfolioRepository;
    private final TwelveDataClient twelveDataClient;
    private static final String PORTFOLIO_NOT_FOUND_MESSAGE = "Portfolio not found with id: ";

    public InstrumentService(InstrumentRepository instrumentRepository, PortfolioRepository portfolioRepository, TwelveDataClient twelveDataClient) {
        this.instrumentRepository = instrumentRepository;
        this.portfolioRepository =  portfolioRepository;
        this.twelveDataClient = twelveDataClient;
    }

    @Transactional
    public InstrumentResponse create(InstrumentRequest req, Long portfolioId) {
        Portfolio portfolio = checkIfPortfolioExistsOrElseThrowNotFoundException(portfolioId);
        String name = normalize(req.name());
        String symbol = normalize(req.symbol().toUpperCase());
        String type = normalize(req.type());
        String exchange = normalize(req.exchange().toUpperCase());
        return instrumentRepository.findByPortfolioAndSymbolIgnoreCaseAndExchangeIgnoreCase(portfolio, symbol, exchange)
                .map(this::toResponse)
                .orElseGet(() -> {
                    Instrument instrument = buildInstrument(name, symbol, type, exchange, portfolio);
                    return toResponse(instrumentRepository.save(instrument));
                });
    }

    @Transactional
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
        return new SearchResponse<>(dtoList, dtoList.size());
    }

    public SearchResponse<InstrumentResponse> findAllByPortfolioId(Long portfolioId) {
        Portfolio portfolio = checkIfPortfolioExistsOrElseThrowNotFoundException(portfolioId);
        List<Instrument> instruments = instrumentRepository.findByPortfolio(portfolio)
                .orElse(Collections.emptyList());
        List<InstrumentResponse> resp = instruments
                .stream()
                .map(this::toResponse)
                .toList();
        return new SearchResponse<>(resp, instruments.size());
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

    private Portfolio checkIfPortfolioExistsOrElseThrowNotFoundException(Long portfolioId) {
        return portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> {
                    log.error("{}{}", PORTFOLIO_NOT_FOUND_MESSAGE, portfolioId);
                    return new NotFoundException(portfolioId, PORTFOLIO_NOT_FOUND_MESSAGE);
                });
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
        TwelveDataQuoteResponse quote = null;

        try {
            quote = twelveDataClient.getQuote(instrument.getSymbol());
        } catch (Exception e) {
            log.error(e.getMessage());
        }

        return new InstrumentResponse(
                instrument.getId(),
                instrument.getName(),
                instrument.getSymbol(),
                instrument.getType(),
                instrument.getExchange(),
                instrument.getPortfolio().getId(),
                quote != null ? quote.open() : null,
                quote != null ? quote.close() : null,
                quote != null ? quote.high() : null,
                quote != null ? quote.low() : null,
                quote != null ? quote.change() : null,
                quote != null ? quote.percentChange() : null
        );
    }
}
