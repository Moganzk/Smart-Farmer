# Deployment guide - Smart Farmer (Backend)

This folder contains deployment artifacts for running the backend using Docker and Nginx.

Files:

- `docker-compose.yml` - Compose file to run `app` and `nginx` services
- `nginx/conf.d/api.conf` - Nginx server block which proxies to the `app` container
- `.env.example` - Example environment file (copy to `BACKEND/.env` and fill secrets)
- `deploy.sh` - Helper script to install Docker & docker-compose and start the stack

Important notes:

- **Do not store secrets in Git.** Copy `.env.example` to `BACKEND/.env` on the server and fill in real values.
- The compose file exposes ports 80/443 on the host. Nginx handles ACME challenges at `/.well-known/acme-challenge/`.
- For a managed Postgres (DigitalOcean), replace the `DATABASE_URL` in `BACKEND/.env` with your managed DB connection string and remove any local DB service.
- Use `certbot` on the host or in a container to obtain TLS certificates. This setup assumes `/etc/letsencrypt` is mounted into the nginx container at `./certs`.

Basic deploy steps (on the droplet):

1. SSH into the server.
2. Pull the repository into `/opt/smart-farmer` or another folder.
3. Copy `deploy/.env.example` to `BACKEND/.env` and fill secrets.
4. Run `sudo bash deploy/deploy.sh` to install docker, docker-compose and start services.
5. Obtain certificates with certbot (or run certbot in a container) and place them into `deploy/certs` so nginx can see them.

Example certbot command on Ubuntu (host):

```bash
sudo apt-get install certbot
sudo certbot certonly --webroot -w /var/www/certbot -d moganspace.live -d api.moganspace.live
# Then copy certs into deploy/certs or mount /etc/letsencrypt into the nginx container
```

If you want I can update `docker-compose.yml` to include a certbot container to automate certificate issuance.
