FROM python:3.9-slim

WORKDIR /app

COPY backend/requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

COPY backend /app/backend

EXPOSE 5000

CMD ["python", "/app/backend/app.py"]