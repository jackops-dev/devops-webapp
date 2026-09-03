# DevOps Automation Lab

A hands-on DevOps learning project that demonstrates containerized application deployment, service health checks and basic infrastructure automation.

## Architecture

```text
Client
  |
  v
Nginx :8083
  |
  v
Node.js Backend :3000
  |
  v
PostgreSQL :5432
```

The application runs as a Docker Compose stack.

Only Nginx is exposed to the host. The backend and database communicate internally through the Docker network.

## Tech Stack

- Linux
- Docker
- Docker Compose
- Nginx
- Node.js
- PostgreSQL
- Python
- Ansible
- Git
- GitHub
- GitHub Actions

## Project Structure

```text
.
├── ansible/
│   ├── inventory.ini
│   └── playbook.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── nginx/
│   └── default.conf
├── scripts/
│   └── check_services.py
├── compose.yaml
└── README.md
```

## Running the Application

Start the Docker Compose stack:

```bash
docker compose up -d
```

Check the running containers:

```bash
docker compose ps
```

The application is exposed through Nginx on:

```text
http://127.0.0.1:8083
```

The backend and PostgreSQL database are only reachable inside the Docker network.

## Health Check

A Python script checks the backend health endpoint and the customer API:

```bash
python3 scripts/check_services.py
```

A successful check returns:

```text
[OK] Backend Health erreichbar
[OK] Kunden API erreichbar
[GESAMT] Alle Services erreichbar
```

The script returns exit code `0` when all checks succeed and a non-zero exit code when a service is unavailable.

This makes the script suitable for local validation as well as automated CI/CD workflows.

## Ansible Automation

An Ansible playbook is included to automate the local deployment workflow.

The playbook:

- ensures that the Docker service is running
- verifies that the project directory exists
- starts the Docker Compose stack
- executes the Python health check
- fails if the application health check is unsuccessful

Run the playbook with:

```bash
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml --ask-become-pass
```

Ansible can also validate the playbook syntax without executing it:

```bash
ansible-playbook \
  -i ansible/inventory.ini \
  ansible/playbook.yml \
  --syntax-check
```

## CI/CD with GitHub Actions

This project uses GitHub Actions to automate validation of the application and deployment workflow.

The CI/CD pipeline is designed around the existing Docker Compose stack, Python health check and Ansible automation.

### Pipeline Flow

```text
Git Push / Pull Request
        |
        v
GitHub Actions Runner
        |
        v
Validate project files
        |
        v
Start Docker Compose stack
        |
        v
Run Python health check
        |
        v
Run Ansible deployment validation
        |
        v
Pipeline succeeds only if all checks pass
```

### Automated Checks

The pipeline is designed to:

- check out the repository
- validate the Docker Compose configuration
- start the application stack with Docker Compose
- execute the Python service health check
- verify that the backend and customer API are reachable
- validate the Ansible playbook syntax

### Health Check Integration

The same health check used locally can also be executed inside the CI pipeline:

```bash
python3 scripts/check_services.py
```

If one of the required services cannot be reached, the script returns a non-zero exit code and the pipeline fails automatically.

### Ansible Validation

The Ansible configuration can be validated in CI with:

```bash
ansible-playbook \
  -i ansible/inventory.ini \
  ansible/playbook.yml \
  --syntax-check
```

This helps detect invalid YAML or Ansible configuration before deployment.

### GitHub Actions Workflow

The workflow configuration will be stored in:

```text
.github/workflows/ci.yml
```

The goal of the pipeline is to make every change reproducible and automatically verify that the application can still be started and reached successfully.

## Current Focus

This project is being developed as a practical DevOps portfolio project with a focus on:

- containerization
- service networking
- health monitoring
- automation
- reproducible deployments
- CI/CD