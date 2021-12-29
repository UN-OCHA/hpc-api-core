import * as t from "io-ts";

import { brandedType } from "../../util/io-ts";
import type { Brand } from "../../util/types";
import { DATE } from "../util/datatypes";
import { defineIDModel } from "../util/id-model";

export type LocationId = Brand<number, { readonly s: unique symbol }, "job.id">;

export const LOCATION_ID = brandedType<number, LocationId>(t.number);
// At this time, this model is incomplete

export default defineIDModel({
  tableName: 'job',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: LOCATION_ID },
    },
    required: {
      jobId: { kind: 'checked', type: t.number }, // Foreign key relationship to jobs
      locationId: { kind: 'checked', type: t.number }, // Foreign key relationship to locations
      isLatLong: { kind: 'checked', type: t.boolean },
      isGeoPolygon: { kind: 'checked', type: t.boolean },
    },
    nonNullWithDefault: {},
    optional: {},
  },
  idField: 'id',
  softDeletionEnabled: false,
});
