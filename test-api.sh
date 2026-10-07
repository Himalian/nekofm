#!/usr/bin/env bash
set -e

BASE_URL="${BASE_URL:-http://localhost:5173}"

# Fetch current API token if not provided in environment
if [ -z "$TOKEN" ]; then
  echo "Fetching current token from ${BASE_URL}/api/token..."
  TOKEN=$(curl -s "${BASE_URL}/api/token" | grep -o '"apiToken":"[^"]*' | cut -d'"' -f4)
fi

echo "Using API Token: ${TOKEN}"
echo "Submitting now playing scrobble to ${BASE_URL}/api/listenbrainz/1/submit-listens..."

curl -i -X POST "${BASE_URL}/api/listenbrainz/1/submit-listens" \
  -H "Authorization: Token ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "listen_type": "playing_now",
    "payload": [
      {
        "track_metadata": {
          "artist_name": "Rick Astley",
          "track_name": "Never Gonna Give You Up",
          "release_name": "Whenever You Need Somebody",
          "additional_info": {
            "media_player": "curl-test",
            "submission_client": "Hono-Dev-Test",
            "duration_ms": 213000
          }
        }
      }
    ]
  }'

echo ""
echo "Done."
