import { ShieldAlert } from 'lucide-react';
import { errors, fightDeduction, fightTotal, points, roleLabels, severityLabels, type Fight, type Role, type Severity } from '../data/errors';
import { getResult } from '../data/report';

type Props = {
  fights: Fight[];
  onChange: (index: number, fight: Fight) => void;
  readOnly?: boolean;
};
const severities: Severity[] = ['leve', 'medio', 'grave', 'gravissimo'];
const criterion = (id: string) => errors.find(item => item.id === id)!;

function Quantity({ fight, id, max, onSet }: { fight: Fight; id: string; max: number; onSet: (id: string, value: number) => void }) {
  const value = fight.counts[id] ?? 0;
  return <div className="sheet-buttons" role="group" aria-label={`Luta ${fight.number}: ${criterion(id).label}`}>
    {Array.from({ length: max }, (_, i) => i + 1).map(n => <button key={n} type="button" className={`sheet-mark quantity-mark ${n <= value ? 'selected' : ''}`} aria-pressed={n === value} aria-label={`Luta ${fight.number}, ${id}: ${n} ocorrência${n > 1 ? 's' : ''}${n === value ? ', toque para zerar' : ''}`} title={`${criterion(id).label}: ${n} × −${points[criterion(id).severity]} pts`} onClick={() => onSet(id, value === n ? 0 : n)}>{n}</button>)}
  </div>;
}

function Codes({ fight, ids, onSet }: { fight: Fight; ids: string[]; onSet: (id: string, value: number) => void }) {
  return <div className="sheet-buttons">{ids.map(id => {
    const value = fight.counts[id] ?? 0;
    return <button key={id} type="button" className={`sheet-mark ${value ? 'selected' : ''}`} aria-pressed={value > 0} aria-label={`Luta ${fight.number}, ${id}: ${criterion(id).label}`} title={`${id} — ${criterion(id).label}`} onClick={() => onSet(id, value ? 0 : 1)}>{id.startsWith('L') ? id.slice(1) : id}</button>;
  })}</div>;
}

