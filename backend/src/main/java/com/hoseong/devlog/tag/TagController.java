package com.hoseong.devlog.tag;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {
    private final TagMapper mapper;
    public TagController(TagMapper mapper) { this.mapper = mapper; }
    @GetMapping public List<Tag> list() { return mapper.findAll(); }
}
