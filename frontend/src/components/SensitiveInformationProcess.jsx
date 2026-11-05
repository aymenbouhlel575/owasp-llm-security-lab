import {
  createSensitiveInformationCampaign,
  getSensitiveInformationCampaign,
  getSensitiveInformationScenarios,
  runSensitiveInformationScenario,
} from "../api";

import GenericSecurityCampaign
  from "./GenericSecurityCampaign";


export default function SensitiveInformationProcess({
  onCompleted,
}) {
  return (
    <GenericSecurityCampaign
      code="LLM02"

      title="Sensitive Information Disclosure"

      titleFr="Divulgation d'informations sensibles"

      description={
        "Tests whether adversarial prompts can make the target reveal synthetic secrets or protected information."
      }

      descriptionFr={
        "Teste si des prompts adversariaux peuvent provoquer la divulgation de secrets synthétiques ou d'informations protégées."
      }

      loadScenarios={
        getSensitiveInformationScenarios
      }

      createCampaign={
        createSensitiveInformationCampaign
      }

      runScenario={
        runSensitiveInformationScenario
      }

      getCampaign={
        getSensitiveInformationCampaign
      }

      onCompleted={
        onCompleted
      }
    />
  );
}
