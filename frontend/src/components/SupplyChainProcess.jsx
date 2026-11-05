import {
  createSupplyChainCampaign,
  getSupplyChainCampaign,
  getSupplyChainScenarios,
  runSupplyChainScenario,
} from "../api";

import GenericSecurityCampaign
  from "./GenericSecurityCampaign";


export default function SupplyChainProcess({
  onCompleted,
}) {
  return (
    <GenericSecurityCampaign
      code="LLM03"

      title="Supply Chain"

      titleFr="Chaîne d'approvisionnement"

      description={
        "Tests model, package, dependency and AI artifact provenance and integrity decisions."
      }

      descriptionFr={
        "Teste la provenance et l'intégrité des modèles, packages, dépendances et artefacts IA."
      }

      loadScenarios={
        getSupplyChainScenarios
      }

      createCampaign={
        createSupplyChainCampaign
      }

      runScenario={
        runSupplyChainScenario
      }

      getCampaign={
        getSupplyChainCampaign
      }

      onCompleted={
        onCompleted
      }
    />
  );
}
