FROM python:3.14-rc-slim

WORKDIR /app

# 1. On installe uniquement curl et les outils de base (Playwright fera le rest>
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    sudo \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2. SOLUTION UNIQUE : On installe chromium ET ses dépendances système d'un coup
RUN playwright install chromium --with-deps

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]

