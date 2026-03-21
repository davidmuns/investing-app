package com.davidmuns.investing.dto;
import lombok.Data;
import java.util.List;

@Data
public class SearchResponse<T> {
    private List<T> data;
    private int count;
    private String status;

    public SearchResponse() {
    }

    public SearchResponse(List<T> data, int count) {
        this.data = data;
        this.count = count;
    }

    public SearchResponse(List<T> data, int count, String status) {
        this.data = data;
        this.count = count;
        this.status = status;
    }
}
