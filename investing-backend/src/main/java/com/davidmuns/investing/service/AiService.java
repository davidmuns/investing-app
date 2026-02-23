package com.davidmuns.investing.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.Map;

@Service
public class AiService {

    private final RestClient openai;
    private final String model;

    public AiService(RestClient openAiRestClient,
                     @Value("${openai.model:gpt-4o-mini}") String model) {
        this.openai = openAiRestClient;
        this.model = model;
    }

    public String ask(String prompt) {
        JsonNode res = openai.post()
                .uri("/responses")
                .body(Map.of(
                        "model", model,
                        "input", prompt,
                        "temperature", 0.2
                ))
                .retrieve()
                .body(JsonNode.class);

        if (res == null) return "";

        JsonNode output = res.path("output");
        if (output.isArray()) {
            for (JsonNode item : output) {
                JsonNode content = item.path("content");
                if (content.isArray()) {
                    for (JsonNode c : content) {
                        if (c.hasNonNull("text")) return c.get("text").asText();
                    }
                }
            }
        }
        return res.toString();
    }
}