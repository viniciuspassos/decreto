/** Reuses the closest available policy artwork until an event-specific image is uploaded. */
export const eventImageAliases = [
  { eventName: "school-shooting", fileLocation: "porte-livre/porte-livre.png" },
  { eventName: "wrongful-execution", fileLocation: "pena-de-morte/pena-de-morte.png" },
  { eventName: "currency-crisis", fileLocation: "controle-de-precos/controle-de-precos.png" },
  { eventName: "general-strike", fileLocation: "proibicao-greves/proibicao-greves.png" },
  { eventName: "epidemic", fileLocation: "remedios-gratuitos/remedios-gratuitos.png" },
  { eventName: "morality-police-incident", fileLocation: "lei-religiosa/lei-religiosa.png" },
  { eventName: "environmental-disaster", fileLocation: "fim-leis-ambientais/fim-leis-ambientais.png" },
  { eventName: "natural-disaster", fileLocation: "protecao-de-reservas/protecao-de-reservas.png" },
  { eventName: "leader-statue-toppled", fileLocation: "estatuas-obrigatorias/estatuas-obrigatorias.png" },
  { eventName: "international-sanctions", fileLocation: "prisao-oposicao/prisao-oposicao.png" },
  { eventName: "mass-protests", fileLocation: "comicio/palanque.png" },
  { eventName: "infrastructure-collapse", fileLocation: "estado-minimo/estado-minimo.png" },
  { eventName: "attack-foiled", fileLocation: "atentado/tentativa.png" },
  { eventName: "attack-fatal", fileLocation: "morte/velorio-oficial.png" },
  { eventName: "coup", fileLocation: "golpe-militar/golpe-militar.png" },
  { eventName: "revolution", fileLocation: "comicio/palanque.png" },
] as const;
