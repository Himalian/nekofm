#! /usr/bin/env bash
 curl -X POST "http://localhost:5173/api/submit-scrobble" \
                               -H "Content-Type: application/json" \
                               -d '{
                             "listen_type": "single",
                             "payload": [
                               {
                                 "listened_at": 1700000000,
                                 "track_metadata": {
                                   "artist_name": "Rick Astley",
                                   "track_name": "Never Gonna Give You Up",
                                   "release_name": "Whenever You Need Somebody",

                                   "additional_info": {
                                     "media_player": "curl-test",
                                     "submission_client": "Hono-Dev-Test"
                                   }
                                 }
                               }
                             ]
                           }'
