#!/bin/bash

# Build the Docker image
docker build --platform=linux/amd64 -t embedding-service:latest .

# Tag it
docker tag embedding-service:latest \
  us-east1-docker.pkg.dev/gen-lang-client-0521416763/alife-ai-embedding/embedding-service:latest

# Push the image to Google Artifact Registry
docker push us-east1-docker.pkg.dev/gen-lang-client-0521416763/alife-ai-embedding/embedding-service:latest

# Deploy the service to Google Cloud Run
gcloud run deploy embedding-service \
  --image=us-east1-docker.pkg.dev/gen-lang-client-0521416763/alife-ai-embedding/embedding-service:latest \
  --platform=managed \
  --region=us-east1 \
  --allow-unauthenticated
