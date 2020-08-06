$(aws ecr get-login --no-include-email)
docker-compose -f ~/config/docker-compose.yaml up -d --remove-orphans