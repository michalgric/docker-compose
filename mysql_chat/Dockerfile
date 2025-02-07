FROM python:3.11-slim as base

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Builder stage
FROM base as builder
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /wheels -r requirements.txt

# Final stage
# Add build argument for port
ARG PORT=5000
ENV PORT=$PORT

FROM base

WORKDIR /app

# Copy wheels from builder and install
COPY --from=builder /wheels /wheels
COPY . .
RUN pip install --no-cache /wheels/* && \
    rm -rf /wheels

# Create non-root user for security
RUN adduser --disabled-password --no-create-home appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose the port the app runs on
EXPOSE $PORT

# Add healthcheck
HEALTHCHECK CMD curl --fail http://localhost:${PORT} || exit 1

# Command to run the application
CMD ["python", "app.py"]
