import { useEffect, useRef, useState } from 'react';
import { Plus, ShieldAlert, X } from 'lucide-react';
import { errors, fightDeduction, fightTotal, points, roleLabels, severityLabels, type ErrorItem, type Fight, type Role, type Severity } from '../data/errors';
import { getResult } from '../data/report';

type Props = {
  fights: Fight[];
  onChange: (index: number, fight: Fight) => void;
  readOnly?: boolean;
};
const severities: Severity[] = ['leve', 'medio', 'grave', 'gravissimo'];
const groupLabels: Record<Severity, string> = { leve: 'Faltas leves', medio: 'Faltas médias', grave: 'Faltas graves', gravissimo: 'Faltas gravíssimas' };

function ErrorPicker({ fight, onSelect, onClose }: { fight: Fight; onSelect: (item: ErrorItem) => void; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => { dialog?.close(); };
  }, []);
  return <dialog ref={dialogRef} className="error-picker" aria-labelledby="picker-title" aria-describedby="picker-help" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="picker-content">
      <header className="picker-header"><div><span>LUTA {String(fight.number).padStart(2, '0')} · {roleLabels[fight.role]}</span><h2 id="picker-title">Adicionar Falha / Erro</h2><p id="picker-help">Toque no nome da infração para registrar uma ocorrência e voltar à luta.</p></div><button type="button" className="picker-close" aria-label="Fechar seleção de infração" onClick={onClose}><X size={22} /></button></header>
      <div className="picker-groups">{severities.map(severity => <section key={severity} className={`picker-group tone-${severity}`} aria-labelledby={`group-${severity}`}>
        <h3 id={`group-${severity}`}><span>{groupLabels[severity]}</span><small>−{points[severity]} pts cada</small></h3>
        <div className="picker-options">{errors.filter(item => item.severity === severity).map(item => <button key={item.id} type="button" onClick={() => onSelect(item)}><span>{item.label}</span><Plus size={19} aria-hidden="true" /></button>)}</div>
      </section>)}</div>
      <footer className="picker-footer">Cada toque adiciona uma ocorrência. Para repetir a mesma infração, abra novamente; para corrigir, use o × na tag.</footer>
    </div>
  </dialog>;
}

