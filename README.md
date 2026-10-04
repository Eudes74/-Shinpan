# Shinpan — Sistema de Avaliação de Arbitragem de Judô

Aplicação React + TypeScript + Tailwind CSS para registro de avaliações à beira do tatame.

## Executar localmente

Instale as dependências com `npm install` e inicie o servidor com `npm run dev`. Para gerar a versão de produção use `npm run build`.

## Funcionalidades atuais

- Identificação do candidato, categoria, avaliador, evento e tatame.
- Checklist por abas com contadores de ocorrências, dedução automática de pontos e alerta de veto.
- Devolutiva por categoria com resultado, critérios de aprovação, pontos fortes e ocorrências detalhadas; possibilidade de retomar ou iniciar outra avaliação.
- Impressão do relatório ou salvamento em PDF pela janela de impressão do navegador; resumo formatado para compartilhamento pelo WhatsApp (requer internet).
- Salvamento automático no armazenamento local do navegador; após o primeiro carregamento da versão publicada, os arquivos essenciais são armazenados para acesso offline.

## Régua de resultado

Regional: mínimo de 70 pontos e até 4 ocorrências médias. Estadual: mínimo de 80 pontos e até 3 médias. Nacional e FIJ: mínimo de 90 pontos, até 1 média e nenhum erro grave. Em todas as categorias, qualquer grave de segurança ou duas ocorrências graves de regra geram veto e reprovação. Sem veto, ficar até 5 pontos abaixo do corte ou exceder em 1 o limite de médias gera **Em observação / Reteste**; diferenças maiores geram **Reprovado**.
