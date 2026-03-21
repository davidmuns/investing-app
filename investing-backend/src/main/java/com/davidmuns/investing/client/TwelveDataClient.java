package com.davidmuns.investing.client;

import com.davidmuns.investing.dto.TwelveDataQuoteResponse;
import com.davidmuns.investing.dto.TwelveDataSymbolSearchResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class TwelveDataClient {

    private final WebClient webClient;
    private final String apiKey;

    public TwelveDataClient(
            WebClient twelveDataWebClient,
            @Value("${twelvedata.api-key}") String apiKey
    ) {
        this.webClient = twelveDataWebClient;
        this.apiKey = apiKey;
    }

    public TwelveDataSymbolSearchResponse searchSymbols(String query) {
        TwelveDataSymbolSearchResponse response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/symbol_search")
                        .queryParam("symbol", query)
                        .queryParam("outputsize", 20)
                        .queryParam("apikey", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(TwelveDataSymbolSearchResponse.class)
                .block();

        if (response != null) {
            int count = response.data() != null ? response.data().size() : 0;
            response = new TwelveDataSymbolSearchResponse(
                    response.data(),
                    response.status(),
                    count
            );
        }
        return response;
    }
    public TwelveDataQuoteResponse getQuote(String query) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/quote")
                        .queryParam("symbol", query)
                        .queryParam("apikey", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(TwelveDataQuoteResponse.class)
                .block();
    }
}