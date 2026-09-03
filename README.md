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

This project uses GitHub Actions to automatically validate the application on every push and pull request to the `main` branch.

The current CI pipeline has been successfully tested on a fresh GitHub-hosted Ubuntu runner.

### Pipeline Flow

```text
Git Push / Pull Request
        |
        v
Checkout repository
        |
        v
Validate Docker Compose configuration
        |
        v
Build and start Docker Compose stack
        |
        v
Initialize PostgreSQL database
        |
        v
Run Python health check
        |
        v
Validate Ansible playbook syntax
        |
        v
CI pipeline succeeds
```

### Automated Checks

The workflow performs the following steps:

- checks out the repository
- validates the Docker Compose configuration
- builds and starts the complete Docker Compose stack
- initializes the PostgreSQL database using `db/init.sql`
- waits for the application to become available
- runs the Python health check
- verifies that the backend health endpoint and customer API are reachable
- installs Ansible on the GitHub Actions runner
- validates the Ansible playbook with `--syntax-check`
- prints container status information
- prints Docker Compose logs automatically if the workflow fails

### Health Check Integration

The CI pipeline uses the same Python health check that can be executed locally:

```bash
python3 scripts/check_services.py
```

A successful run verifies:

```text
[OK] Backend Health erreichbar
[OK] Kunden API erreichbar
[GESAMT] Alle Services erreichbar
```

The script returns exit code `0` when all required services are reachable.

If one of the checks fails, the script returns a non-zero exit code and the GitHub Actions workflow fails automatically.

### Database Initialization

GitHub Actions starts the application in a fresh environment without any existing Docker volumes.

The PostgreSQL container therefore initializes the required database schema automatically from:

```text
db/init.sql
```

This ensures that the application can be started reproducibly on a clean system instead of depending on an existing local database volume.

### Ansible Validation

The workflow validates the Ansible playbook with:

```bash
ansible-playbook \
  -i ansible/inventory.ini \
  ansible/playbook.yml \
  --syntax-check
```

This detects invalid YAML or Ansible configuration before changes are considered successful.

### Workflow Configuration

The GitHub Actions workflow is stored in:

```text
.github/workflows/ci.yml
```

The pipeline has successfully completed on a clean GitHub-hosted runner, confirming that the Docker Compose stack, database initialization, Python health check and Ansible configuration work together in an automated environment.

## Current Focus

This project is being developed as a practical DevOps portfolio project with a focus on:

- containerization
- service networking
- health monitoring
- automation
- reproducible deployments
- CI/CD