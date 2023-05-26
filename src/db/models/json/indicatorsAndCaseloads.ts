import * as t from 'io-ts';
import { indexedObjectType } from '../../../util/io-ts';

const METRIC_NAME = indexedObjectType(t.string);

export type CaseloadOrIndicatorMetricName = t.TypeOf<typeof METRIC_NAME>;

const METRIC_DEFINITION = t.type({
  name: METRIC_NAME,
  type: t.string,
});

export type CaseloadOrIndicatorMetricDefinition = t.TypeOf<
  typeof METRIC_DEFINITION
>;

const METRIC_WITH_VALUE = t.intersection([
  METRIC_DEFINITION,
  t.partial({
    /**
     * TODO: unfortunately, it looks like some of the metric totals in
     * measurements incorrectly have string types. We should update all of these
     * to be numbers when specified.
     */
    value: t.union([t.number, t.null, t.literal('')]),
  }),
]);

export type CaseloadOrIndicatorMetricWithValue = t.TypeOf<
  typeof METRIC_WITH_VALUE
>;

export const DISAGGREGATED_LOCATIONS = t.array(
  t.intersection([
    t.type({
      name: t.string,
    }),
    t.partial({
      id: t.union([t.number, t.string]),
      parent: t.type({
        id: t.union([t.number, t.string]),
        name: t.string,
      }),
    }),
  ])
);

/**
 * Disaggregated data that may be present in a caseload, indicator, or
 * measurement for a caseload or indicator.
 */
const DISAGGREGATED_DATA = t.type({
  categories: t.array(
    t.type({
      ids: t.array(t.number),
      name: t.string,
      label: t.string,
      /**
       * TODO: this looks dodgy, they probably shouldn't be copied here,
       * (as there are some elements of our code that assume that they)
       * are all the same for all categories, such as when we validate the
       * row count in `app/lib/disaggregationModel.js`
       *
       * It would probably instead be better to directly use totals,
       * and assume that we'll be using the same metrics as the totals.
       *
       * It seems that these metrics are used directly by the RPM frontend
       * though.
       */
      metrics: t.array(METRIC_DEFINITION),
    })
  ),
  /**
   * It looks like some attachments incorrectly have string values
   * stored instead of numbers or 'null'.
   *
   * TODO: require all metrics to store more correct values
   */
  dataMatrix: t.array(t.array(t.union([t.null, t.number, t.string]))),
  locations: DISAGGREGATED_LOCATIONS,
});

/**
 * Disaggregated data that may be present in a caseload, indicator, or
 * measurement for a caseload or indicator.
 */
export type DisaggregatedData = t.TypeOf<typeof DISAGGREGATED_DATA>;

export const CASELOAD_OR_INDICATOR_METRICS_VALUES = t.intersection([
  t.type({
    totals: t.array(METRIC_WITH_VALUE),
  }),
  t.partial({
    /**
     * Set when there are fields that need to be filled in for monitoring
     * periods. These are totals.
     *
     * @deprecated TODO: these should probably only appear in the prototype,
     * and not here, as they should never have values for attachments,
     * only for measurements.
     *
     * So are not (and should not) be displayed in the plan framework /
     * config, only the
     */
    measureFields: t.array(METRIC_DEFINITION),
    disaggregated: t.union([t.null, DISAGGREGATED_DATA]),
  }),
]);

export type CaseloadOrIndicatorMetricsValues = t.TypeOf<
  typeof CASELOAD_OR_INDICATOR_METRICS_VALUES
>;

export type CaseloadOrIndicatorMetricsValuesWithDisaggregation =
  CaseloadOrIndicatorMetricsValues & {
    disaggregated: {};
  };

export const hasDisaggregation = (
  metrics: CaseloadOrIndicatorMetricsValues
): metrics is CaseloadOrIndicatorMetricsValuesWithDisaggregation =>
  !!metrics.disaggregated;

/**
 * The expected type of the value field for attachmentVersions and
 * measurementVersions for indicators.
 *
 * TODO: improve the quality of the data, and make this codec more strict
 *
 * For the most part, this data is the same structure as caseload attachments,
 * with some differences, such as the requirement of a `unit` field.
 */
export const CASELOAD_VALUE = t.intersection([
  t.type({
    metrics: t.intersection([
      t.type({
        values: CASELOAD_OR_INDICATOR_METRICS_VALUES,
      }),
      t.partial({
        measureFields: t.array(METRIC_DEFINITION),
      }),
    ]),
  }),
  t.partial({
    description: t.string,
  }),
]);

export type CaseloadValue = t.TypeOf<typeof CASELOAD_VALUE>;

/**
 * The expected type of the value field for attachmentVersions and
 * measurementVersions for indicators.
 *
 * TODO: improve the quality of the data, and make this codec more strict
 *
 * For the most part, this data is the same structure as caseload attachments,
 * with some differences, such as the requirement of a `unit` field.
 */
export const INDICATOR_VALUE = t.intersection([
  t.type({
    metrics: t.intersection([
      t.type({
        values: CASELOAD_OR_INDICATOR_METRICS_VALUES,
      }),
      t.partial({
        /**
         * TODO: this field is too lax, some properties in the database don't
         * have an id specified, and some don't have an object. We need to be
         * stricter here.
         */
        unit: t.union([
          t.null,
          t.partial({
            id: t.number,
            object: t.type({
              id: t.number,
              label: t.string,
              isGender: t.string,
              labelFr: t.string,
            }),
          }),
        ]),
        measureFields: t.array(METRIC_DEFINITION),
      }),
    ]),
  }),
  t.partial({
    description: t.string,
  }),
]);

export type IndicatorValue = t.TypeOf<typeof INDICATOR_VALUE>;

/**
 * measurement values have the same types as their respective caseload
 * or indicator attachments
 */
export const MEASUREMENT_VALUE = t.union([INDICATOR_VALUE, CASELOAD_VALUE]);
