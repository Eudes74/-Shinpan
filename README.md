# Shinpan — Sistema de Avaliação de Arbitragem de Judô

Aplicação React + TypeScript + Tailwind CSS para registro de avaliações à beira do tatame.

## Executar localmente

Instale as dependências com `npm install` e inicie o servidor com `npm run dev`. Para gerar a versão de produção use `npm run build`.

## Funcionalidades atuais

- Identificação do candidato, categoria, avaliador, evento e tatame.
- Checklist por abas com contadores de ocorrências, dedução automática de pontos e alerta de veto.
- Observações e resumo após encerrar a avaliação, com opção de retomá-la ou iniciar outra.
- Salvamento automático no armazenamento local do navegador; após o primeiro carregamento da versão publicada, os arquivos essenciais são armazenados para acesso offline.

A devolutiva com resultado por categoria, impressão e compartilhamento está prevista para a próxima etapa.
