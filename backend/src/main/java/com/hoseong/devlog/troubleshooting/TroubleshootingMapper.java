package com.hoseong.devlog.troubleshooting;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface TroubleshootingMapper {
    List<Troubleshooting> findAll(@Param("keyword") String keyword, @Param("tag") String tag,
        @Param("project") String project, @Param("techStack") String techStack,
        @Param("limit") int limit, @Param("offset") int offset);
    long count(@Param("keyword") String keyword, @Param("tag") String tag,
        @Param("project") String project, @Param("techStack") String techStack);
    Troubleshooting findById(long id);
    int insert(Troubleshooting item);
    int update(Troubleshooting item);
    int delete(long id);
}
