FROM python:3.9-slim

WORKDIR /app

# Copy requirements first for better caching
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all files (app.py, models.py, and the frontend folder)
COPY . .

EXPOSE 5000

# Start the Flask backend
CMD ["python", "app.py"]