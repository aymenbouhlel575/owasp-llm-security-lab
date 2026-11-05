import {
  createSystemPromptLeakageCampaign,
  getSystemPromptLeakageCampaign,
  getSystemPromptLeakageScenarios,
  runSystemPromptLeakageScenario,
} from "../api";

import GenericSecurityCampaign
  from "./GenericSecurityCampaign";


export default function SystemPromptLeakageProcess({
  onCompleted,
}) {
  return (
    <GenericSecurityCampaign
      code="LLM07"
      title="System Prompt Leakage"
      titleFr="Fuite du prompt syst\u00e8me"
      description="Tests whether hidden system instructions or synthetic system secrets can be disclosed."
      descriptionFr="Teste si les instructions syst\u00e8me ou secrets synth\u00e9tiques cach\u00e9s peuvent \u00eatre divulgu\u00e9s."
      loadScenarios={
        getSystemPromptLeakageScenarios
      }
      createCampaign={
        createSystemPromptLeakageCampaign
      }
      runScenario={
        runSystemPromptLeakageScenario
      }
      getCampaign={
        getSystemPromptLeakageCampaign
      }
      onCompleted={
        onCompleted
      }
    />
  );
}
