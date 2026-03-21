package com.davidmuns.investing.dto;

import com.davidmuns.investing.entity.PortfolioType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

//import javax.validation.constraints.*;


public class CreatePortfolioRequest {

    @NotBlank
    @Size(max = 80)
    private String name;

    @NotNull
    private PortfolioType type;

    public CreatePortfolioRequest() {
    }

    public CreatePortfolioRequest(String name, PortfolioType type) {
        this.name = name;
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public PortfolioType getType() {
        return type;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setType(PortfolioType type) {
        this.type = type;
    }
}