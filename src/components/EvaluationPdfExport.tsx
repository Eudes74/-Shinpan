import { useEffect, useRef, useState } from 'react';
import { ExternalLink, FileDown, Loader2 } from 'lucide-react';
import type { Fight } from '../data/errors';
import { getResult, type ReportForm } from '../data/report';
import type { EvaluationPdf } from '../lib/evaluationPdf';

type Props = { form: ReportForm; fights: Fight[]; notes: string };
type Download = EvaluationPdf & { url: string };

export default function EvaluationPdfExport({ form, fights, notes }: Props) {
  const [download, setDownload] = useState<Download | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const mounted = useRef(true);
  const complete = getResult(fights).complete;
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => () => { if (download) URL.revokeObjectURL(download.url); }, [download]);
  // Never offer an out-of-date document after evaluation data changes.
  useEffect(() => { setDownload(null); setError(''); }, [form, fights, notes]);

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
    </div>}
  </section>;
}
