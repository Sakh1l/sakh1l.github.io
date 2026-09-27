---
external: false
draft: false
title: Docker - Build, Ship & Run
description: Build a small Flask app, package it as a Docker image, push it to Docker Hub, and run it on another machine.
date: 2024-02-17
---

*Revised in September 2026 from my original 2024 draft. This version completes the example and updates the installation and security guidance.*

Docker makes it easier to package an application with the dependencies it needs. You describe the package in a `Dockerfile`, build an **image**, and run that image as a **container**. To move the same application elsewhere, push the image to a registry and pull it on another machine.

That is the journey I want to show here: **build, ship, and run** a small Python web app that displays a random fortune. The commands become much easier to remember once the image, container, registry, and Docker daemon each have a clear role.

## Before we start

You need Docker installed and a working Docker CLI. On Ubuntu, follow Docker's [official Engine installation guide](https://docs.docker.com/engine/install/ubuntu/); on macOS or Windows, [Docker Desktop](https://docs.docker.com/desktop/) is an option. Check the installation with `docker version` and, if needed, Docker's `hello-world` test. You only need a [Docker Hub](https://hub.docker.com/) account for the **push** step.

> **Linux permissions:** Docker commands may require `sudo` until your account has access to the daemon. Adding yourself to the `docker` group is convenient but grants **root-level privileges**; read Docker's [post-installation guidance](https://docs.docker.com/engine/install/linux-postinstall/) before doing so. Docker's download-and-run installation script is meant for testing/development, not a production host. Prefer the documented package-repository installation for a long-lived machine.

Docker has a client/server design: the `docker` command talks to a daemon that builds images and runs containers. For this first example, the daemon is on your own machine.

## 1. Create a tiny Flask application

Make a directory named `fortune-flask` with the following files:

```text
fortune-flask/
├── app.py
├── requirements.txt
├── templates/
│   └── index.html
├── Dockerfile
└── .dockerignore
```

**`app.py`** asks the classic Unix `fortune` program for a short saying. A timeout and fallback keep the page usable if that command cannot run.

```python
import subprocess

from flask import Flask, render_template

app = Flask(__name__)


@app.get("/")
def home():
    try:
        result = subprocess.run(
            ["/usr/games/fortune", "-s"],
            capture_output=True,
            check=True,
            text=True,
            timeout=3,
        )
        fortune = result.stdout.strip() or "There is always something new to learn."
    except (OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
        fortune = "There is always something new to learn."

    return render_template("index.html", fortune=fortune)
```

**`templates/index.html`** gives the app a simple page:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>A small fortune</title>
  </head>
  <body>
    <main>
      <h1>A small fortune</h1>
      <p>{{ fortune }}</p>
    </main>
  </body>
</html>
```

**`requirements.txt`** lists the Python packages. These example versions were current when this revision was prepared; check for newer security updates if you reuse them later.

```text
Flask==3.1.3
gunicorn==26.2.0
```

## 2. Describe the image

The **`Dockerfile`** starts from a Python image, installs the `fortune` command and its quotation data, installs Python dependencies, and copies the app. Gunicorn serves Flask inside the container instead of using Flask's development server.

```dockerfile
FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends fortune-mod fortunes-min \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY templates/ ./templates/

RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser

EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]
```

A small **`.dockerignore`** keeps local files and credentials out of the build context:

```text
.git
.venv
__pycache__
*.pyc
.env
```

`EXPOSE 8000` documents the container's listening port. It does **not** publish that port to your computer; `docker run -p` does that in the next step.

## 3. Build and run it locally

From inside `fortune-flask`, replace `YOUR_DOCKERHUB_USERNAME` with your own Docker Hub username and run:

```bash
docker build -t YOUR_DOCKERHUB_USERNAME/fortune-flask:1.0 .
docker image ls
```

The final `.` means **use this directory as the build context**. The `-t` option gives the image a registry-ready name and a version tag.

Now start a container:

```bash
docker run --rm -p 127.0.0.1:8000:8000 YOUR_DOCKERHUB_USERNAME/fortune-flask:1.0
```

Open [http://localhost:8000](http://localhost:8000). Refresh the page for another fortune. The first `8000` is your computer's port, and the second is the container's port. Binding to `127.0.0.1` keeps this demo reachable only from the machine running Docker. Press **Ctrl+C** to stop it; `--rm` removes the stopped container, not the image.

## 4. Ship it through Docker Hub

To share the image, sign in and push it:

```bash
docker login
docker push YOUR_DOCKERHUB_USERNAME/fortune-flask:1.0
```

The image name must use a namespace you can push to. If the Docker Hub repository is public, other people can pull its image; choose the repository visibility deliberately. A private repository requires authentication on the other machine.

On another machine with a compatible Docker installation, pull and run the **same** tag:

```bash
docker pull YOUR_DOCKERHUB_USERNAME/fortune-flask:1.0
docker run --rm -p 127.0.0.1:8000:8000 YOUR_DOCKERHUB_USERNAME/fortune-flask:1.0
```

Open `http://localhost:8000` **on that machine** to see the app. The image includes the Python app, its dependencies, and the `fortune` program, so you do not install those pieces separately on the destination host. The host still needs Docker, and the image must support its CPU architecture.

## Optional: a remote Docker daemon over SSH

If you want to operate a *different* host's Docker daemon from your laptop, an SSH-based Docker context makes the target explicit:

```bash
docker context create remote-demo --docker "host=ssh://USER@REMOTE_HOST"
docker --context remote-demo info
```

The remote SSH account must have permission to access Docker there. Be careful: Docker commands sent through that context act on the **remote** host, and a published port belongs to that host, not your laptop. See Docker's [daemon access guide](https://docs.docker.com/engine/security/protect-access/) before managing a remote system.

The important distinction is that **building** creates an image, **running** starts a container from it, and **pushing** shares the image through a registry.

### Further reading

- [Docker: build, tag, and publish an image](https://docs.docker.com/get-started/docker-concepts/building-images/build-tag-and-publish-an-image/)
- [Docker: install Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
- [Docker: protect daemon access](https://docs.docker.com/engine/security/protect-access/)
- [Flask: deploying to production](https://flask.palletsprojects.com/en/stable/deploying/)
