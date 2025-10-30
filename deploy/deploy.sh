#!/usr/bin/env bash
set -e

echo "This script helps deploy Smart Farmer backend using docker-compose"

# 1. Install docker & docker-compose (Ubuntu)
echo "Installing docker and docker-compose if missing..."
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "Create production .env in BACKEND directory by copying deploy/.env.example and filling secrets."
echo "cp deploy/.env.example BACKEND/.env && edit BACKEND/.env"

echo "Bringing up services..."
sudo docker-compose -f deploy/docker-compose.yml up -d --build

echo "Deployment complete. Configure DNS for your domain to point to this server and obtain certificates with certbot."
