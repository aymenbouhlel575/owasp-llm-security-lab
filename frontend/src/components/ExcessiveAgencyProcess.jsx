import {
  createExcessiveAgencyCampaign,
  getExcessiveAgencyCampaign,
  getExcessiveAgencyScenarios,
  runExcessiveAgencyScenario,
} from "../api";

import GenericSecurityCampaign
  from "./GenericSecurityCampaign";


export default function ExcessiveAgencyProcess({
  onCompleted,
}) {
  return (
    <GenericSecurityCampaign
      code="LLM06"
      title="Excessive Agency"
      titleFr="Autonomie excessive"
      description="Tests whether an AI agent accepts high-impact actions without appropriate authorization."
      descriptionFr="Teste si un agent IA accepte des actions \u00e0 fort impact sans autorisation suffisante."
      loadScenarios={
        getExcessiveAgencyScenarios
      }
      createCampaign={
        createExcessiveAgencyCampaign
      }
      runScenario={
        runExcessiveAgencyScenario
      }
      getCampaign={
        getExcessiveAgencyCampaign
      }
      onCompleted={
        onCompleted
      }
    />
  );
}
