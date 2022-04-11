import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { BUDGET_SEGMENT_ID } from './budgetSegment';

export type BudgetSegmentBreakdownId = Brand<
  number,
  { readonly s: unique symbol },
  'budgetSegmentBreakdown.id'
>;

export const BUDGET_SEGMENT_BREAKDOWN_ID = brandedType<
  number,
  BudgetSegmentBreakdownId
>(t.number);

const BUDGET_SEGMENT_BREAKDOWN_FIXED_TYPE = t.keyof({
  c: null,
  p: null,
});

export const BUDGET_SEGMENT_BREAKDOWN_CONTENT = t.intersection([
  t.type({
    /**
     * Some breakdowns seem to incorrectly use non-numeric values for amount
     *
     * TODO: Be more strict for future additions,
     * clean old values and drop string type from this union
     */
    amount: t.union([t.number, t.string, t.null]),
  }),
  t.partial({
    originalAmount: t.number,
    /**
     * Some percent figures are incorrectly using numbers as strings
     *
     * TODO: Introduce more strict checks and drop string type
     */
    percent: t.union([t.number, t.string]),
    fixed: BUDGET_SEGMENT_BREAKDOWN_FIXED_TYPE,
    breakdown: t.array(
      t.intersection([
        t.type({
          amount: t.number,
          percent: t.number,
          description: t.string,
        }),
        t.partial({
          fixed: BUDGET_SEGMENT_BREAKDOWN_FIXED_TYPE,
        }),
      ])
    ),
  }),
]);

/**
 * Strict version of `BUDGET_SEGMENT_BREAKDOWN_CONTENT` codec
 * defined above. Intended to be used when creating new records,
 * in order to enforce stricter type of `amount` and `percent`.
 *
 * `percent` used to allow for string type, while `amount` allowed
 * for both `string` and `null` (in addition to proper `number` type),
 * which is why there are many records with "corrupt" data. This stricter
 * type should be used for validating new records upon creation.
 */
export const BUDGET_SEGMENT_BREAKDOWN_CONTENT_STRICT = t.intersection([
  t.type({ amount: t.number }),
  t.partial({
    originalAmount:
      BUDGET_SEGMENT_BREAKDOWN_CONTENT.types[1].props.originalAmount,
    percent: t.number,
    fixed: BUDGET_SEGMENT_BREAKDOWN_CONTENT.types[1].props.fixed,
    breakdown: BUDGET_SEGMENT_BREAKDOWN_CONTENT.types[1].props.breakdown,
  }),
]);

export type BudgetSegmentBreakdownContentStrict = t.TypeOf<
  typeof BUDGET_SEGMENT_BREAKDOWN_CONTENT_STRICT
>;

export default defineIDModel({
  tableName: 'budgetSegmentBreakdown',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: BUDGET_SEGMENT_BREAKDOWN_ID },
    },
    required: {
      budgetSegmentId: { kind: 'branded-integer', brand: BUDGET_SEGMENT_ID },
      content: { kind: 'checked', type: BUDGET_SEGMENT_BREAKDOWN_CONTENT },
    },
    optional: {
      name: { kind: 'checked', type: t.string },
      type: { kind: 'checked', type: t.literal('general') },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
