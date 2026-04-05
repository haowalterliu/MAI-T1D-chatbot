import { useExperiment } from '../../context/ExperimentContext';
import { demoDatasets } from '../../data/demoDatasets';
import Tag from '../common/Tag';
import './DatasetRecommendation.css';

function DatasetRecommendation({ recommendation }) {
  const { config, addDataset, addDatasetVariant } = useExperiment();

  // A recommendation can be either a plain base dataset or a filtered
  // variant. When it carries a `variant` object, the card shows the
  // filtered sub-cohort (e.g. "HPAP — T1D Stage 1 Male") rather than the
  // whole base dataset.
  const dataset = recommendation.variant
    || demoDatasets.find(d => d.id === recommendation.id);

  if (!dataset) return null;

  const isVariant = !!recommendation.variant;
  const isAdded = config.selectedDatasets.includes(dataset.id);

  // "Best for" is a static per-base-dataset descriptor. Variant cards share
  // the base dataset's descriptor since they're subsets of the same cohort.
  const baseId = isVariant ? (dataset.baseId || recommendation.id) : dataset.id;
  const baseDataset = demoDatasets.find(d => d.id === baseId);
  const bestFor = baseDataset?.bestFor;

  // Card title = the full dataset/variant title (e.g. "HPAP — T1D with
  // scRNA-seq + CODEX" for variants, or "HPAP: Human Pancreas…" for base
  // datasets). Strip any colon-suffix on base datasets so we show just
  // the short name when there's no variant descriptor.
  const cardTitle = isVariant
    ? (dataset.title || '')
    : (dataset.title || '').split(':')[0].trim();

  const handleAdd = () => {
    if (isAdded) return;
    if (isVariant) addDatasetVariant(dataset);
    else addDataset(dataset.id);
  };

  return (
    <>
      <div className="dataset-recommendation">
        <div className="rec-header">
          <div className="rec-title-block">
            <h4 className="rec-title">{cardTitle}</h4>
            <p className="rec-donor-count">{dataset.donorCount} donors</p>
          </div>
          <button
            className={`rec-add-btn ${isAdded ? 'added' : ''}`}
            onClick={handleAdd}
            disabled={isAdded}
          >
            {isAdded ? '✓ Added' : '+ Add'}
          </button>
        </div>

        <div className="rec-meta-row">
          {isVariant && dataset.variantFilters?.length > 0 ? (
            // For a filtered variant card, show ONLY the filters that define
            // this specific sub-cohort (not the broader query-level tags).
            dataset.variantFilters.map(f => (
              <Tag key={`${f.column}-${f.value}`} label={formatVariantTag(f)} />
            ))
          ) : recommendation.queryTags && recommendation.queryTags.length > 0 ? (
            // Non-variant card: show tags extracted from the user's question.
            recommendation.queryTags.map(t => <Tag key={t} label={t} />)
          ) : (
            // Fallback: dataset modalities + cell type.
            <>
              {dataset.modalities?.map(m => <Tag key={m} label={m} />)}
              {dataset.cellType && <Tag label={dataset.cellType} />}
            </>
          )}
        </div>

        {recommendation.reason && (
          <p className="rec-reason">{recommendation.reason}</p>
        )}

        {bestFor && (
          <p className="rec-best-for">
            <span className="rec-best-for-label">Best for:</span> {bestFor}
          </p>
        )}
      </div>
    </>
  );
}

function formatVariantTag(f) {
  const val = String(f.value ?? '').trim();
  // Binary modality flags (e.g. scRNA-seq == 1) — show the modality name
  // rather than the literal "1"/"0".
  if (f.operator === '==' || f.operator === '===') {
    const lv = val.toLowerCase();
    if (lv === '1' || lv === 'yes' || lv === 'true') return f.column;
    if (lv === '0' || lv === 'no' || lv === 'false') return `No ${f.column}`;
  }
  if (f.operator === '==' || f.operator === 'contains') return val;
  return `${f.column} ${f.operator} ${val}`;
}

export default DatasetRecommendation;
