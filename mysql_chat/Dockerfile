FROM python:3.12-slim AS base

ENV DEBIAN_FRONTEND=noninteractive
RUN apt update && apt install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
COPY . .


RUN python -m venv venv
RUN ./venv/bin/pip install --upgrade pip
RUN ./venv/bin/pip install -r requirements.txt

# Final stage
# Add build argument for port
ARG PORT=5300
ENV PORT=$PORT

# Expose the port the app runs on
EXPOSE $PORT

# Add healthcheck
HEALTHCHECK CMD curl --fail http://localhost:${PORT} || exit 1

# Command to run the application
CMD ["./venv/bin/python", "app.py"]
