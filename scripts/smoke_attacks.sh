#!/usr/bin/env bash

set -u

BASE_URL="${API_BASE_URL:-http://127.0.0.1:8000}"

echo
echo "============================================================"
echo " AI SECURITY PLATFORM - SMOKE TEST"
echo "============================================================"
echo


pretty_json() {
    python -m json.tool 2>/dev/null || cat
}


call_api() {
    local method="$1"
    local url="$2"
    local body="${3:-}"

    local tmp
    tmp="$(mktemp)"

    if [ "$method" = "GET" ]; then

        code=$(
            curl -sS \
                --max-time 90 \
                -o "$tmp" \
                -w "%{http_code}" \
                "$url"
        )

    else

        code=$(
            curl -sS \
                --max-time 90 \
                -o "$tmp" \
                -w "%{http_code}" \
                -X "$method" \
                -H "Content-Type: application/json" \
                -d "$body" \
                "$url"
        )

    fi

    echo "HTTP $code"

    cat "$tmp" | pretty_json

    RESPONSE_BODY="$(cat "$tmp")"
    RESPONSE_CODE="$code"

    rm -f "$tmp"
}


extract_campaign_id() {

    printf '%s' "$1" |
    python -c '
import json
import sys

try:
    data = json.load(sys.stdin)

    campaign_id = (
        data.get("campaign_id")
        or data.get("id")
        or (
            data.get("campaign", {})
            .get("id")
        )
    )

    print(campaign_id or "")

except Exception:
    print("")
'
}


echo "============================================================"
echo "1. HEALTH"
echo "============================================================"

call_api \
    GET \
    "$BASE_URL/health"

if [ "$RESPONSE_CODE" != "200" ]; then
    echo
    echo "[ERROR] Backend inaccessible."
    echo "Lance d'abord : python main.py"
    exit 1
fi


run_family() {

    local label="$1"
    local prefix="$2"

    echo
    echo
    echo "============================================================"
    echo "$label"
    echo "============================================================"


    echo
    echo "------------------------------------------------------------"
    echo "SCENARIOS"
    echo "------------------------------------------------------------"

    call_api \
        GET \
        "$BASE_URL/api/attacks/$prefix/scenarios"

    if [ "$RESPONSE_CODE" != "200" ]; then
        echo
        echo "[ERROR] Impossible de charger les scénarios de $label"
        return 1
    fi


    echo
    echo "------------------------------------------------------------"
    echo "CREATE CAMPAIGN"
    echo "------------------------------------------------------------"

    call_api \
        POST \
        "$BASE_URL/api/attacks/$prefix/campaigns" \
        '{}'

    if [ "$RESPONSE_CODE" != "200" ] && \
       [ "$RESPONSE_CODE" != "201" ]; then

        echo
        echo "[ERROR] Création de campagne impossible."
        return 1
    fi


    campaign_id="$(
        extract_campaign_id \
        "$RESPONSE_BODY"
    )"


    if [ -z "$campaign_id" ]; then

        echo
        echo "[ERROR] campaign_id absent de la réponse."
        return 1

    fi


    echo
    echo "Campaign ID:"
    echo "$campaign_id"


    for scenario_index in 0 1 2 3 4
    do

        echo
        echo "------------------------------------------------------------"
        echo "SCENARIO $scenario_index"
        echo "------------------------------------------------------------"

        call_api \
            POST \
            "$BASE_URL/api/attacks/$prefix/run-single" \
            "{
                \"scenario_index\": $scenario_index,
                \"campaign_id\": \"$campaign_id\"
            }"


        if [ "$RESPONSE_CODE" != "200" ]; then

            echo
            echo "============================================================"
            echo "[ERROR] $label / scénario $scenario_index"
            echo "============================================================"

            echo
            echo "La campagne s'arrête ici pour faciliter le diagnostic."

            return 1

        fi

    done


    echo
    echo "------------------------------------------------------------"
    echo "FINAL CAMPAIGN STATE"
    echo "------------------------------------------------------------"

    call_api \
        GET \
        "$BASE_URL/api/attacks/$prefix/campaigns/$campaign_id"


    echo
    echo "[OK] $label terminé."

    return 0
}


run_family \
    "LLM01 - Prompt Injection" \
    "prompt-injection"

LLM01_STATUS=$?


run_family \
    "LLM02 - Sensitive Information Disclosure" \
    "sensitive-information"

LLM02_STATUS=$?


echo
echo
echo "============================================================"
echo "POSTGRESQL HISTORY"
echo "============================================================"

call_api \
    GET \
    "$BASE_URL/api/results"


echo
echo
echo "============================================================"
echo "FINAL RESULT"
echo "============================================================"

if [ "$LLM01_STATUS" -eq 0 ]; then
    echo "LLM01 : OK"
else
    echo "LLM01 : ERROR"
fi

if [ "$LLM02_STATUS" -eq 0 ]; then
    echo "LLM02 : OK"
else
    echo "LLM02 : ERROR"
fi


if [ "$LLM01_STATUS" -eq 0 ] && \
   [ "$LLM02_STATUS" -eq 0 ]; then

    echo
    echo "Tous les tests sont terminés."
    exit 0

else

    echo
    echo "Une erreur a été détectée."
    echo "Envoie-moi la section HTTP qui échoue."
    exit 1

fi
