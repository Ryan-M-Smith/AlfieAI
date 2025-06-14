# Embedding Microservice Changelog

## v1.0.0 - 6/11/25

* Initial release of the embedding microservice
* The service contains a `Dockerfile`, and can be built into an image and deployed to Google Cloud Run
  by running `pnpm deploy`

## v1.1.0 - 6/14/25

* The `/ping` endpoint now returns a (useless) JSON packet
* A `GET` request is sent to this endpoint by Cloud Scheduler every 10 minutes to keep the
  embedding service from de-scaling
