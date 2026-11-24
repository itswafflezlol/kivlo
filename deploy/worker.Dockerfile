FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY src/worker/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/worker/kivlo_worker ./kivlo_worker

RUN useradd -m -u 10002 kivlo
USER kivlo

CMD ["python", "-m", "kivlo_worker.main"]
