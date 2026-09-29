package com.hoseong.devlog;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.List;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:devlog;MODE=MySQL;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa", "spring.datasource.password="
})
@AutoConfigureMockMvc
@Transactional
class TroubleshootingApiTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Test void createSearchUpdateDeleteWithTags() throws Exception {
        var body = Map.of("title", "Mapper 오류", "symptom", "100% 실패", "cause", "중복 스캔", "solution", "패키지 분리", "project", "DevLog", "tags", List.of("Spring", "spring", "MyBatis"));
        var response = mvc.perform(post("/api/troubleshootings").contentType("application/json").content(json.writeValueAsString(body)))
            .andExpect(status().isCreated()).andExpect(jsonPath("$.tags.length()").value(2)).andReturn();
        long id = json.readTree(response.getResponse().getContentAsString()).get("id").asLong();
        mvc.perform(get("/api/troubleshootings").param("keyword", "100%").param("tag", "spring").param("project", "DevLog"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(1));
        mvc.perform(get("/api/troubleshootings").param("keyword", "100_"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(0));
        mvc.perform(put("/api/troubleshootings/"+id).contentType("application/json").content(json.writeValueAsString(Map.of("title","수정", "symptom","증상", "solution","해결", "tags",List.of("java")))))
            .andExpect(status().isOk()).andExpect(jsonPath("$.tags.length()").value(1)).andExpect(jsonPath("$.tags[0].name").value("java"));
        mvc.perform(delete("/api/troubleshootings/"+id)).andExpect(status().isNoContent());
        mvc.perform(get("/api/troubleshootings/"+id)).andExpect(status().isNotFound());
        mvc.perform(get("/api/troubleshootings").param("tag","java")).andExpect(jsonPath("$.total").value(0));
    }
    @Test void rejectInvalidRequests() throws Exception {
        mvc.perform(post("/api/troubleshootings").contentType("application/json").content("{}" )).andExpect(status().isBadRequest());
        mvc.perform(get("/api/troubleshootings").param("page","-1")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/troubleshootings").param("size","101")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/troubleshootings/999999")).andExpect(status().isNotFound());
    }
    @Test void openApiAvailable() throws Exception {
        mvc.perform(get("/v3/api-docs")).andExpect(status().isOk()).andExpect(jsonPath("$.openapi").exists());
    }
}
