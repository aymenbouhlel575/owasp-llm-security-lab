import {
  createUnboundedConsumptionCampaign,
  getUnboundedConsumptionCampaign,
  getUnboundedConsumptionScenarios,
  runUnboundedConsumptionScenario,
} from "../api";

import GenericSecurityCampaign
  from "./GenericSecurityCampaign";


export default function UnboundedConsumptionProcess({
  onCompleted,
}) {
  return (
    <GenericSecurityCampaign
      code="LLM10"
      title="Unbounded Consumption"
      titleFr="Consommation non limit\u00e9e"
      description="Tests unbounded tokens, recursion, tool calls, batch size and concurrency."
      descriptionFr="Teste les consommations non limit\u00e9es de tokens, r\u00e9cursion, outils, batchs et concurrence."
      loadScenarios={
        getUnboundedConsumptionScenarios
      }
      createCampaign={
        createUnboundedConsumptionCampaign
      }
      runScenario={
        runUnboundedConsumptionScenario
      }
      getCampaign={
        getUnboundedConsumptionCampaign
      }
      onCompleted={
        onCompleted
      }
    />
  );
}
