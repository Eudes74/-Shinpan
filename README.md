# Shinpan — Sistema de Avaliação de Arbitragem de Judô

Aplicação React + TypeScript + Tailwind CSS para registro de avaliações à beira do tatame.

## Executar localmente

Instale as dependências com `npm install` e inicie o servidor com `npm run dev`. Para gerar a versão de produção use `npm run build`.

## Funcionalidades atuais

- Identificação do candidato, categoria, avaliador, evento e tatame.
- Formulário com 20 cartões de combate (01–20) em todas as telas, sem tabela estilo folha impressa. Cada cartão tem seleção de função Central/Lateral/Vídeo, botão para registar infrações, tags descritivas removíveis, subtotal e checkbox Concluído / Visto.
- Seleção rápida por nome em um modal com quatro blocos: leves (azul, −2), médias (amarelo, −5), graves (laranja, −10) e gravíssimas (vermelho, −20). Um toque registra a ocorrência e fecha o modal. Infrações repetidas são acumuladas, sem o limite antigo por critério; o × da tag remove uma ocorrência.
- Cabeçalho fixo durante a rolagem com pontuação, status provisório/final e contadores por gravidade. Ao acumular duas ou mais faltas gravíssimas, exibe o alerta vermelho piscante REPROVAÇÃO AUTOMÁTICA (2+ Faltas Gravíssimas), respeitando a preferência por movimento reduzido.
- Finalização liberada somente após definir a função e dar o visto nos 20 combates, mesmo nos combates sem faltas; alterações nas faltas ou na função retiram o visto da linha.
- Relatório com a ficha completa, ocorrências por combate e possibilidade de retomar ou iniciar outra avaliação.
- Impressão do relatório ou salvamento em PDF pela janela de impressão do navegador; resumo formatado para compartilhamento pelo WhatsApp (requer internet).
- Salvamento automático no armazenamento local do navegador; após o primeiro carregamento da versão publicada, os arquivos essenciais são armazenados para acesso offline.

## Regras de apuração

A pontuação é exatamente 100 menos a soma das deduções dos 20 combates: leves −2, médias −5, graves −10 e gravíssimas −20 por ocorrência. Não há piso artificial na pontuação. Duas ou mais ocorrências gravíssimas (inclusive do mesmo critério e na mesma luta) acionam **Reprovação Automática**; faltas graves não são contadas como GG.

Conforme os limites solicitados, o status indica **Aprovado FIJ** com 85 pontos ou mais, **Aprovado CBJ** de 80 a 84 pontos e **Reprovado** abaixo de 80 pontos. A reprovação automática por duas ou mais gravíssimas prevalece sobre a pontuação. O status é provisório até a validação dos 20 combates; as mesmas regras aparecem no relatório e no resumo compartilhado.

## Compatibilidade dos registros

O novo registro por luta utiliza a chave local `shinpan-avaliacao-v2`. Havendo somente uma avaliação antiga, os dados de identificação são reaproveitados, mas as ocorrências não são convertidas, pois o modelo anterior não identifica o combate nem os novos códigos. O registro antigo em `shinpan-avaliacao-v1` não é apagado; o aplicativo exibe um aviso ao avaliador.
