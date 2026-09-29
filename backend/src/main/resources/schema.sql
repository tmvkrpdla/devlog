CREATE TABLE IF NOT EXISTS troubleshooting (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    symptom TEXT NOT NULL,
    cause TEXT NOT NULL,
    solution TEXT NOT NULL,
    code_snippet TEXT NOT NULL,
    tech_stack VARCHAR(200) NOT NULL DEFAULT '',
    project VARCHAR(100) NOT NULL DEFAULT '',
    prevention TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_troubleshooting_updated (updated_at, id),
    INDEX idx_troubleshooting_project (project)
);
CREATE TABLE IF NOT EXISTS tag (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS troubleshooting_tag (
    troubleshooting_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (troubleshooting_id, tag_id),
    CONSTRAINT fk_tt_troubleshooting FOREIGN KEY (troubleshooting_id) REFERENCES troubleshooting(id) ON DELETE CASCADE,
    CONSTRAINT fk_tt_tag FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE
);
