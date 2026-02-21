# 📈 Investing App

Fullstack web application for managing investment portfolios.

This project is designed as a scalable and production-ready architecture using modern backend and frontend technologies.

---

## 🧱 Architecture

Monorepo structure:

```
investing-app
 ├── investing-backend   (Spring Boot REST API)
 └── investing-frontend  (Angular SPA)
```

The backend exposes a REST API consumed by the Angular frontend.

---

## 🚀 Tech Stack

### Backend
- Java 17
- Spring Boot
- Spring Data JPA
- H2 (development database)
- Maven
- Global Exception Handling
- DTO pattern
- Service layer validation (duplicate portfolio protection)

### Frontend
- Angular
- TypeScript
- RxJS
- Angular Router
- Proxy configuration for backend communication

---

## 📌 Features

- Create investment portfolios
- Portfolio type validation
- Duplicate portfolio prevention
- Clean layered architecture (Controller → Service → Repository → Domain)
- Global exception handling
- REST API ready for production database integration

---

## ⚙️ How to Run

### ▶ Backend

```bash
cd investing-backend
./mvnw spring-boot:run
```

Backend runs on:

http://localhost:8080

---

### ▶ Frontend

```bash
cd investing-frontend
npm install
ng serve
```

Frontend runs on:

http://localhost:4200

---

## 🔮 Roadmap

- [ ] PostgreSQL integration
- [ ] Authentication (JWT)
- [ ] Docker support
- [ ] Unit & integration tests
- [ ] Deployment (Render / Railway / VPS)
- [ ] Portfolio asset tracking
- [ ] Real-time market data integration

---

## 👨‍💻 Author

David Muns  
Java & Angular Fullstack Developer  

Building scalable financial applications.