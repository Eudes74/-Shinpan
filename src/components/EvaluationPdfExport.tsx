import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ExternalLink, FileDown, Loader2, Mail } from 'lucide-react';
import type { Fight } from '../data/errors';
import { formatEventDate } from '../data/events';
import { approvalLabels, getResult, type ReportForm } from '../data/report';
import type { EvaluationPdf } from '../lib/evaluationPdf';

type Props = { form: ReportForm; fights: Fight[]; notes: string; onCandidateEmailChange: (email: string) => void };
type Download = EvaluationPdf & { url: string };

export default function EvaluationPdfExport({ form, fights, notes, onCandidateEmailChange }: Props) {
  const [download, setDownload] = useState<Download | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [emailNotice, setEmailNotice] = useState('');
  const mounted = useRef(true);
  const result = getResult(fights);
  const complete = result.complete;
  // The recipient is not printed in the PDF; correcting it must keep the download available.
  const pdfSource = JSON.stringify({ form: { ...form, candidateEmail: undefined }, fights, notes });
  const subject = `SHINPAN | Ficha de Avaliação de Arbitragem - ${form.candidate}`.replace(/[\r\n]+/g, ' ');
  const body = [
    `Olá, ${form.candidate}.`,
    '',
    'Segue a ficha individual de avaliação de arbitragem finalizada no sistema SHINPAN.',
    `Evento / Competição: ${form.event || 'Não informado'}`,
    `Local: ${form.eventLocation || 'Não informado'}`,
    `Data: ${formatEventDate(form.date || form.eventStartDate) || 'Não informada'} | Tatame / Área: ${form.tatami}`,
    `Categoria / Exame: ${form.current} → ${form.target}`,
    `Nota final: ${result.score} / 100 | Deduções: ${result.deduction} pontos`,
    `Resultado: ${approvalLabels[result.approval]}`,
    `Documento: ${download?.filename || ''}`,
    '',
    'Atenciosamente,',
    form.evaluator || 'Equipe SHINPAN',
    form.evaluatorRole || '',
  ].filter((line, index, lines) => line !== '' || lines[index - 1] !== '').join('\r\n');
  const message = `Para: ${(form.candidateEmail || '').trim()}\r\nAssunto: ${subject}\r\n\r\n${body}`;
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => () => { if (download) URL.revokeObjectURL(download.url); }, [download]);
  // Never offer an out-of-date document after evaluation data changes.
  useEffect(() => { setDownload(null); setError(''); setEmailNotice(''); }, [pdfSource]);
  useEffect(() => { setEmailNotice(''); }, [form.candidateEmail]);

  const prepareEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!download || !complete || !event.currentTarget.reportValidity()) return;
    const recipient = (form.candidateEmail || '').trim();
    if (!recipient) return;
    try {
      window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setEmailNotice('A abertura do seu aplicativo de e-mail foi solicitada. Anexe o PDF baixado e confirme o envio no aplicativo. O SHINPAN não confirma nem realiza o envio. Se nada abrir, use a mensagem abaixo no seu webmail.');
    } catch {
      setEmailNotice('Não foi possível abrir o aplicativo de e-mail. Use a mensagem abaixo no seu webmail e anexe o PDF baixado manualmente.');
    }
  };

  const generate = async () => {
    if (generating || !complete) return;
    setGenerating(true);
    setError('');
    try {
      const { generateEvaluationPdf } = await import('../lib/evaluationPdf');
      if (!mounted.current) return;
      const pdf = generateEvaluationPdf(form, fights, notes);
      const url = URL.createObjectURL(pdf.blob);
      setDownload({ ...pdf, url });
    } catch {
      if (mounted.current) setError('Não foi possível gerar o PDF. Tente novamente e, se o problema continuar, recarregue a página. A avaliação salva neste navegador será mantida.');
    } finally {
      if (mounted.current) setGenerating(false);
    }
  };

  return <section className="no-print mt-8 rounded-2xl border border-indigo-400/30 bg-panel p-5 sm:p-7" aria-labelledby="pdf-export-title" aria-busy={generating}>
    <h2 id="pdf-export-title" className="text-lg font-bold text-white">Ficha oficial em PDF</h2>
    <p className="mt-2 text-sm leading-relaxed text-slate-400">Documento A4 com fundo branco, dados do evento, identificação, resultado, todas as lutas e campos para assinaturas. A geração não envia seus dados a um servidor.</p>
    <button type="button" onClick={generate} disabled={generating || !complete} className="primary-button mt-5 disabled:opacity-40">
      {generating ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <FileDown size={18} aria-hidden="true" />}
      {generating ? 'Gerando PDF...' : download ? 'Gerar PDF novamente' : 'Gerar Ficha em PDF'}
    </button>
    {!complete && <p className="mt-3 text-sm text-amber-300">Conclua e valide os 20 combates para exportar a ficha final.</p>}
    {error && <p className="mt-4 text-sm text-rose-300" role="alert">{error}</p>}
    {download && <div className="mt-5 border-t border-line pt-5">
      <p className="text-sm font-semibold text-emerald-300" role="status">PDF gerado com sucesso · {download.pages} páginas · {Math.max(1, Math.ceil(download.blob.size / 1024))} KB</p>
      <p className="mt-2 break-all text-xs text-slate-400">{download.filename}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a href={download.url} download={download.filename} className="primary-button"><FileDown size={18} aria-hidden="true" />Descarregar PDF</a>
        <a href={download.url} target="_blank" rel="noopener noreferrer" className="secondary-button"><ExternalLink size={18} aria-hidden="true" />Visualizar / Imprimir PDF</a>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">Guarde o arquivo no seu dispositivo. Se o navegador abrir o documento em vez de baixar, use o botão de download do visualizador.</p>
      <form onSubmit={prepareEmail} className="mt-6 border-t border-line pt-5" aria-labelledby="email-export-title">
        <h3 id="email-export-title" className="font-bold text-white">Enviar ficha ao árbitro</h3>
        <p id="email-export-help" className="mt-2 text-sm leading-relaxed text-slate-400">O endereço informado na avaliação é preenchido automaticamente e pode ser corrigido aqui. Ele fica salvo somente neste navegador, junto à avaliação.</p>
        <label htmlFor="candidate-email" className="mb-2 mt-4 block text-sm font-semibold text-slate-200">E-mail do árbitro avaliado</label>
        <input id="candidate-email" className="field max-w-xl" type="email" autoComplete="email" required maxLength={254} value={form.candidateEmail || ''} onChange={event => onCandidateEmailChange(event.target.value)} placeholder="arbitro@exemplo.com" aria-describedby="email-export-help email-attachment-help" />
        <ol id="email-attachment-help" className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-300">
          <li>Descarregue o PDF usando o botão acima.</li>
          <li>Use o atalho abaixo para abrir seu aplicativo de e-mail com destinatário, assunto e mensagem preenchidos.</li>
          <li>Anexe o PDF baixado, confira o destinatário e confirme o envio no aplicativo de e-mail.</li>
        </ol>
        <p className="mt-3 text-sm font-semibold text-amber-300">O PDF não é anexado automaticamente. Este atalho prepara a mensagem, mas não envia o e-mail.</p>
        <button type="submit" className="secondary-button mt-4"><Mail size={18} aria-hidden="true" />Enviar por E-mail ao Árbitro</button>
        {emailNotice && <p className="mt-3 text-sm leading-relaxed text-indigo-200" role="status">{emailNotice}</p>}
      </form>
      <details className="mt-5 rounded-xl border border-line p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-200">Não abriu seu e-mail? Use a mensagem no webmail</summary>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">Selecione e copie o texto abaixo para o Gmail, Outlook ou outro serviço. Preencha os campos correspondentes e lembre-se de anexar o PDF antes de enviar.</p>
        <label htmlFor="evaluation-email-message" className="mb-2 mt-3 block text-sm font-semibold text-slate-200">Destinatário, assunto e mensagem</label>
        <textarea id="evaluation-email-message" readOnly rows={12} className="field resize-y" value={message} onFocus={event => event.currentTarget.select()} />
      </details>
    </div>}
  </section>;
}
