import {
  createDataModelPoisoningCampaign,
  getDataModelPoisoningCampaign,
  getDataModelPoisoningScenarios,
  runDataModelPoisoningScenario,
} from "../api";

import GenericSecurityCampaign
  from "./GenericSecurityCampaign";


export default function DataModelPoisoningProcess({
  onCompleted,
}) {
  return (
    <GenericSecurityCampaign
      code="LLM04"
      title="Data and Model Poisoning"
      titleFr="Empoisonnement des donn\u00e9es et du mod\u00e8le"
      description="Tests poisoned datasets, labels, RAG documents, benchmarks and model behaviour updates."
      descriptionFr="Teste les jeux de donn\u00e9es, labels, documents RAG, benchmarks et mises \u00e0 jour de mod\u00e8les empoisonn\u00e9s."
      loadScenarios={
        getDataModelPoisoningScenarios
      }
      createCampaign={
        createDataModelPoisoningCampaign
      }
      runScenario={
        runDataModelPoisoningScenario
      }
      getCampaign={
        getDataModelPoisoningCampaign
      }
      onCompleted={
        onCompleted
      }
    />
  );
}
