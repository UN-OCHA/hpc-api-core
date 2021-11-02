import * as t from 'io-ts';

export const ATTACHMENT_VERSION_VALUE = {
  /**
   * TODO: Replace this with type that represents expected values
   */
  caseLoad: t.unknown,
  /**
   * TODO: Replace this with type that represents expected values
   */
  contact: t.unknown,
  cost: t.intersection([
    t.exact(
      t.type({
        cost: t.number,
      })
    ),
    t.exact(
      t.partial({
        /**
         * When necessary, a cost breakdown can be provided with respect to a
         * particular collection of objects.
         *
         * For example, when the object of this attachment is a governing entity,
         * a breakdown needs to be provided for each of the global clusters,
         * (even if the governing entity has 0 global clusters)
         * and the total sum of the breakdown must match the overall cost when
         * non-empty.
         */
        breakdown: t.array(
          t.exact(
            t.type({
              objectId: t.number,
              cost: t.number,
            })
          )
        ),
        // TODO: delete these properties once we've confirmed that they're not
        // needed for any code that reads cost attachments
        // (they seem to be produced by RPM frontend code related to other types)
        /** @deprecated TODO: remove (this doesn't look like it's needed for cost attachments) */
        name: t.string,
        /** @deprecated TODO: remove (this doesn't look like it's needed for cost attachments) */
        description: t.string,
        /** @deprecated TODO: remove (this doesn't look like it's needed for cost attachments) */
        metrics: t.exact(
          t.partial({
            values: t.exact(t.partial({})),
            measureFields: t.array(t.UnknownRecord),
          })
        ),
      })
    ),
  ]),
  /**
   * TODO: Replace this with type that represents expected values
   */
  fileWebContent: t.unknown,
  /**
   * TODO: Replace this with type that represents expected values
   */
  indicator: t.unknown,
  /**
   * TODO: Replace this with type that represents expected values
   */
  textWebContent: t.unknown,
} as const;

export type CostAttachmentValue = t.TypeOf<
  typeof ATTACHMENT_VERSION_VALUE['cost']
>;

export const ANY_ATTACHMENT_VERSION_VALUE = t.union([
  ATTACHMENT_VERSION_VALUE['caseLoad'],
  ATTACHMENT_VERSION_VALUE['contact'],
  ATTACHMENT_VERSION_VALUE['cost'],
  ATTACHMENT_VERSION_VALUE['fileWebContent'],
  ATTACHMENT_VERSION_VALUE['indicator'],
  ATTACHMENT_VERSION_VALUE['textWebContent'],
]);