export default function EvaluationSheet({ fights, onChange, readOnly = false }: Props) {
  const result = getResult(fights);
  const totals = [result.light, result.medium, result.grave, result.gravissimo];
  return <section className={`evaluation-sheet ${readOnly ? 'sheet-readonly' : ''}`} aria-label="Ficha de avaliação prática">
    <div className="sheet-summary">
      <div className="sheet-score"><span>Pontuação final</span><strong aria-live="polite">{result.score}<small> / 100</small></strong><span>100 − {result.deduction} em deduções</span></div>
      <div className="sheet-totals">{severities.map((severity, i) => <div key={severity} className={`sheet-total total-${severity}`}><span>{severityLabels[severity]}s (−{points[severity]})</span><strong>{totals[i]}</strong></div>)}</div>
      <div className="sheet-progress"><strong>{result.validated} / {fightTotal}</strong><span>combates validados</span></div>
    </div>
    {result.veto && <div className="sheet-alert" role="alert"><ShieldAlert size={23} /><div><strong>Reprovação Automática</strong><p>{result.gravissimo} faltas gravíssimas registradas. Duas ou mais faltas GG implicam eliminação.</p></div></div>}
    <div className="sheet-title"><div><h2>SHINPAN · FICHA DE AVALIAÇÃO PRÁTICA</h2><p>Matriz Regulamentar FIJ / CBJ · 20 combates obrigatórios · Pontuação inicial: 100 pontos</p></div><span>PÁGINA 1</span></div>
    {!readOnly && <p className="sheet-instructions">L1–L3, G e GG: toque para marcar/desmarcar o código. Nas médias, o número define a quantidade; toque no número atual para zerar. Selecione a função e dê o visto ao concluir cada luta. Alterações retiram o visto.</p>}
    <div className="sheet-scroll" tabIndex={0} role="region" aria-label="Tabela dos 20 combates. Role horizontalmente para ver todas as colunas.">
      <table className="fight-table">
        <caption className="sr-only">Ficha dos 20 combates com função, faltas, dedução e visto do avaliador</caption>
        <thead><tr>
          <th rowSpan={2} scope="col" className="fight-number">Luta</th><th rowSpan={2} scope="col">Função<br /><small>C · L · V</small></th>
          <th rowSpan={2} scope="col" className="head-light">Leves<br /><small>−2 pts / código</small></th>
          <th colSpan={4} scope="colgroup" className="head-medium">Faltas médias · −5 pts / ocorrência</th>
          <th rowSpan={2} scope="col" className="head-grave">Graves<br /><small>−10 pts / código</small></th>
          <th rowSpan={2} scope="col" className="head-critical">Gravíssimas<br /><small>−20 pts / código</small></th>
          <th rowSpan={2} scope="col">Dedução</th><th rowSpan={2} scope="col">Visto</th>
        </tr><tr>{['M2', 'M1', 'M3', 'M4'].map(id => <th key={id} scope="col" className="head-medium" title={criterion(id).label}>{id === 'M2' ? 'Shido' : id === 'M1' ? 'Waza-ari' : id === 'M3' ? 'Mate' : 'Replay'}<br /><small>{id} · {id === 'M2' ? '1 a 5' : '1 a 3'}</small></th>)}</tr></thead>
        <tbody>{fights.map((fight, index) => {
          const deduction = fightDeduction(fight);
          const setCount = (id: string, value: number) => onChange(index, { ...fight, counts: { ...fight.counts, [id]: value }, verified: false });
          return <tr key={fight.number} className={fight.verified ? 'fight-verified' : ''}>
            <th scope="row" className="fight-number">{String(fight.number).padStart(2, '0')}</th>
            <td>{readOnly ? <span title={roleLabels[fight.role]}>{fight.role || '—'}</span> : <select className="sheet-role" aria-label={`Função na luta ${fight.number}`} value={fight.role} onChange={event => onChange(index, { ...fight, role: event.target.value as Role, verified: false })}><option value="">—</option>{(['C', 'L', 'V'] as const).map(role => <option key={role} value={role}>{role} · {roleLabels[role]}</option>)}</select>}</td>
            {readOnly ? <>
              <td>{['L1', 'L2', 'L3'].filter(id => fight.counts[id]).join(', ') || '—'}</td>
              {['M2', 'M1', 'M3', 'M4'].map(id => <td key={id}>{fight.counts[id] || '—'}</td>)}
              <td>{['G1', 'G2', 'G3', 'G4'].filter(id => fight.counts[id]).join(', ') || '—'}</td>
              <td>{['GG1', 'GG2', 'GG3', 'GG4'].filter(id => fight.counts[id]).join(', ') || '—'}</td>
            </> : <>
              <td className="cell-light"><Codes fight={fight} ids={['L1', 'L2', 'L3']} onSet={setCount} /></td>
              {['M2', 'M1', 'M3', 'M4'].map(id => <td key={id} className="cell-medium"><Quantity fight={fight} id={id} max={id === 'M2' ? 5 : 3} onSet={setCount} /></td>)}
              <td className="cell-grave"><Codes fight={fight} ids={['G1', 'G2', 'G3', 'G4']} onSet={setCount} /></td>
              <td className="cell-critical"><Codes fight={fight} ids={['GG1', 'GG2', 'GG3', 'GG4']} onSet={setCount} /></td>
            </>}
            <td className="fight-deduction">{deduction ? `−${deduction}` : '0'}</td>
            <td>{readOnly ? (fight.verified ? '✓' : '—') : <input type="checkbox" className="sheet-check" checked={fight.verified} disabled={!fight.role} title={fight.role ? 'Validar este combate' : 'Selecione a função antes de validar'} aria-label={`Visto do avaliador na luta ${fight.number}`} onChange={event => onChange(index, { ...fight, verified: event.target.checked })} />}</td>
          </tr>;
        })}</tbody>
        <tfoot><tr><th colSpan={9} scope="row">Total de deduções · {result.validated} de 20 combates validados</th><td className="fight-deduction">−{result.deduction}</td><td>{result.validated}/20</td></tr></tfoot>
      </table>
    </div>
    <p className="sheet-key">C = Central · L = Lateral · V = Vídeo. O visto confirma o registro do combate, inclusive quando não há faltas.</p>
    <details className="matrix-details"><summary>Matriz Regulamentar FIJ / CBJ · consultar códigos e critérios</summary><div className="sheet-scroll"><table className="matrix-table"><thead><tr><th>Classificação</th><th>Código</th><th>Critério de avaliação</th><th>Desconto</th></tr></thead><tbody>{errors.map(item => <tr key={item.id} className={`matrix-${item.severity}`}><th scope="row">{severityLabels[item.severity]}</th><td><strong>{item.id}</strong></td><td>{item.label}</td><td>−{points[item.severity]}</td></tr>)}</tbody></table></div></details>
    <aside className="sheet-protocol"><strong>PROTOCOLO DE VÍDEO REPLAY / CARE SYSTEM</strong><p>Registrar o lance duvidoso, consultar as imagens quando necessário, alinhar a decisão entre Árbitro Central e Mesa de Vídeo e justificar tecnicamente a correção. Falhas de replay estão contempladas nos códigos L3, M4, G3, G4 e GG4.</p></aside>
  </section>;
}
