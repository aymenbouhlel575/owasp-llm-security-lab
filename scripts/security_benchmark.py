#!/usr/bin/env python3

import argparse
import json
from datetime import datetime
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


BASE_URL = "http://127.0.0.1:8000"


ATTACKS = [
    ("LLM01", "prompt-injection"),
    ("LLM02", "sensitive-information"),
    ("LLM03", "supply-chain"),
    ("LLM04", "data-model-poisoning"),
    ("LLM05", "improper-output-handling"),
    ("LLM06", "excessive-agency"),
    ("LLM07", "system-prompt-leakage"),
    ("LLM08", "vector-embedding-weaknesses"),
    ("LLM09", "misinformation"),
    ("LLM10", "unbounded-consumption"),
]


def request_json(
    method,
    path,
    payload=None,
    query=None,
    timeout=300,
):
    url = BASE_URL + path

    if query:
        url += "?" + urlencode(query)

    body = None

    headers = {
        "Accept": "application/json",
    }

    if payload is not None:
        body = json.dumps(
            payload
        ).encode("utf-8")

        headers[
            "Content-Type"
        ] = "application/json"

    request = Request(
        url,
        data=body,
        headers=headers,
        method=method,
    )

    try:
        with urlopen(
            request,
            timeout=timeout,
        ) as response:

            raw = (
                response
                .read()
                .decode("utf-8")
            )

            return json.loads(raw)

    except HTTPError as exc:
        body = (
            exc.read()
            .decode(
                "utf-8",
                errors="replace",
            )
        )

        raise RuntimeError(
            f"HTTP {exc.code}: {body}"
        ) from exc

    except URLError as exc:
        raise RuntimeError(
            f"API inaccessible: {exc}"
        ) from exc


def normalize_verdict(result):
    verdict = str(
        result.get(
            "verdict",
            "PARTIAL",
        )
    ).upper()

    if verdict not in {
        "BLOCKED",
        "PARTIAL",
        "COMPROMISED",
    }:
        verdict = "PARTIAL"

    return verdict


