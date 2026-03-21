package com.davidmuns.investing.dto;

import java.util.List;

public record SearchResponse<T>(
        List<T> data,
        int count,
        String status
) {
    public SearchResponse(List<T> data, int count) {
        this(data, count, null);
    }
}
