# Shinpan — Sistema de Avaliação de Arbitragem de Judô

Aplicação React + TypeScript + Tailwind CSS para registro de avaliações à beira do tatame.

## Executar localmente

Instale as dependências com `npm install` e inicie o servidor com `npm run dev`. Para gerar a versão de produção use `npm run build`.

## Funcionalidades atuais

- Identificação do candidato, categoria, avaliador, evento e tatame.
- Ficha densa com 20 combates fixos (01–20), função única Central/Lateral/Vídeo, dedução por luta e visto do avaliador.
- Códigos L1–L3, G1–G4 e GG1–GG4 com marcação individual; médias acumuladas por critério: Shido (M2, 0–5), Waza-ari (M1, 0–3), Mate (M3, 0–3) e Replay (M4, 0–3). Nas médias, selecionar um número define a quantidade; selecionar novamente o mesmo número zera o critério.
- Resumo em tempo real com pontuação, contadores por gravidade e alerta de Reprovação Automática quando GG ≥ 2.
- Finalização liberada somente após definir a função e dar o visto nos 20 combates, mesmo nos combates sem faltas; alterações nas faltas ou na função retiram o visto da linha.
- Relatório com a ficha completa, ocorrências por combate e possibilidade de retomar ou iniciar outra avaliação.
- Impressão do relatório ou salvamento em PDF pela janela de impressão do navegador; resumo formatado para compartilhamento pelo WhatsApp (requer internet).
- Salvamento automático no armazenamento local do navegador; após o primeiro carregamento da versão publicada, os arquivos essenciais são armazenados para acesso offline.

## Regras de apuração

A pontuação é exatamente 100 menos a soma das deduções dos 20 combates: leves −2, médias −5, graves −10 e gravíssimas −20 por ocorrência. Não há piso artificial na pontuação. Duas ou mais ocorrências gravíssimas (inclusive em uma mesma luta, em códigos diferentes) acionam **Reprovação Automática**; faltas graves não são contadas como GG.

A matriz fornecida não informa notas mínimas por categoria nem critérios de reteste. Por isso, sem eliminação por GG, o relatório indica **Avaliação concluída**, e não aprovação automática. As categorias permanecem na identificação do candidato.

## Compatibilidade dos registros

O novo registro por luta utiliza a chave local `shinpan-avaliacao-v2`. Havendo somente uma avaliação antiga, os dados de identificação são reaproveitados, mas as ocorrências não são convertidas, pois o modelo anterior não identifica o combate nem os novos códigos. O registro antigo em `shinpan-avaliacao-v1` não é apagado; o aplicativo exibe um aviso ao avaliador.
