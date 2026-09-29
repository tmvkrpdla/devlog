# DevLog

HOSEONG LEE의 개발자용 트러블슈팅 기록·검색 웹앱 MVP.

## 이 PC에서 바로 실행

1. `start.cmd`를 더블클릭합니다.
2. <http://127.0.0.1:5173> 에 접속합니다.
3. 종료하려면 `stop.cmd`를 더블클릭합니다. 기록은 삭제되지 않습니다.

현재 이 폴더의 `.local`에 Java 17 및 MariaDB를 ZIP 방식으로 설치했습니다. Windows 서비스 등록이나 기존 Java 11의 전역 설정 변경은 하지 않았습니다. 재부팅 후에는 `start.cmd`로 다시 실행합니다. Node.js는 이 PC에 설치된 버전을 사용합니다.

| 구성 | 주소 / 위치 |
|---|---|
| 웹앱 | http://127.0.0.1:5173 |
| 백엔드 | http://127.0.0.1:8080 |
| Swagger UI | http://127.0.0.1:8080/swagger-ui/index.html |
| OpenAPI JSON | http://127.0.0.1:8080/v3/api-docs |
| MariaDB | 127.0.0.1:3307 / DB `devlog` |
| 개발용 DB 사용자 | `devlog` / `devlog_local` |
| DB 데이터 | `.local/data` (이 폴더를 지우면 기록도 사라짐) |
| 서버 로그 | `.local/logs` |

로그인이 없는 개인 로컬 개발 버전이므로 서버는 127.0.0.1에만 바인딩합니다. DB 비밀번호는 로컬 개발용입니다. `.local/root.cnf`는 초기화 시 생성한 관리자 접속정보이므로 공유하지 않습니다. `.local`은 Git에서 제외됩니다.

## IntelliJ에서 열기

1. IntelliJ → **Open** → 이 프로젝트의 `backend` 폴더를 선택합니다.
2. Gradle 프로젝트로 열고 동기화를 기다립니다.
3. **File → Project Structure → SDKs → Add JDK**에서 다음 폴더를 선택합니다.
   - `.local/jdk-17.0.20.1+1` (프로젝트 최상위 기준)
4. Project SDK 및 **Settings → Build, Execution, Deployment → Build Tools → Gradle → Gradle JVM**을 해당 Java 17로 지정합니다.
5. `com.hoseong.devlog.DevlogApplication`을 실행합니다.

전체 파일을 함께 보려면 최상위 `devlog`를 열고 `backend/build.gradle`을 Gradle 프로젝트로 연결해도 됩니다. IntelliJ에서 백엔드를 실행하기 전에는 `start.cmd`가 실행한 백엔드를 종료해야 8080 포트가 충돌하지 않습니다. `stop.cmd`로 모두 종료한 후 아래 개발 모드 방법으로 DB만 켤 수 있습니다.

## 개발 모드 (PowerShell, 프로젝트 루트 기준)

### MariaDB만 실행

```powershell
$db = (Resolve-Path '.local/mariadb-11.4.8-winx64/bin/mariadbd.exe').Path
$ini = (Resolve-Path '.local/data/my.ini').Path
Start-Process -FilePath $db -ArgumentList ('--defaults-file="' + $ini + '"') -WindowStyle Hidden
```

### 백엔드

```powershell
$env:JAVA_HOME = (Resolve-Path '.local/jdk-17.0.20.1+1').Path
cd backend
.\gradlew.bat bootRun
```

### 프론트엔드 (새 터미널)

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

PowerShell 실행 정책에 영향을 받지 않도록 `npm` 대신 `npm.cmd`를 사용합니다. 프론트엔드는 Vite 프록시로 `/api`를 백엔드에 전달합니다. 개발 시 React 변경은 자동 반영되지만 Java 변경은 백엔드를 재시작해야 합니다.

`start.cmd`는 이미 빌드된 JAR를 실행합니다. Java 소스를 수정한 뒤 이 실행 파일을 사용하려면 `stop.cmd`로 종료하고 `backend`에서 `.\gradlew.bat bootJar`로 다시 빌드하세요.

## 다른 PC에서 준비하기

Java 17 JDK, Node.js 22.12 이상 또는 24, MariaDB 11.4를 설치합니다. 이 저장소의 `.local`은 배포/버전관리 대상이 아니므로 다른 PC에서는 아래와 같이 직접 실행 환경을 준비합니다.

1. MariaDB 관리자 연결에서 `database/init.sql` 실행 (DB·앱 사용자 생성).
2. MariaDB가 기본 3306 포트라면 백엔드 실행 환경에 `DB_URL=jdbc:mariadb://127.0.0.1:3306/devlog` 설정.
3. `JAVA_HOME`을 Java 17 설치 폴더로 지정.
4. `backend`: `.\gradlew.bat bootRun`
5. `frontend`: `npm.cmd ci`, `npm.cmd run dev`

