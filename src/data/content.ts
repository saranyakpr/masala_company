import type { Certification, ProcessStep, QualityCheck, TimelineEntry } from '@/types';

/**
 * Manufacturing process.
 * These steps describe a typical spice-processing flow requested in the brief.
 * Machinery, capacities and exact parameters are NOT stated — confirm with client.
 */
export const processSteps: ProcessStep[] = [
  {
    id: 'sourcing',
    index: '01',
    title: 'Raw material sourcing',
    summary: 'It begins at the farm gate.',
    detail:
      'Whole spices are selected lot by lot for colour, aroma and density before they are accepted into the facility.',
    points: ['Lot-wise selection of whole spices', 'Visual and aroma assessment on arrival', 'Supplier details recorded per batch'],
  },
  {
    id: 'cleaning',
    index: '02',
    title: 'Cleaning & sorting',
    summary: 'Only the good stays.',
    detail:
      'Stones, stems, dust and foreign matter are removed, and the spices are graded so that only sound, uniform material moves forward.',
    points: ['Removal of stones, stems and dust', 'Grading for size and uniformity', 'Rejection of damaged material'],
  },
  {
    id: 'drying',
    index: '03',
    title: 'Drying',
    summary: 'Patience, measured in days.',
    detail:
      'Spices are dried to a stable moisture level that protects aroma and keeps the finished product free-flowing.',
    points: ['Controlled moisture reduction', 'Protects colour and volatile oils', 'Prepares spices for an even grind'],
  },
  {
    id: 'grinding',
    index: '04',
    title: 'Grinding',
    summary: 'Cool, slow, precise.',
    detail:
      'Dried spices are ground and sieved to a consistent particle size, keeping heat low so essential oils are not lost.',
    points: ['Consistent particle size', 'Sieving for a uniform texture', 'Low-heat grinding to preserve aroma'],
  },
  {
    id: 'blending',
    index: '05',
    title: 'Blending',
    summary: 'Recipes, weighed to the gram.',
    detail:
      'For masalas, each ground spice is weighed to the recipe and mixed until every spoonful carries the same balance of flavour.',
    points: ['Recipe-weighed ingredients', 'Homogeneous mixing', 'Batch sample retained for reference'],
  },
  {
    id: 'packaging',
    index: '06',
    title: 'Packaging',
    summary: 'Sealed at its peak.',
    detail:
      'The finished spice is packed and sealed to protect it from light, air and moisture, with batch and date coding on every pack.',
    points: ['Sealed, protective packs', 'Batch and date coding', 'Ready for retail and trade'],
  },
];

/** Quality checks — a generic framework. Exact tests & limits must come from the client's QA team. */
export const qualityChecks: QualityCheck[] = [
  {
    title: 'Incoming inspection',
    description: 'Every lot of raw spice is checked for appearance, aroma and foreign matter before acceptance.',
  },
  {
    title: 'In-process checks',
    description: 'Cleaning, drying and grinding stages are monitored so each batch moves forward only when it meets specification.',
  },
  {
    title: 'Finished-product testing',
    description: 'Finished batches are sampled before packing. Test parameters and laboratory details to be provided by the client.',
  },
  {
    title: 'Batch traceability',
    description: 'Batch codes link each pack back to its production run and raw-material lots.',
  },
];

/** Certification slots — NO certifications are claimed until client documents are provided. */
export const certifications: Certification[] = [
  { id: 'cert-1', title: 'Food safety licence', scope: 'Regulatory licence for manufacturing & sale', status: 'pending-documentation' },
  { id: 'cert-2', title: 'Food safety management', scope: 'Management-system certification, if held', status: 'pending-documentation' },
  { id: 'cert-3', title: 'Hygiene & manufacturing practice', scope: 'Audit or certification, if held', status: 'pending-documentation' },
  { id: 'cert-4', title: 'Export / trade registration', scope: 'Export body membership, if applicable', status: 'pending-documentation' },
];

/** Brand timeline — PLACEHOLDER milestones. Years and events to be provided by client. */
export const timeline: TimelineEntry[] = [
  {
    year: 'Founding year',
    title: 'Where it began',
    description: 'The founding story — who started the company, where, and why. To be written with the client.',
    pending: true,
  },
  {
    year: 'Milestone',
    title: 'The first facility',
    description: 'Opening of the first processing unit. Date and details to be confirmed.',
    pending: true,
  },
  {
    year: 'Milestone',
    title: 'Growing the range',
    description: 'From single spices to heritage blends. Date and details to be confirmed.',
    pending: true,
  },
  {
    year: 'Today',
    title: 'A modern spice house',
    description: 'Today’s scale, reach and markets served — figures to be provided by the client.',
    pending: true,
  },
];

export const values = [
  {
    title: 'Purity',
    description: 'Spices that taste of themselves. No shortcuts, no fillers, nothing hidden on the label.',
  },
  {
    title: 'Patience',
    description: 'Drying, roasting and grinding take the time they need — aroma cannot be rushed.',
  },
  {
    title: 'Precision',
    description: 'Recipes weighed to the gram and batches checked before they leave the floor.',
  },
  {
    title: 'Respect',
    description: 'For the farmers who grow the spice, the people who process it and the kitchens that cook with it.',
  },
];
