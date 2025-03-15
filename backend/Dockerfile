# Use Python slim image (based on Debian)
FROM python:3.11-slim

# Install tshark, networking tools, and build essentials
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    tshark \
    libpcap-dev \
    curl \
    gcc \
    g++ \
    make \
    libc-dev \
    libffi-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && echo "wireshark-common wireshark-common/install-setuid boolean false" | debconf-set-selections

WORKDIR /app

# Copy requirements file first (for better layer caching)
COPY backend/requirements.txt .

# Install packages from requirements.txt but with hash checks disabled
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    # Add --ignore-installed to ensure clean installation
    pip install --no-cache-dir --ignore-installed --no-deps flask flask-cors && \
    # Use the requirements file but without hash verification
    pip install --no-cache-dir --ignore-installed --no-deps --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt

# Copy application code
COPY backend/ .

# Create necessary directories
RUN mkdir -p uploads data models

# Make scripts executable
RUN chmod +x scripts/*.sh || true

# Expose port
EXPOSE 5000

# Run the app
CMD ["python", "app.py"] 