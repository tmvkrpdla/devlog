package com.hoseong.devlog.troubleshooting;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/troubleshootings")
public class TroubleshootingController {
    private final TroubleshootingService service;

    public TroubleshootingController(TroubleshootingService service) {
        this.service = service;
    }

    @GetMapping
    public TroubleshootingService.Page list(
            @RequestParam(defaultValue = "") @Size(max = 200) String keyword,
            @RequestParam(defaultValue = "") @Size(max = 50) String tag,
            @RequestParam(defaultValue = "") @Size(max = 100) String project,
            @RequestParam(defaultValue = "") @Size(max = 200) String techStack,
            @RequestParam(defaultValue = "0") @Min(0) @Max(1000000) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return service.list(keyword, tag, project, techStack, page, size);
    }

    @GetMapping("/{id}")
    public Troubleshooting get(@PathVariable @Positive long id) {
        return service.get(id);
    }

    @PostMapping
    public ResponseEntity<Troubleshooting> create(@Valid @RequestBody TroubleshootingRequest request) {
        var item = service.create(request);
        return ResponseEntity.created(URI.create("/api/troubleshootings/" + item.id)).body(item);
    }

    @PutMapping("/{id}")
    public Troubleshooting update(@PathVariable @Positive long id, @Valid @RequestBody TroubleshootingRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable @Positive long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
