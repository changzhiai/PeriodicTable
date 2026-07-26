#!/bin/bash
# IndexNow submission script - Run after deployment to notify search engines of updated content
# Supports: Bing, Yandex, Seznam, Naver, and other IndexNow-compatible engines

SITE_URL="https://periodictable.travel-tracker.org"
KEY="4034ca382a399784f0f18269147c0cb1"
KEY_LOCATION="${SITE_URL}/${KEY}.txt"
INDEXNOW_ENDPOINT="https://api.indexnow.org/indexnow"

# All site URLs to submit
URLS=(
  "${SITE_URL}/"
  "${SITE_URL}/about"
  "${SITE_URL}/how-it-works"
  "${SITE_URL}/glossary"
  "${SITE_URL}/history"
  "${SITE_URL}/download"
  "${SITE_URL}/privacy"
  "${SITE_URL}/site-index"
  "${SITE_URL}/category/alkali-metal"
  "${SITE_URL}/category/alkaline-earth-metal"
  "${SITE_URL}/category/transition-metal"
  "${SITE_URL}/category/post-transition-metal"
  "${SITE_URL}/category/metalloid"
  "${SITE_URL}/category/nonmetal"
  "${SITE_URL}/category/noble-gas"
  "${SITE_URL}/category/lanthanide"
  "${SITE_URL}/category/actinide"
)

# Build JSON payload
URL_LIST=""
for url in "${URLS[@]}"; do
  if [ -n "$URL_LIST" ]; then
    URL_LIST="${URL_LIST},"
  fi
  URL_LIST="${URL_LIST}\"${url}\""
done

JSON_PAYLOAD="{
  \"host\": \"periodictable.travel-tracker.org\",
  \"key\": \"${KEY}\",
  \"keyLocation\": \"${KEY_LOCATION}\",
  \"urlList\": [${URL_LIST}]
}"

echo "Submitting ${#URLS[@]} URLs to IndexNow..."
echo ""

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${INDEXNOW_ENDPOINT}" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "${JSON_PAYLOAD}")

case $RESPONSE in
  200)
    echo "Success (200): URLs submitted and indexed."
    ;;
  202)
    echo "Accepted (202): URLs submitted, will be processed later."
    ;;
  400)
    echo "Error (400): Bad request - check payload format."
    exit 1
    ;;
  403)
    echo "Error (403): Key not valid or key file not accessible at ${KEY_LOCATION}"
    exit 1
    ;;
  422)
    echo "Error (422): URLs don't belong to the host or are invalid."
    exit 1
    ;;
  429)
    echo "Error (429): Too many requests - try again later."
    exit 1
    ;;
  *)
    echo "Unexpected response: ${RESPONSE}"
    exit 1
    ;;
esac

echo ""
echo "Done. IndexNow submission complete."
