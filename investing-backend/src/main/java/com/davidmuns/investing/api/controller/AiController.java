package com.davidmuns.investing.api.controller;

import com.davidmuns.investing.api.dto.AiResponse;
import com.davidmuns.investing.service.AiService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    // DTO de request (simple y robusto)
    public static class AiRequest {
        public String prompt;
    }

    @GetMapping("/ping")
    public String ping() {
        return "ok";
    }

    @PostMapping(
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public AiResponse ask(@RequestBody AiRequest req) {
        String prompt = (req == null || req.prompt == null) ? "" : req.prompt;
        String answer = aiService.ask(prompt);
        return new AiResponse(true, answer, null, null);
    }
}