gcloud functions deploy spca-scraper \
--runtime=nodejs20 \
--region=us-central1 \
--source=./dist \
--entry-point=entry \
--trigger-http \
--allow-unauthenticated \
--service-account spca-adoption@spca-adoption-notify.iam.gserviceaccount.com \
--timeout=540 \
--memory=256MB \
--docker-registry=artifact-registry