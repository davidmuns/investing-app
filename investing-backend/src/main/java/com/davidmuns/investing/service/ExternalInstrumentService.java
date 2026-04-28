package com.davidmuns.investing.service;

import com.davidmuns.investing.client.TwelveDataClient;
import com.davidmuns.investing.dto.InstrumentResponse;
import com.davidmuns.investing.dto.SearchResponse;
import com.davidmuns.investing.dto.TwelveDataQuoteResponse;
import com.davidmuns.investing.dto.TwelveDataSymbolSearchResponse;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExternalInstrumentService {

    private final TwelveDataClient twelveDataClient;

    public ExternalInstrumentService(TwelveDataClient twelveDataClient) {
        this.twelveDataClient = twelveDataClient;
    }

    public SearchResponse<InstrumentResponse> search(String query) {
        TwelveDataSymbolSearchResponse response = twelveDataClient.searchSymbols(query);
        List<InstrumentResponse> instruments = response.data().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return new SearchResponse<InstrumentResponse>(instruments, instruments.size(), response.status());
    }
    public TwelveDataQuoteResponse getQuote(String query) {
        return twelveDataClient.getQuote(query);
    }

    public List<TwelveDataQuoteResponse> getQuotes(List<String> symbols) {
        return twelveDataClient.getQuotes(symbols);
    }

    private InstrumentResponse toResponse(TwelveDataSymbolSearchResponse.Item item) {
        return new InstrumentResponse(
                null,
                item.instrumentName(),
                item.symbol(),
                item.instrumentType(),
                item.exchange(),
                null
        );
    }
}