이 PC용 `start.cmd`는 `.local` 설치 구조를 전제로 합니다. 다른 PC에서는 위 개발 모드 명령을 사용하세요. Gradle Wrapper와 npm 잠금 파일은 포함되어 있습니다.

## 구조

```text
backend/
  build.gradle, gradlew, gradlew.bat, gradle/wrapper/
  src/main/java/com/hoseong/devlog/
    DevlogApplication.java
    troubleshooting/  Controller, Service, Mapper, Request, Model
    tag/              Controller, Mapper, Model
    common/           API 예외 처리
  src/main/resources/
    application.yml
    schema.sql
    mapper/troubleshooting/, mapper/tag/
  src/test/java/com/hoseong/devlog/TroubleshootingApiTest.java
frontend/
  src/main.jsx, src/api.js, src/style.css
  vite.config.js, package.json, package-lock.json
database/init.sql
scripts/start.ps1, stop.ps1
start.cmd, stop.cmd
```

Spring Boot 3.5.16 / Java 17 / Gradle 8.14.3 / MyBatis Starter 3.0.5 / MariaDB 11.4.8 / springdoc 2.8.17 / React 19 / Vite 7.

`@Mapper` 인터페이스와 XML SQL을 사용합니다. MyBatis의 `map-underscore-to-camel-case`가 DB 컬럼과 Java 필드를 연결합니다. 생성·수정·태그 연결은 하나의 트랜잭션이며 기록 삭제 시 연결 테이블은 외래키로 삭제됩니다. 태그 사전은 재사용을 위해 남습니다.

## API

| 메서드 | 경로 | 기능 |
|---|---|---|
| GET | `/api/troubleshootings` | 목록, 검색, 필터, 페이지 |
| GET | `/api/troubleshootings/{id}` | 상세 |
| POST | `/api/troubleshootings` | 생성 (201) |
| PUT | `/api/troubleshootings/{id}` | 전체 수정 |
| DELETE | `/api/troubleshootings/{id}` | 삭제 (204) |
| GET | `/api/tags` | 태그 목록 |

검색 파라미터: `keyword`, `tag`, `project`, `techStack`, `page`(0부터), `size`(기본 20, 최대 100).

`keyword`는 제목·증상·원인·해결·코드를 대상으로 입력 문자열을 부분 일치 검색합니다. 공백으로 단어를 분리하는 전문검색은 아직 아닙니다. `%`, `_`는 검색 와일드카드가 아닌 문자로 처리됩니다. 프로젝트는 정확히 일치, 기술 스택은 부분 일치 필터입니다. SQL은 MyBatis 바인딩 파라미터를 사용합니다.

```json
{
  "title": "jqGrid 검색 시 페이지 초기화",
  "symptom": "검색 조건 변경 후에도 page=2 유지",
  "cause": "페이지 초기화 누락",
  "solution": "검색 시 page=1 설정",
  "codeSnippet": "grid.setPage(1);",
  "techStack": "jqGrid / jQuery",
  "project": "업무 시스템",
  "prevention": "검색 조건 변경 테스트 추가",
  "tags": ["jqgrid", "paging"]
}
```

제목·증상·해결은 필수입니다. 태그는 소문자로 정규화하며 최대 20개, 개별 50자입니다. 오류는 `{ "message": "..." }` 형태입니다. 입력 오류는 400, 없는 기록은 404입니다.

## 검증

```powershell
# Java 17 JAVA_HOME 지정 후
cd backend
.\gradlew.bat test bootJar
# 별도 터미널
cd frontend
npm.cmd run build
```

자동 테스트는 H2 MySQL 호환 모드에서 CRUD, 검색 문자 이스케이프, 태그 중복 제거, 잘못된 입력, 404, OpenAPI를 확인합니다. 이 PC에서는 실제 MariaDB로도 CRUD·검색·태그 정규화·삭제를 확인했습니다. 브라우저에서 예시 기록 등록·수정을 확인했으며 예시 1건을 남겼습니다.

초기 테이블은 서버 시작 시 `schema.sql`로 생성합니다. `CREATE TABLE IF NOT EXISTS`는 기존 스키마를 변경하지 않으므로 추후 컬럼 변경에는 별도 마이그레이션이 필요합니다. 현재 검색은 개인 데이터 규모에 맞춘 LIKE 검색입니다.

## 다음 단계

이번 범위는 로컬 MVP와 Swagger까지입니다. 이후 회원별 기록 접근 제어와 로그인/JWT, Docker Compose, Nginx, AI 기능을 순서대로 추가할 수 있습니다.
