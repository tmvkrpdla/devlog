package com.hoseong.devlog.troubleshooting;

import com.hoseong.devlog.tag.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class TroubleshootingService {
    private final TroubleshootingMapper mapper;
    private final TagMapper tags;
    public TroubleshootingService(TroubleshootingMapper mapper, TagMapper tags) { this.mapper=mapper; this.tags=tags; }
    public record Page(List<Troubleshooting> items, long total, int page, int size) {}
    public Page list(String keyword, String tag, String project, String techStack, int page, int size) {
        var items = mapper.findAll(pattern(keyword), clean(tag), clean(project), pattern(techStack), size, page*size);
        attachTags(items);
        return new Page(items, mapper.count(pattern(keyword), clean(tag), clean(project), pattern(techStack)), page, size);
    }
    public Troubleshooting get(long id) {
        var item = mapper.findById(id);
        if(item == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "기록을 찾을 수 없습니다.");
        attachTags(List.of(item));
        return item;
    }
    @Transactional public Troubleshooting create(TroubleshootingRequest request) {
        var item = from(request); mapper.insert(item); replaceTags(item.id, request.tags()); return get(item.id);
    }
    @Transactional public Troubleshooting update(long id, TroubleshootingRequest request) {
        var item = from(request); item.id=id;
        if(mapper.update(item)==0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "기록을 찾을 수 없습니다.");
        replaceTags(id, request.tags()); return get(id);
    }
    @Transactional public void delete(long id) {
        if(mapper.delete(id)==0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "기록을 찾을 수 없습니다.");
    }
    private void replaceTags(long id, List<String> names) {
        tags.unlink(id);
        if(names == null) return;
        // Normalize case so Java deduplication and MariaDB's case-insensitive unique index agree.
        var normalized = names.stream().map(n -> n.strip().toLowerCase(Locale.ROOT)).distinct().sorted().toList();
        for(String name : normalized) { tags.upsert(name); tags.link(id, tags.findId(name)); }
    }
    private void attachTags(List<Troubleshooting> items) {
        if(items.isEmpty()) return;
        var grouped = tags.findForIssues(items.stream().map(i -> i.id).toList()).stream()
            .collect(Collectors.groupingBy(t -> t.troubleshootingId));
        items.forEach(i -> i.tags=grouped.getOrDefault(i.id, List.of()));
    }
    private static String clean(String s) { return s == null ? "" : s.strip(); }
    private static String pattern(String s) {
        return clean(s).replace("!", "!!").replace("%", "!%").replace("_", "!_");
    }
    private static Troubleshooting from(TroubleshootingRequest r) {
        var i = new Troubleshooting();
        i.title=clean(r.title()); i.symptom=clean(r.symptom()); i.cause=clean(r.cause());
        i.solution=clean(r.solution()); i.codeSnippet=r.codeSnippet()==null?"":r.codeSnippet();
        i.techStack=clean(r.techStack()); i.project=clean(r.project()); i.prevention=clean(r.prevention()); return i;
    }
}
