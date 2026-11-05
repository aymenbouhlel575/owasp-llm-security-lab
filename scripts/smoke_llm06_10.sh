#!/usr/bin/env bash

set -euo pipefail


BASE_URL="http://127.0.0.1:8000"


run_test() {

    CODE="$1"
    SLUG="$2"


    echo
    echo "============================================================"
    echo "$CODE - $SLUG"
    echo "============================================================"


    echo
    echo "[1] GET scenarios"


    curl -fsS \
    "$BASE_URL/api/attacks/$SLUG/scenarios" \
    |
    python -c '
import json
import sys

data = json.load(sys.stdin)

print(
    "category =",
    data.get("category")
)

print(
    "scenarios =",
    data.get("total")
)
'


    echo
    echo "[2] CREATE campaign"


    CAMPAIGN="$(
        curl -fsS \
        -X POST \
        "$BASE_URL/api/attacks/$SLUG/campaigns"
    )"


    CAMPAIGN_ID="$(
        printf "%s" "$CAMPAIGN" |
        python -c '
import json
import sys

data = json.load(sys.stdin)

print(
    data.get("campaign_id")
    or
    data.get("id")
    or
    ""
)
'
    )"


    echo "campaign_id=$CAMPAIGN_ID"


    if [
        -z "$CAMPAIGN_ID"
    ]; then

        echo "[ERROR] campaign_id absent"

        exit 1
    fi


    echo
    echo "[3] RUN scenario 0"


    RESULT="$(
        curl -fsS \
        --max-time 120 \
        -X POST \
        "$BASE_URL/api/attacks/$SLUG/run-single" \
        -H "Content-Type: application/json" \
        -d "{
          \"scenario_index\": 0,
          \"campaign_id\": \"$CAMPAIGN_ID\"
        }"
    )"


    printf "%s" "$RESULT" |
    python -c '
import json
import sys

data = json.load(sys.stdin)

evaluation = (
    data.get("evaluation")
    or
    {}
)

print(
    "attack =",
    data.get("attack_name")
)

print(
    "verdict =",
    data.get("verdict")
)

print(
    "attack_success =",
    data.get("attack_success")
)

print(
    "model_decision =",
    evaluation.get(
        "model_decision"
    )
)

print(
    "expected =",
    evaluation.get(
        "expected_decision"
    )
)

print(
    "trace_id =",
    data.get("trace_id")
)
'


    echo
    echo "[OK] $CODE"
}


run_test \
"LLM06" \
"excessive-agency"


run_test \
"LLM07" \
"system-prompt-leakage"


run_test \
"LLM08" \
"vector-embedding-weaknesses"


run_test \
"LLM09" \
"misinformation"


run_test \
"LLM10" \
"unbounded-consumption"


echo
echo "============================================================"
echo "LLM06 -> LLM10 SMOKE TEST FINISHED"
echo "============================================================"
