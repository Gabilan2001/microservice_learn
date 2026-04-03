# CI/CD Setup Guide

This repository now includes CI/CD for both services:
- `service/user_service_lean`
- `service/event_servicce_learn`

## Workflows Added

- `.github/workflows/ci.yml`
  - Runs on pull requests and pushes.
  - Installs dependencies and validates JavaScript syntax for both services.

- `.github/workflows/docker-publish.yml`
  - Builds Docker images for both services.
  - Pushes images to Docker Hub with `latest` and short `sha` tags.

- `.github/workflows/deploy-ecs.yml`
  - Manual deploy workflow (`workflow_dispatch`).
  - Pulls current ECS task definitions, replaces image tags, deploys both services.

## GitHub Secrets Required

Create these in your repository settings under Secrets and variables -> Actions.

### Docker Hub
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

### AWS
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `ECS_CLUSTER_NAME`
- `ECS_USER_SERVICE_NAME`
- `ECS_EVENT_SERVICE_NAME`
- `ECS_USER_TASK_DEFINITION`
- `ECS_EVENT_TASK_DEFINITION`
- `ECS_USER_CONTAINER_NAME`
- `ECS_EVENT_CONTAINER_NAME`

## Docker Image Names Produced

- `<DOCKERHUB_USERNAME>/microservice-learn-user-service`
- `<DOCKERHUB_USERNAME>/microservice-learn-event-service`

## Deployment Order

1. Push code to `main`.
2. `Docker Build and Push` workflow publishes both images.
3. Run `Deploy to AWS ECS` workflow manually and provide `image_tag`:
   - `latest`, or
   - the short commit SHA tag created by docker-publish.

## ECS Runtime Environment Variables

Set these in ECS task definitions (or service env config):

### user service
- `PORT=8080`
- `MONGODB_URI=<your_mongodb_uri>`
- `JWT_SECRET_KEY=<your_secret>`
- `FRONTEND_URL=<frontend_url>`
- `RESEND_API=<resend_key>`
- `CLODINARY_CLOUD_NAME=<value>`
- `CLODINARY_API_KEY=<value>`
- `CLODINARY_API_SECRET_KEY=<value>`

### event service
- `PORT=8081`
- `MONGODB_URI=<your_mongodb_uri>`
- `FRONTEND_URL=<frontend_url>`
- `USER_SERVICE_TIMEOUT_MS=5000`
- `USER_SERVICE_URL=http://<internal-user-service-endpoint>:8080`

Use an internal endpoint for `USER_SERVICE_URL` so event service can call user service privately.

## Inter-service Communication Test

1. Login to user service and collect token:

```bash
curl -X POST "https://<user-service-domain>/api/user/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"<email>","password":"<password>"}'
```

2. Use returned `accesstoken` to call event service protected endpoint:

```bash
curl -X POST "https://<event-service-domain>/api/event/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accesstoken>" \
  -d '{"title":"Demo","description":"CI/CD test","date":"2026-12-10","seats":20}'
```

Expected result:
- Valid token: event created.
- Invalid token: `401`.
- User service unavailable: `503` from verification middleware.

## Security Note

Current local `.env` files contain real secrets. Rotate exposed credentials and keep production values only in GitHub Secrets/AWS Secrets Manager.
