import {
  createPromptInjectionCampaign,
  getPromptInjectionCampaign,
  getPromptInjectionScenarios,
  runPromptInjectionScenario,
} from "../api";

import GenericSecurityCampaign
  from "./GenericSecurityCampaign";


export default function AttackProcess({
  onCompleted,
}) {
  return (
    <GenericSecurityCampaign
      code="LLM01"

      title="Prompt Injection"

      titleFr="Injection de prompt"

      description={
        "Tests whether dynamically generated adversarial instructions can override trusted system policies."
      }

      descriptionFr={
        "Teste si des instructions adversariales générées dynamiquement peuvent contourner les politiques système de confiance."
      }

      loadScenarios={
        getPromptInjectionScenarios
      }

      createCampaign={
        createPromptInjectionCampaign
      }

      runScenario={
        runPromptInjectionScenario
      }

      getCampaign={
        getPromptInjectionCampaign
      }

      onCompleted={
        onCompleted
      }
    />
  );
}
