import {
  createImproperOutputCampaign,
  getImproperOutputCampaign,
  getImproperOutputScenarios,
  runImproperOutputScenario,
} from "../api";

import GenericSecurityCampaign
  from "./GenericSecurityCampaign";


export default function ImproperOutputHandlingProcess({
  onCompleted,
}) {
  return (
    <GenericSecurityCampaign
      code="LLM05"
      title="Improper Output Handling"
      titleFr="Mauvaise gestion des sorties"
      description="Tests unsafe model outputs before downstream use."
      descriptionFr="Teste les sorties dangereuses avant leur utilisation par un syst\u00e8me externe."
      loadScenarios={
        getImproperOutputScenarios
      }
      createCampaign={
        createImproperOutputCampaign
      }
      runScenario={
        runImproperOutputScenario
      }
      getCampaign={
        getImproperOutputCampaign
      }
      onCompleted={
        onCompleted
      }
    />
  );
}
