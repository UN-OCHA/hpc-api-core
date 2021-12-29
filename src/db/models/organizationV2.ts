import * as t from "io-ts";

import type { Brand } from "../../util/types";
import { defineVersionedModel } from "../util/versioned-model";
import { brandedType } from "../../util/io-ts";

export type OrganizationId = Brand<
    number,
    { readonly s: unique symbol },
    "organizationv2.id"
>;

export const ORGANIZATION_ID = brandedType < number, OrganizationId> (t.number);

export const PARENT_ORGANIZATION_ID = t.union([
    t.null,
    t.number
]);


export const ORGANIZATION_DATA = t.type({
    name: t.union([t.string, t.null, t.undefined]),
    nativeName: t.union([t.string, t.null, t.undefined]),
    abbreviation: t.union([t.string, t.null, t.undefined]),
    url: t.union([t.string, t.null, t.undefined]),
    parentID: t.union([t.null, PARENT_ORGANIZATION_ID, t.undefined]),
    comments: t.union([t.string, t.null, t.undefined]),
    verified: t.boolean,
    notes: t.union([t.string, t.null, t.undefined]),
    active: t.union([t.boolean, t.null, t.undefined]),
    collectiveInd: t.union([t.boolean, t.null, t.undefined]),
    newOrganizationId: t.union([t.null, PARENT_ORGANIZATION_ID, t.undefined]),
});

export type OrganizationData = t.TypeOf<typeof ORGANIZATION_DATA>;

export default defineVersionedModel({
    tableBaseName: "organizationv2",
    idType: ORGANIZATION_ID,
    data: ORGANIZATION_DATA,
    lookupColumns: {
        columns: {
            required: {
                parentID: {
                    kind: "checked",
                    type: PARENT_ORGANIZATION_ID,
                },
                name: {
                    kind: "checked",
                    type: t.string,
                },
                abbreviation: {
                    kind: "checked",
                    type: t.string,
                },
            },
        },
        prepare: async ({ parentID, name, abbreviation }) => {
            return {
                parentID,
                name,
                abbreviation,
            };
        },
    },
});
