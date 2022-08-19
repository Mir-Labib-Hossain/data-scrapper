
#!/bin/bash

tag=$(cat tag)

echo "building image: $tag"

docker build --platform linux/amd64 . --no-cache  -t gcr.io/stock-x-342909/web-data-scrapper:$tag

docker push gcr.io/stock-x-342909/web-data-scrapper:$tag