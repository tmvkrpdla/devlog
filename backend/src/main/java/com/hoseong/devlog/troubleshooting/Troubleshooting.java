package com.hoseong.devlog.troubleshooting;

import com.hoseong.devlog.tag.Tag;

import java.time.LocalDateTime;
import java.util.List;

public class Troubleshooting {
    public Long id;
    public String title;
    public String symptom;
    public String cause;
    public String solution;
    public String codeSnippet;
    public String techStack;
    public String project;
    public String prevention;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
    public List<Tag> tags = List.of();
}
