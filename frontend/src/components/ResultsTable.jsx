import { Eye } from "lucide-react";


export default function ResultsTable({
  results,
  onSelect,
}) {
  if (!results.length) {
    return (
      <div className="empty-state">
        Aucun test de sécurité enregistré.
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="results-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Attack</th>
            <th>OWASP</th>
            <th>Model</th>
            <th>Status</th>
            <th>Severity</th>
            <th>Date</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {results.map((result) => (
            <tr key={result.id}>
              <td className="muted">
                #{result.id}
              </td>

              <td>
                <strong>{result.attack_name}</strong>
              </td>

              <td>
                <span className="owasp-tag">
                  {result.owasp_category.split(" ")[0]}
                </span>
              </td>

              <td className="model-cell">
                {result.model}
              </td>

              <td>
                {result.attack_success ? (
                  <span className="status-badge dangerous">
                    ATTACK SUCCEEDED
                  </span>
                ) : (
                  <span className="status-badge safe">
                    BLOCKED
                  </span>
                )}
              </td>

              <td>
                <span
                  className={`severity severity-${result.severity}`}
                >
                  {result.severity}
                </span>
              </td>

              <td className="muted">
                {new Date(
                  result.created_at
                ).toLocaleString()}
              </td>

              <td>
                <button
                  className="icon-button"
                  onClick={() => onSelect(result)}
                >
                  <Eye size={17} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