def calculate_metrics(rows):
    total = len(rows)

    blocked = sum(
        1
        for row in rows
        if row["verdict"] == "BLOCKED"
    )

    partial = sum(
        1
        for row in rows
        if row["verdict"] == "PARTIAL"
    )

    compromised = sum(
        1
        for row in rows
        if row["verdict"] == "COMPROMISED"
    )

    raw = sum(
        1
        for row in rows
        if row.get(
            "raw_attack_success"
        )
    )

    asr = (
        compromised
        /
        total
        *
        100
        if total
        else 0
    )

    raw_asr = (
        raw
        /
        total
        *
        100
        if total
        else 0
    )

    return {
        "total":
            total,

        "blocked":
            blocked,

        "partial":
            partial,

        "compromised":
            compromised,

        "asr":
            round(
                asr,
                2,
            ),

        "raw_asr":
            round(
                raw_asr,
                2,
            ),
    }


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--max-scenarios",
        type=int,
        default=1,
    )

    parser.add_argument(
        "--adaptive",
        action="store_true",
    )

    parser.add_argument(
        "--max-rounds",
        type=int,
        default=3,
    )

    args = parser.parse_args()

    max_scenarios = max(
        1,
        min(
            args.max_scenarios,
            5,
        ),
    )

    max_rounds = max(
        1,
        min(
            args.max_rounds,
            5,
        ),
    )


    print()
    print("=" * 74)
    print(" AI SECURITY BENCHMARK")
    print("=" * 74)


    try:
        health = request_json(
            "GET",
            "/health",
            timeout=20,
        )

        print(
            "[OK] Backend accessible"
        )

    except Exception as exc:
        print(
            "[FAIL] Backend inaccessible"
        )

        print(exc)

        print()
        print(
            "Lance d'abord python main.py "
            "dans un autre terminal."
        )

        raise SystemExit(1)


    all_results = []


    for code, slug in ATTACKS:

        print()
        print("=" * 74)
        print(code, slug)
        print("=" * 74)


        try:
            scenario_data = request_json(
                "GET",
                f"/api/attacks/{slug}/scenarios",
            )

            available = int(
                scenario_data.get(
                    "total",
                    len(
                        scenario_data.get(
                            "scenarios",
                            [],
                        )
                    ),
                )
            )

        except Exception as exc:
            print(
                "[ERROR] scénarios:",
                exc
            )

            continue


        scenario_count = min(
            available,
            max_scenarios,
        )


        print(
            "scénarios disponibles:",
            available
        )


        for mode in (
            "baseline",
            "protected",
        ):

            print()
            print(
                f"--- {mode.upper()} ---"
            )


            try:
                campaign = request_json(
                    "POST",
                    f"/api/attacks/{slug}/campaigns",
                    query={
                        "mode":
                            mode,
                    },
                )

                campaign_id = (
                    campaign[
                        "campaign_id"
                    ]
                )

                print(
                    "campaign:",
                    campaign_id
                )

            except Exception as exc:
                print(
                    "[ERROR] campagne:",
                    exc
                )

                continue


            for scenario_index in range(
                scenario_count
            ):

                print(
                    f"scenario {scenario_index}:",
                    end=" ",
                    flush=True,
                )


                try:
                    result = request_json(
                        "POST",
                        f"/api/attacks/{slug}/run-single",
                        payload={
                            "scenario_index":
                                scenario_index,

                            "campaign_id":
                                campaign_id,

                            "adaptive":
                                args.adaptive,

                            "max_rounds":
                                max_rounds,
                        },
                        timeout=360,
                    )


                    verdict = (
                        normalize_verdict(
                            result
                        )
                    )


                    input_guard = (
                        result.get(
                            "input_guard"
                        )
                        or
                        {}
                    )


                    output_guard = (
                        result.get(
                            "output_guard"
                        )
                        or
                        {}
                    )


                    row = {
                        "code":
                            code,

                        "slug":
                            slug,

                        "mode":
                            mode,

                        "scenario_index":
                            scenario_index,

                        "campaign_id":
                            campaign_id,

                        "trace_id":
                            result.get(
                                "trace_id"
                            ),

                        "verdict":
                            verdict,

                        "attack_success":
                            bool(
                                result.get(
                                    "attack_success",
                                    False,
                                )
                            ),

                        "raw_attack_success":
                            bool(
                                result.get(
                                    "raw_attack_success",
                                    False,
                                )
                            ),

                        "target_called":
                            result.get(
                                "target_called"
                            ),

                        "input_guard":
                            input_guard.get(
                                "decision"
                            ),

                        "output_guard":
                            output_guard.get(
                                "decision"
                            ),

                        "result":
                            result,
                    }


                    all_results.append(
                        row
                    )


                    print(
                        verdict,
                        "| raw:",
                        row[
                            "raw_attack_success"
                        ],
                        "| input:",
                        row[
                            "input_guard"
                        ],
                        "| output:",
                        row[
                            "output_guard"
                        ],
                        "| target:",
                        row[
                            "target_called"
                        ],
                    )


                except Exception as exc:

                    print(
                        "ERROR"
                    )

                    print(
                        " ",
                        exc
                    )


                    all_results.append(
                        {
                            "code":
                                code,

                            "slug":
                                slug,

                            "mode":
                                mode,

                            "scenario_index":
                                scenario_index,

                            "verdict":
                                "ERROR",

                            "error":
                                str(exc),
                        }
                    )


    valid = [
        row
        for row in all_results
        if row.get(
            "verdict"
        )
        in {
            "BLOCKED",
            "PARTIAL",
            "COMPROMISED",
        }
    ]


    baseline = [
        row
        for row in valid
        if row["mode"] ==
        "baseline"
    ]


    protected = [
        row
        for row in valid
        if row["mode"] ==
        "protected"
    ]


    baseline_metrics = (
        calculate_metrics(
            baseline
        )
    )


    protected_metrics = (
        calculate_metrics(
            protected
        )
    )


    effectiveness = None

    if (
        baseline_metrics[
            "asr"
        ]
        >
        0
    ):
        effectiveness = (
            1
            -
            (
                protected_metrics[
                    "asr"
                ]
                /
                baseline_metrics[
                    "asr"
                ]
            )
        ) * 100

        effectiveness = round(
            max(
                0,
                min(
                    effectiveness,
                    100,
                ),
            ),
            2,
        )


    print()
    print("=" * 74)
    print(" RESULTS")
    print("=" * 74)

    print(
        f"{'MODE':<12}"
        f"{'TESTS':>8}"
        f"{'BLOCKED':>10}"
        f"{'PARTIAL':>10}"
        f"{'COMP':>8}"
        f"{'ASR':>10}"
        f"{'RAW ASR':>10}"
    )

    print("-" * 74)


    for name, metrics in (
        (
            "Baseline",
            baseline_metrics,
        ),
        (
            "Protected",
            protected_metrics,
        ),
    ):

        print(
            f"{name:<12}"
            f"{metrics['total']:>8}"
            f"{metrics['blocked']:>10}"
            f"{metrics['partial']:>10}"
            f"{metrics['compromised']:>8}"
            f"{metrics['asr']:>9.2f}%"
            f"{metrics['raw_asr']:>9.2f}%"
        )


    print()

    print(
        "Guardrail effectiveness:",
        (
            f"{effectiveness}%"
            if effectiveness
            is not None
            else "N/A"
        ),
    )


    print()
    print("-" * 74)
    print(" PAR OWASP")
    print("-" * 74)


    for code, _slug in ATTACKS:

        base_rows = [
            row
            for row in baseline
            if row["code"] == code
        ]

        protected_rows = [
            row
            for row in protected
            if row["code"] == code
        ]


        base_metrics = (
            calculate_metrics(
                base_rows
            )
        )

        prot_metrics = (
            calculate_metrics(
                protected_rows
            )
        )


        print(
            f"{code}: "
            f"Baseline ASR="
            f"{base_metrics['asr']:.2f}% "
            f"| Protected ASR="
            f"{prot_metrics['asr']:.2f}%"
        )


    report = {
        "generated_at":
            datetime.now()
            .astimezone()
            .isoformat(),

        "adaptive":
            args.adaptive,

        "max_rounds":
            max_rounds,

        "baseline":
            baseline_metrics,

        "protected":
            protected_metrics,

        "guardrail_effectiveness":
            effectiveness,

        "results":
            all_results,
    }


    timestamp = (
        datetime.now()
        .strftime(
            "%Y%m%d_%H%M%S"
        )
    )


    output = (
        Path("reports")
        /
        (
            "security_benchmark_"
            f"{timestamp}.json"
        )
    )


    output.write_text(
        json.dumps(
            report,
            indent=2,
            ensure_ascii=False,
            default=str,
        ),
        encoding="utf-8",
    )


    print()
    print(
        "[OK] Rapport:",
        output
    )


if __name__ == "__main__":
    main()
