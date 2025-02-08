FROM python:3.12 AS base

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1


COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Final stage
# Add build argument for port
# Copy wheels from builder and install
COPY . .

# Expose the port the app runs on
EXPOSE 5300

# Add healthcheck
HEALTHCHECK CMD curl --fail http://localhost:5300 || exit 1

# Command to run the application
CMD ["python", "app.py"]
