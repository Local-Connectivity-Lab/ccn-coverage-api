#!/bin/bash

API_URL="https://coverage.seattlecommunitynetwork.org/"
EXPECTED_RESPONSE="200"

# Make a GET request to the API endpoint and capture the HTTP status code
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

# Check if the HTTP status code matches the expected response
if [ "$HTTP_STATUS" = "$EXPECTED_RESPONSE" ]; then
    echo "API is UP. Status code: $HTTP_STATUS"
else
    echo "API is DOWN or returned unexpected status code: $HTTP_STATUS"
fi
