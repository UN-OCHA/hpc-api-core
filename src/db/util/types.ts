/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Use of `any` in this module is generally deliberate to help with generics
 */
import type { ModelWithId } from './id-model';
import type { InstanceDataOf, UserDataOf } from './model-definition';
import type { Model } from './raw-model';

export type AnyModel = Model<any> | ModelWithId<any, any>;

export type FieldsOfModel<M extends AnyModel> =
  M extends Model<infer F>
    ? F
    : M extends ModelWithId<infer F, any>
      ? F
      : never;

export type InstanceOfModel<M extends AnyModel> = InstanceDataOf<
  FieldsOfModel<M>
>;

export type UserDataOfModel<M extends AnyModel> = UserDataOf<FieldsOfModel<M>>;
