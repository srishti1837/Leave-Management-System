# Use a lightweight Python image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install dependencies first for better caching
COPY backend/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend and frontend folders
COPY backend /app/backend
COPY frontend /app/frontend

# Expose the Flask port
EXPOSE 5000

# Run the application
CMD ["python", "backend/app.py"]