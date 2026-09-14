# DevOps Automation Lab

A hands-on DevOps learning project that demonstrates containerized application deployment, service networking, PostgreSQL persistence, health checks, infrastructure automation and CI/CD workflows.

The project also includes a small backend application for employee, shift, working-time and security logbook management.

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

Only Nginx is exposed to the host. The backend and PostgreSQL database communicate internally through the Docker network.

## Application Features

The Node.js backend currently provides REST-style endpoints for:

- customer management
- employee management
- security logbook entries
- fixed 12-hour day and night shifts
- employee working-time tracking
- prevention of duplicate active work sessions
- validation that work sessions start only during an active shift

Working-time records are linked to employees and shifts through PostgreSQL foreign-key relationships.

The current shift model uses:

```text
Day shift:   06:00 - 18:00
Night shift: 18:00 - 06:00
```

Shift records are stored separately from employee working-time records.

This allows multiple employees to work different parts of the same shift, for example when another employee takes over during an ongoing shift.

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
├── .github/
│   └── workflows/
│       └── ci.yml
├── ansible/
│   ├── inventory.ini
│   └── playbook.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── db/
│   ├── migrations/
│   │   └── 001_add_shifts.sql
│   └── init.sql
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

To rebuild the backend image after code changes:

```bash
docker compose up -d --build
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

This makes the script suitable for both local validation and automated CI/CD workflows.

## Database Schema

The PostgreSQL schema is initialized from:

```text
db/init.sql
```

The current database contains the following main tables:

```text
kunden
mitarbeiter
wachbuch_eintraege
schichten
arbeitszeiten
```

The `arbeitszeiten` table references both employees and shifts.

The `schichten` table enforces:

- valid shift types (`Tag` or `Nacht`)
- shift end after shift start
- exactly 12 hours per shift
- unique shift start times

The initial schema allows a clean PostgreSQL database to be created automatically when the Docker volume does not yet exist.

## Database Migrations

Schema changes are tracked through SQL migration files.

Current migration:

```text
db/migrations/001_add_shifts.sql
```

The migration adds the shift model and links existing working-time records to shifts through a foreign key.

This separates initial database creation from later schema evolution.

## Example Shift Creation

A new day shift can be created with:

```bash
curl -X POST http://127.0.0.1:8083/schichten \
  -H "Content-Type: application/json" \
  -d '{
    "schichtart": "Tag",
    "beginn": "2026-09-14T06:00:00",
    "ende": "2026-09-14T18:00:00"
  }'
```

A successful response contains the newly created shift record.

## Starting Working Time

An employee can start a working-time session for an active shift with:

```bash
curl -X POST http://127.0.0.1:8083/arbeitszeiten/start \
  -H "Content-Type: application/json" \
  -d '{
    "mitarbeiter_id": 1,
    "schicht_id": 1
  }'
```

Before creating the working-time record, the backend verifies that:

- the required IDs are present
- the shift exists
- the shift is currently active
- the employee does not already have an open working-time session

If the validation succeeds, the current timestamp is stored as `dienstbeginn`.

## Ending Working Time

An active working-time session can be ended with:

```bash
curl -X POST http://127.0.0.1:8083/arbeitszeiten/ende \
  -H "Content-Type: application/json" \
  -d '{
    "mitarbeiter_id": 1
  }'
```

The backend updates the employee's currently open working-time record and stores the current timestamp as `dienstende`.

## Security Logbook

The backend also contains a security logbook model.

Logbook entries reference employees and contain:

- timestamp
- category
- free-text entry

This is intended as a practical example of how operational data can be stored through a REST-style backend.

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
ansible-playbook \
  -i ansible/inventory.ini \
  ansible/playbook.yml \
  --ask-become-pass
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

## Health Check Integration

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

## Database Initialization in CI

GitHub Actions starts the application in a fresh environment without any existing Docker volumes.

The PostgreSQL container therefore initializes the required database schema automatically from:

```text
db/init.sql
```

This ensures that the application can be started reproducibly on a clean system instead of depending on an existing local database volume.

## Ansible Validation

The workflow validates the Ansible playbook with:

```bash
ansible-playbook \
  -i ansible/inventory.ini \
  ansible/playbook.yml \
  --syntax-check
```

This detects invalid YAML or Ansible configuration before changes are considered successful.

## Workflow Configuration

The GitHub Actions workflow is stored in:

```text
.github/workflows/ci.yml
```

The pipeline has successfully completed on a clean GitHub-hosted runner, confirming that the Docker Compose stack, database initialization, Python health check and Ansible configuration work together in an automated environment.

## Current Focus

This project is being developed as a practical DevOps portfolio project with a focus on:

- containerization
- service networking
- PostgreSQL persistence
- backend service integration
- health monitoring
- infrastructure automation
- reproducible deployments
- database migrations
- CI/CD
- gradual DevSecOps improvements