export default function EvaluationSheet({ fights, onChange, readOnly = false }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const result = getResult(fights);
  const totals = [result.light, result.medium, result.grave, result.gravissimo];
  const activeFight = activeIndex === null ? undefined : fights[activeIndex];
  const setCount = (index: number, id: string, value: number) => {
    const fight = fights[index];
    onChange(index, { ...fight, counts: { ...fight.counts, [id]: Math.max(0, value) }, verified: false });
  };
  return <section className={`evaluation-sheet ${readOnly ? 'sheet-readonly' : ''}`} aria-label="Ficha de avaliação prática">
    <div className="sheet-summary">
      <div className="sheet-score"><span>Pontuação atual</span><strong aria-live="polite" aria-atomic="true">{result.score}<small> / 100</small></strong><span>100 − {result.deduction} em deduções</span></div>
      <div className="sheet-totals" aria-label="Contagem de faltas por gravidade">{severities.map((severity, i) => <div key={severity} className={`sheet-total total-${severity}`}><span>{severityLabels[severity]}s (−{points[severity]})</span><strong>{totals[i]}</strong></div>)}</div>
      <div className="sheet-progress"><strong>{result.validated} / {fightTotal}</strong><span>combates validados</span></div>
    </div>
    {result.veto && <div className={`sheet-alert ${readOnly ? '' : 'sheet-alert-fixed'}`} role="alert"><ShieldAlert size={25} /><div><strong>REPROVAÇÃO AUTOMÁTICA (2+ Faltas Gravíssimas)</strong><p>{result.gravissimo} ocorrências gravíssimas no total da avaliação, mesmo em lutas diferentes.</p></div></div>}
    <div className="sheet-title"><div><h2>SHINPAN · AVALIAÇÃO PRÁTICA</h2><p>Matriz Regulamentar FIJ / CBJ · 20 combates · Pontuação inicial: 100 pontos</p></div><span>VISÃO GERAL DOS COMBATES</span></div>
    {!readOnly && <p className="sheet-instructions">Selecione a função, adicione as falhas pelo nome e dê o visto ao concluir a luta. O × remove uma ocorrência. Alterar a função ou as falhas retira o visto.</p>}
    <table className="combat-table">
      <caption className="sr-only">20 combates com função, infrações por nome, pontos perdidos e visto do avaliador</caption>
      <thead><tr><th scope="col">Luta</th><th scope="col">Função do árbitro</th><th scope="col">Falhas / Erros registrados</th><th scope="col">Pontos perdidos</th><th scope="col">Validado / Visto</th></tr></thead>
      <tbody>{fights.map((fight, index) => {
        const deduction = fightDeduction(fight);
        const recorded = errors.filter(item => (fight.counts[item.id] ?? 0) > 0);
        return <tr key={fight.number} className={fight.verified ? 'combat-verified' : ''}>
          <th scope="row" className="combat-number"><span>Luta</span>{String(fight.number).padStart(2, '0')}</th>
          <td className="combat-role">{readOnly ? roleLabels[fight.role] : <select className="combat-role-select" aria-label={`Função do árbitro na luta ${fight.number}`} value={fight.role} onChange={event => onChange(index, { ...fight, role: event.target.value as Role, verified: false })}><option value="">Selecionar função</option>{(['C', 'L', 'V'] as const).map(role => <option key={role} value={role}>{roleLabels[role]}</option>)}</select>}</td>
          <td className="combat-record">
            {!readOnly && <button type="button" className="combat-add" aria-label={`Adicionar Falha / Erro na luta ${fight.number}`} aria-haspopup="dialog" onClick={() => setActiveIndex(index)}><Plus size={18} aria-hidden="true" />Adicionar Falha / Erro</button>}
            {recorded.length ? <ul className="combat-tags">{recorded.map(item => <li key={item.id} className={`combat-tag tone-${item.severity}`}><span>{item.label}{fight.counts[item.id] > 1 && <b> ×{fight.counts[item.id]}</b>}<small> −{points[item.severity] * fight.counts[item.id]} pts</small></span>{!readOnly && <button type="button" aria-label={`Remover uma ocorrência de ${item.label} da luta ${fight.number}`} title="Remover uma ocorrência" onClick={() => setCount(index, item.id, fight.counts[item.id] - 1)}><X size={16} aria-hidden="true" /></button>}</li>)}</ul> : <p className="combat-empty">Nenhuma falha registrada</p>}
          </td>
          <td className="combat-deduction"><strong>{deduction ? `−${deduction}` : '0'} <small>pts</small></strong></td>
          <td className="combat-validation">{readOnly ? (fight.verified ? '✓ Validado' : 'Pendente') : <label><input type="checkbox" className="sheet-check" checked={fight.verified} disabled={!fight.role} title={fight.role ? 'Validar este combate' : 'Selecione a função antes de validar'} aria-label={`Validado / Visto da luta ${fight.number}`} onChange={event => onChange(index, { ...fight, verified: event.target.checked })} /><span>Validado/Visto</span></label>}</td>
        </tr>;
      })}</tbody>
      <tfoot><tr><th colSpan={3} scope="row">Total de deduções · {result.validated} de {fightTotal} combates validados</th><td className="combat-deduction">−{result.deduction} pts</td><td>{result.validated}/{fightTotal}</td></tr></tfoot>
    </table>
    <p className="sheet-key">O visto confirma o registro do combate, inclusive quando não há faltas. Duas ou mais ocorrências gravíssimas em toda a avaliação causam reprovação automática.</p>
    <details className="matrix-details"><summary>Consultar critérios e descontos por infração</summary><div className="sheet-scroll"><table className="matrix-table"><thead><tr><th>Classificação</th><th>Infração</th><th>Desconto por ocorrência</th></tr></thead><tbody>{errors.map(item => <tr key={item.id} className={`matrix-${item.severity}`}><th scope="row">{severityLabels[item.severity]}</th><td>{item.label}</td><td>−{points[item.severity]} pts</td></tr>)}</tbody></table></div></details>
    <aside className="sheet-protocol"><strong>PROTOCOLO DE VÍDEO REPLAY / CARE SYSTEM</strong><p>Registrar o lance duvidoso, consultar as imagens quando necessário, alinhar a decisão entre Árbitro Central e Mesa de Vídeo e justificar tecnicamente a correção.</p></aside>
    {!readOnly && activeFight && activeIndex !== null && <ErrorPicker fight={activeFight} onClose={() => setActiveIndex(null)} onSelect={item => { setCount(activeIndex, item.id, (activeFight.counts[item.id] ?? 0) + 1); setActiveIndex(null); }} />}
  </section>;
}
