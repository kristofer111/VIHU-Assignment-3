[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/_SqhOSW2)
# Assignment 3 - Docker & GitHub Actions

Learn how to containerize an application with Docker and automate your development workflow with GitHub Actions. By the end of this assignment you will have a fully automated CI/CD pipeline that tests your code and builds a Docker image on every push.

**Group size:** 1 person

---

## Prerequisites

- Complete Week 4 in-class exercise (GitHub Actions)
- Complete Week 5 in-class exercise (Docker)
- [Bun](https://bun.sh/) version 1.3 or later installed
- [Docker](https://docs.docker.com/get-docker/) installed

## Setup

1. Select **"Use this Template"** to create your own repository
2. Run `bun install`
3. Run `bun run start` to verify the app runs at http://localhost:3000

## Commands

- `bun run start` - Start the server
- `bun run test` - Run test suite
- `bun run lint` - Run linter

---

## The Starter Project

This repository contains a simple Bun HTTP server (`src/index.ts`) with a few routes and a test file. Take a moment to read through the code before starting.

| File | Description |
|------|-------------|
| `src/index.ts` | HTTP server with `/`, `/health`, and `/version` routes |
| `src/index.test.ts` | Tests for the server routes |

---

## The Assignment

### Task 1: Dockerize the Application (Commit 1)

Create a `Dockerfile` and `.dockerignore` to containerize the application.

**1a. Create a `.dockerignore` file**

Add a `.dockerignore` file that excludes files that should not be part of the Docker image. Think about what files are unnecessary or harmful to include (e.g. `node_modules`, `.git`, etc.).

**1b. Create a `Dockerfile`**

Write a `Dockerfile` that:

1. Uses `oven/bun:latest` as the base image
2. Sets the working directory to `/app`
3. Copies dependency files (`package.json`, `bun.lockb`) first and installs dependencies (this takes advantage of Docker's layer caching)
4. Copies the rest of the application code
5. Exposes port 3000
6. Starts the server with `bun run start`

**1c. Build and run the container**

Verify your Dockerfile works by building and running it locally:

```bash
docker build -t assignment-3 .
docker run -p 3000:3000 assignment-3
```

Visit http://localhost:3000 and http://localhost:3000/health to confirm it works.

**1d. Add environment variable support**

The server reads the `PORT` environment variable. Verify you can override it:

```bash
docker run -p 8080:8080 -e PORT=8080 assignment-3
```

The app should now be available at http://localhost:8080.

**Commit your Dockerfile and .dockerignore with a descriptive message.**

---

### Task 2: Create a CI Pipeline with GitHub Actions (Commit 2)

Set up a GitHub Actions workflow that automatically runs your tests and linter on every push and pull request.

**2a. Create the workflow file**

Create `.github/workflows/ci.yml` with a workflow called `CI` that:

1. Triggers on `push` to all branches and on `pull_request` to `main`
2. Has a job called `test` that runs on `ubuntu-latest`
3. Uses `actions/checkout@v4` to check out the code
4. Uses `oven-sh/setup-bun@v2` to set up Bun
5. Installs dependencies with `bun install`
6. Runs the linter with `bun run lint`
7. Runs the tests with `bun run test`

**2b. Push and verify**

Push your changes to GitHub and go to the **Actions** tab in your repository to confirm the workflow runs successfully. You should see a green checkmark.

**Commit the workflow file with a descriptive message.**

---

### Task 3: Add a Docker Build Job to the CI Pipeline (Commit 3)

Extend your CI workflow so that it also builds the Docker image on every push. This verifies that the Dockerfile stays valid as the code changes.

**3a. Add a `docker` job**

Add a second job called `docker` to your `ci.yml` that:

1. Depends on the `test` job (use the `needs` keyword) so the Docker image is only built if tests pass
2. Runs on `ubuntu-latest`
3. Checks out the code
4. Uses `docker/setup-buildx-action@v3` to set up Docker Buildx
5. Builds the Docker image using `docker/build-push-action@v6` with `push: false` (build only, no push) and tags the image as `assignment-3:latest`

**3b. Push and verify**

Push your changes and check the Actions tab. You should now see two jobs in the workflow: `test` and `docker`. The `docker` job should only run after `test` succeeds.

**Commit your changes with a descriptive message.**

---

### Task 4: Publish the Docker Image to GitHub Container Registry (Commit 4)

Now automate publishing the Docker image to [GitHub Container Registry (ghcr.io)](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry).

**4a. Update the `docker` job**

Modify the `docker` job so that it:

1. Only pushes when on the `main` branch (use an `if` condition on the push step or use `push: ${{ github.ref == 'refs/heads/main' }}` in the build-push action)
2. Adds `permissions` to the `docker` job so that it can push packages and check out code:
   ```yaml
   permissions:
     contents: read
     packages: write
   ```
3. Logs in to `ghcr.io` using `docker/login-action@v3` with:
   - `registry: ghcr.io`
   - `username: ${{ github.actor }}`
   - `password: ${{ secrets.GITHUB_TOKEN }}`
4. Tags the image as `ghcr.io/${{ github.repository }}:latest` (using `github.repository` ensures the tag matches the repository owner, whether that is your personal account or a GitHub Classroom organization)
5. Pushes the image to the registry (set `push: true` when on main)

> **Note:** `GITHUB_TOKEN` is automatically provided by GitHub Actions -- you do not need to create this secret manually.

> **Note:** If your repository lives under a GitHub organization (e.g. GitHub Classroom), the org must allow GitHub Actions to create packages. An org admin can enable this under **Organization Settings → Actions → General → Workflow permissions** — select **"Read and write permissions"**.

**4b. Verify the published image**

After the workflow has pushed the image successfully:

1. Go to your repository on GitHub
2. Find the package in the **Packages** section in the right sidebar of your repository page
3. Click on the package and verify that the image has been pushed with the `latest` tag

**Commit your changes with a descriptive message.**

---

### Task 5: Multi-Stage Docker Build (Commit 5)

Optimize your Docker image using a multi-stage build to reduce the final image size.

**5a. Check your current image size**

Run `docker images assignment-3` and note the size.

**5b. Update the Dockerfile to use multi-stage builds**

Rewrite your Dockerfile to have two stages:

1. **Build stage** (`FROM oven/bun:latest AS build`): Install dependencies and prepare the app
2. **Production stage** (`FROM oven/bun:slim`): Copy only the necessary files from the build stage and run the app

The key idea is that the final image only contains what is needed at runtime, not build tools or dev dependencies.

**5c. Compare the image size**

Rebuild the image and compare the new size to the old one. The slim image should be noticeably smaller.

**Commit your changes with a descriptive message.**

---

## Handin

1. Ensure you have at least **5 commits** (one per task)
2. Verify the following before submitting:
   - The CI workflow runs tests and linter successfully (green checkmark)
   - The Docker image is built and pushed by the CI pipeline
   - The Docker image is published to ghcr.io and visible in the repository's Packages sidebar
3. Submit the GitHub repository link to Canvas

## Tips

- Use the [GitHub Actions documentation](https://docs.github.com/en/actions) as a reference
- Use the [Docker documentation](https://docs.docker.com/reference/dockerfile/) for Dockerfile syntax
- If your workflow fails, check the **Actions** tab for detailed logs
- Remember what you learned in Week 4 and Week 5 in-class exercises
- You can trigger a workflow re-run from the Actions tab if needed
