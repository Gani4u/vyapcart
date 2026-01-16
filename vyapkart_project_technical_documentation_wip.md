# Vyapkart – Technical Documentation (Work in Progress)

## 1. Project Overview
**Vyapkart** is a hybrid marketplace platform combining:
- Local sellers (like Amazon Marketplace)
- Fulfilled-by-Vyapkart logistics (Amazon + Dunzo model)

The goal is to build a **production-grade, scalable backend-first system**, starting as a **monolith** and evolving into services if needed.

---

## 2. Development Philosophy
- Build MVP first, optimize later
- Production-like setup even in local
- Avoid vendor lock-in
- Cloud-cost conscious (Free Tier friendly)
- Clear separation of infra, backend, and docs

---

## 3. Technology Stack (Finalized So Far)

### Backend
- **Java 17**
- **Spring Boot 4.x** (Monolith initially)
- Spring MVC
- Spring Data JPA
- Spring Security (planned)
- Spring Validation

### Authentication (Planned)
- JWT-based authentication
- OTP support (email/SMS later)

### Database (Final Decision)
- **MySQL 8.x**
- Same DB engine for:
  - Local development
  - CI
  - Production

> Note: Oracle Autonomous DB was evaluated and intentionally avoided due to lack of local parity and vendor lock-in.

### Cache
- Redis
  - Used for caching, OTPs, sessions

### Infrastructure
- Oracle Cloud Free Tier
  - VM.Standard.A1.Flex
  - 2 OCPU, 8 GB RAM
  - Ubuntu 22.04

### Containers
- Docker
- Docker Compose (infra only)

### Reverse Proxy (Planned)
- Nginx

### CI/CD (Planned)
- GitHub Actions

---

## 4. Repository Structure (Current)

```
Vyapkart/
│
├── backend/               # Spring Boot application
│   ├── src/main/java
│   ├── src/main/resources
│   │   └── application.properties
│   └── pom.xml
│
├── infra/
│   └── docker/            # Docker compose for DBs (Postgres/Redis initially)
│
└── docs/                  # (Planned) Architecture & dev docs
```

---

## 5. Database Journey & Decisions

### Initial Setup (Exploration)
- PostgreSQL + Redis via Docker Compose
- Verified:
  - PostgreSQL container health
  - Redis connectivity
  - UUID extension creation in Postgres

### Decision Change
- PostgreSQL dropped in favor of **MySQL**

#### Reasoning:
- Better tooling familiarity
- Easier cloud portability
- Identical local ↔ cloud behavior
- No vendor lock-in

---

## 6. Current Local Database Setup (MySQL)

- MySQL installed locally
- Database created manually using UI tools (MySQL Workbench / pgAdmin alternative)
- Credentials configured in Spring Boot

### application.properties (Current)

```properties
server.port=8080

spring.datasource.url=jdbc:mysql://localhost:3306/vyapcart?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=********
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Flyway (temporarily disabled)
spring.flyway.enabled=false

spring.data.redis.host=localhost
spring.data.redis.port=6379
```

---

## 7. Flyway Status

- Flyway dependency was added
- Flyway execution **temporarily disabled**

### Reason
- MySQL version compatibility issues
- Schema still evolving

> Flyway will be re-enabled once schema stabilizes.

---

## 8. Backend Status

- Spring Boot application starts on **port 8080**
- Tomcat initialized successfully
- MySQL connection established via HikariCP
- Redis configured (local)

No domain entities or repositories created yet.

---

## 9. Git & Collaboration Setup

### Repository Strategy
- **Single monorepo** (recommended)
  - backend
  - infra
  - docs

### Reason
- Easier coordination
- Atomic commits
- Shared visibility

### GitHub Notes
- Public repository → **FREE**
- Unlimited collaborators on public repos
- No cost impact

### Current Issue
- Push failed due to permission error (403)
- Indicates repo ownership or access mismatch

---

## 10. Known Issues & Fixes

### Issue: Flyway error – Unsupported Database MySQL 9.0
- Root cause: MySQL 9.x preview not supported by Flyway
- Resolution:
  - Disable Flyway OR
  - Downgrade to MySQL 8.0

---

## 11. Planned Next Steps

### Short-Term
1. Finalize MySQL 8.x
2. Re-enable Flyway with clean migration setup
3. Create base schema:
   - users
   - roles
   - sellers
   - products
4. Setup GitHub repo correctly
5. Add README.md

### Mid-Term
- Authentication module
- Redis caching
- Role-based access
- Dockerize backend

### Long-Term
- CI/CD
- Nginx reverse proxy
- Horizontal scaling

---

## 12. Core Architectural Principles

- Same stack everywhere (local → prod)
- Database portability first
- Infrastructure as code
- Clear documentation for new developers

---

## 13. How New Developers Should Start

1. Clone repo
2. Install Java 17
3. Install MySQL 8
4. Create `vyapcart` database
5. Update `application.properties`
6. Run backend on port 8080

---

## 14. Status Summary

| Area | Status |
|----|----|
| Backend Boot | ✅ Running |
| Database | ✅ MySQL Local |
| Redis | ✅ Local |
| Flyway | ⏸️ Disabled |
| Docker | ⏸️ Deferred |
| GitHub | ⚠️ Access Fix Needed |

---

**Document Owner:** Vyapkart Core Team

**Last Updated:** Jan 2026

Node Version - v20.20.0
npm Verison - 10.9.3

Intsall JDK 17 
Install MySQL Workbench of 8 version
install the React Native CLI Globally - npm install -g react-native-cli (Inside the windows powershell where user is present however it will be installed globally)

