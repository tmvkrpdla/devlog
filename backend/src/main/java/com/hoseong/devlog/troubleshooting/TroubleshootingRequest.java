package com.hoseong.devlog.troubleshooting;

import jakarta.validation.constraints.*;
import java.util.List;

public record TroubleshootingRequest(
    @NotBlank @Size(max=200) String title,
    @NotBlank @Size(max=10000) String symptom,
    @Size(max=10000) String cause,
    @NotBlank @Size(max=10000) String solution,
    @Size(max=10000) String codeSnippet,
    @Size(max=200) String techStack,
    @Size(max=100) String project,
    @Size(max=10000) String prevention,
    @Size(max=20) List<@NotBlank @Size(max=50) String> tags
) {}
