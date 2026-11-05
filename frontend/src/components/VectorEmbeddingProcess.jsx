import {
  createVectorEmbeddingCampaign,
  getVectorEmbeddingCampaign,
  getVectorEmbeddingScenarios,
  runVectorEmbeddingScenario,
} from "../api";

import GenericSecurityCampaign
  from "./GenericSecurityCampaign";


export default function VectorEmbeddingProcess({
  onCompleted,
}) {
  return (
    <GenericSecurityCampaign
      code="LLM08"
      title="Vector and Embedding Weaknesses"
      titleFr="Faiblesses des vecteurs et embeddings"
      description="Tests tenant isolation, provenance, metadata filters and vector retrieval integrity."
      descriptionFr="Teste l'isolation des tenants, la provenance, les filtres metadata et l'int\u00e9grit\u00e9 du retrieval."
      loadScenarios={
        getVectorEmbeddingScenarios
      }
      createCampaign={
        createVectorEmbeddingCampaign
      }
      runScenario={
        runVectorEmbeddingScenario
      }
      getCampaign={
        getVectorEmbeddingCampaign
      }
      onCompleted={
        onCompleted
      }
    />
  );
}
