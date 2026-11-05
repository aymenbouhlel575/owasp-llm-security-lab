import {
  AlertTriangle,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useTranslation,
} from "react-i18next";

import {
  getAttackTrace,
} from "../api";

import ResultsTable from "./ResultsTable";
import ResultModal from "./ResultModal";
import TraceViewer from "./TraceViewer";


export default function Historic({
  results = [],
  onRefresh,
}) {
  const {
    i18n,
  } = useTranslation();


  const isFrench =
    i18n.resolvedLanguage
      ?.toLowerCase()
      .startsWith("fr");


  // ============================================================
  // STATE
  // ============================================================

  const [
    search,
    setSearch,
  ] = useState("");


  const [
    selectedResult,
    setSelectedResult,
  ] = useState(null);


  const [
    selectedTrace,
    setSelectedTrace,
  ] = useState(null);


  const [
    traceLoading,
    setTraceLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  // ============================================================
  // SEARCH
  // ============================================================

  const filteredResults =
    useMemo(
      () => {
        const value =
          search
            .trim()
            .toLowerCase();


        if (!value) {
          return results;
        }


        return results.filter(
          (result) => {
            return (
              result.attack_name
                ?.toLowerCase()
                .includes(value)
              ||

              result.owasp_category
                ?.toLowerCase()
                .includes(value)
              ||

              result.provider
                ?.toLowerCase()
                .includes(value)
              ||

              result.model
                ?.toLowerCase()
                .includes(value)
              ||

              result.trace_id
                ?.toLowerCase()
                .includes(value)
              ||

              result.campaign_id
                ?.toLowerCase()
                .includes(value)
            );
          }
        );
      },
      [
        results,
        search,
      ]
    );


  // ============================================================
  // OPEN RESULT
  // ============================================================

  async function handleSelectResult(
    result
  ) {
    if (!result) {
      return;
    }


    setError("");


    // ========================================================
    // NEW TEST WITH TRACE
    // ========================================================

    if (result.trace_id) {

      setTraceLoading(
        true
      );


      try {

        const trace =
          await getAttackTrace(
            result.trace_id
          );


        setSelectedResult(
          null
        );


        setSelectedTrace(
          trace
        );

      } catch (err) {

        console.error(
          err
        );


        setError(
          err.message ||
          (
            isFrench
              ? "Impossible de charger la trace détaillée."
              : "Unable to load the detailed trace."
          )
        );


        // Fallback:
        // show old history modal.

        setSelectedResult(
          result
        );

      } finally {

        setTraceLoading(
          false
        );
      }


      return;
    }


    // ========================================================
    // LEGACY TEST WITHOUT TRACE
    // ========================================================

    setSelectedTrace(
      null
    );


    setSelectedResult(
      result
    );
  }


  // ============================================================
  // REFRESH
  // ============================================================

  async function handleRefresh() {
    setError("");


    if (!onRefresh) {
      return;
    }


    try {

      await onRefresh();

    } catch (err) {

      console.error(
        err
      );


      setError(
        isFrench
          ? "Impossible d'actualiser l'historique."
          : "Unable to refresh history."
      );
    }
  }


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>

      {/* ======================================================
          PAGE HEADER
          ====================================================== */}

      <div className="page-header">

        <div>

          <span className="eyebrow">
            {
              isFrench
                ? "HISTORIQUE POSTGRESQL"
                : "POSTGRESQL HISTORY"
            }
          </span>


          <h1>
            {
              isFrench
                ? "Historique des tests de sécurité"
                : "Security Test History"
            }
          </h1>


          <p>
            {
              isFrench
                ? (
                    "Consultez chaque évaluation de sécurité LLM "
                    + "enregistrée et ouvrez sa trace complète."
                  )
                : (
                    "Inspect every recorded LLM security evaluation "
                    + "and open its complete trace."
                  )
            }
          </p>

        </div>


        <button
          type="button"
          className="secondary-button"

          onClick={
            handleRefresh
          }
        >
          <RefreshCw
            size={17}
          />

          {
            isFrench
              ? "Actualiser"
              : "Refresh"
          }
        </button>

      </div>


      {/* ======================================================
          ERROR
          ====================================================== */}

      {
        error &&
        (
          <div className="error-banner">

            <AlertTriangle
              size={18}
            />

            <span>
              {error}
            </span>

          </div>
        )
      }


      {/* ======================================================
          HISTORY TABLE
          ====================================================== */}

      <div className="panel">

        <div className="history-toolbar">

          <div className="search-box">

            <Search
              size={18}
            />


            <input
              type="text"

              value={
                search
              }

              onChange={
                (event) =>
                  setSearch(
                    event.target.value
                  )
              }

              placeholder={
                isFrench
                  ? (
                      "Rechercher une attaque, OWASP, modèle, "
                      + "Trace ID ou Campaign ID..."
                    )
                  : (
                      "Search attack, OWASP, model, "
                      + "Trace ID or Campaign ID..."
                    )
              }
            />

          </div>


          <span className="result-count">

            {
              filteredResults.length
            }

            {" "}

            {
              isFrench
                ? "résultats"
                : "results"
            }

          </span>

        </div>


        <ResultsTable
          results={
            filteredResults
          }

          onSelect={
            handleSelectResult
          }
        />

      </div>


      {/* ======================================================
          LEGACY RESULT MODAL
          ====================================================== */}

      <ResultModal
        result={
          selectedResult
        }

        onClose={() =>
          setSelectedResult(
            null
          )
        }
      />


      {/* ======================================================
          TRACE LOADING
          ====================================================== */}

      {
        traceLoading &&
        (
          <div className="trace-history-loading">

            <RefreshCw
              size={25}
              className="spin"
            />


            <span>
              {
                isFrench
                  ? "Chargement de la trace complète..."
                  : "Loading complete trace..."
              }
            </span>

          </div>
        )
      }


      {/* ======================================================
          COMPLETE TRACE VIEWER
          ====================================================== */}

      {
        selectedTrace &&
        (
          <TraceViewer
            trace={
              selectedTrace
            }

            onClose={() =>
              setSelectedTrace(
                null
              )
            }
          />
        )
      }

    </>
  );
}
