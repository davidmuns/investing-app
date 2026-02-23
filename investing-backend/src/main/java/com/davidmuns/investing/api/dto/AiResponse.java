package com.davidmuns.investing.api.dto;

import java.util.Map;

public record AiResponse(
        boolean ok,
        String answer,
        Integer providerStatus,
        Map<String, Object> providerError
) {}