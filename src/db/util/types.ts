/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Use of `any` in this module is generally deliberate to help with generics
 */
import { Model } from './raw-model';
import { InstanceDataOf, UserDataOf } from './model-definition';
import { ModelWithId } from './id-model';

export type AnyModel = Model<any> | ModelWithId<any, any>;

type FieldsOfModel<M extends AnyModel> = M extends Model<infer F>
  ? F
  : M extends ModelWithId<infer F, any>
  ? F
  : never;

export type InstanceOfModel<M extends AnyModel> = InstanceDataOf<
  FieldsOfModel<M>
>;

export type UserDataOfModel<M extends AnyModel> = UserDataOf<FieldsOfModel<M>>;
