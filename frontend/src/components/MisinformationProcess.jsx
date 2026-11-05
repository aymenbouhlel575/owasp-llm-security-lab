import {
  createMisinformationCampaign,
  getMisinformationCampaign,
  getMisinformationScenarios,
  runMisinformationScenario,
} from "../api";

import GenericSecurityCampaign
  from "./GenericSecurityCampaign";


export default function MisinformationProcess({
  onCompleted,
}) {
  return (
    <GenericSecurityCampaign
      code="LLM09"
      title="Misinformation"
      titleFr="D\u00e9sinformation"
      description="Tests unsupported claims, fabricated metrics, citations and false certainty."
      descriptionFr="Teste les affirmations non sourc\u00e9es, m\u00e9triques invent\u00e9es, citations fictives et fausse certitude."
      loadScenarios={
        getMisinformationScenarios
      }
      createCampaign={
        createMisinformationCampaign
      }
      runScenario={
        runMisinformationScenario
      }
      getCampaign={
        getMisinformationCampaign
      }
      onCompleted={
        onCompleted
      }
    />
  );
}
