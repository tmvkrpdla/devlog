package com.hoseong.devlog.tag;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface TagMapper {
    List<Tag> findAll();
    List<Tag> findForIssues(@Param("ids") List<Long> ids);
    int upsert(String name);
    Long findId(String name);
    int link(@Param("issueId") long issueId, @Param("tagId") long tagId);
    int unlink(long issueId);
}
