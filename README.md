# DevOps Web App 🚀

This project is a simple Node.js web application built with Express, containerized with Docker and deployed to a local Kubernetes cluster using k3d.

## 🔧 Tech Stack

- Node.js
- Express
- Docker
- Kubernetes (k3d)
- Jest (Testing)
- Supertest (API Testing)

---

## 📦 Features

- REST API with Express
- Endpoint `/` → returns a welcome message
- Endpoint `/users` → returns a JSON list of users
- Automated tests for:
  - Successful requests
  - Error handling (404)

---

## 🧪 Run Tests

```bash
npx jest
