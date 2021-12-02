/* eslint-disable @typescript-eslint/no-namespace */
// we use namespaces here to neatly organize and scope the many type and type guard definitions

import Knex = require('knex');

/**
 * Symbols to use for where condition construction
 */
export namespace ConditionSymbols {
  export const BUILDER = Symbol('builder');
  export const AND = Symbol('and');
  export const OR = Symbol('or');

  /**
   * Symbols to use for where condition construction
   */
  export const Cond = {
    BUILDER: BUILDER,
    AND: AND,
    OR: OR,
  } as const;
}

export const Cond = ConditionSymbols.Cond;

/**
 * Symbols to use when constructing conditions for a single property
 */
export namespace PropertySymbols {
  export const IN = Symbol('in');
  export const NOT_IN = Symbol('not in');

  /**
   * Symbols to use when constructing conditions for a single property
   */
  export const Op = {
    IN: IN,
    NOT_IN: NOT_IN,
  } as const;
}

export const Op = PropertySymbols.Op;

namespace PropertyConditions {
  export type EqualityCondition<T> = T;
  export type InCondition<T> = {
    [Op.IN]: Iterable<T>;
  };
  export type NotInCondition<T> = {
    [Op.NOT_IN]: Iterable<T>;
  };
  /**
   * A condition that must hold over a single property whose type is T
   */
  export type Condition<T> =
    | EqualityCondition<T>
    | InCondition<T>
    | NotInCondition<T>;

  export const isEqualityCondition = <T>(
    condition: Condition<T>
  ): condition is EqualityCondition<T> =>
    typeof condition !== 'object' || condition === null;

  export const isInCondition = <T>(
    condition: Condition<T>
  ): condition is InCondition<T> =>
    Object.prototype.hasOwnProperty.call(condition, Op.IN);

  export const isNotInCondition = <T>(
    condition: Condition<T>
  ): condition is NotInCondition<T> =>
    Object.prototype.hasOwnProperty.call(condition, Op.NOT_IN);
}

namespace OverallConditions {
  // Overall Condition Definitions

  /**
   * A collection of conditions across different properties that must all
   * hold true at the same time
   */
  export type PropertyConjunctionCondition<InstanceData> = {
    [P in keyof InstanceData]?: PropertyConditions.Condition<InstanceData[P]>;
  };

  export type QueryBuilderCondition<InstanceData> = {
    [Cond.BUILDER]: Knex.QueryCallback<InstanceData, InstanceData>;
  };

  export type ConjunctionCondition<InstanceData> = {
    [Cond.AND]: Array<Condition<InstanceData>>;
  };

  export type DisjunctionCondition<InstanceData> = {
    [Cond.OR]: Array<Condition<InstanceData>>;
  };

  /**
   * The root type for a custom condition that can be passed to `prepareCondition`
   * to construct a knex condition / query in a type-safe manner
   */
  export type Condition<InstanceData> =
    | PropertyConjunctionCondition<InstanceData>
    | QueryBuilderCondition<InstanceData>
    | ConjunctionCondition<InstanceData>
    | DisjunctionCondition<InstanceData>;

  export const isQueryBuilderCondition = <T>(
    condition: Condition<T>
  ): condition is QueryBuilderCondition<T> =>
    Object.prototype.hasOwnProperty.call(condition, Cond.BUILDER);

  export const isConjunctionCondition = <T>(
    condition: Condition<T>
  ): condition is ConjunctionCondition<T> =>
    Object.prototype.hasOwnProperty.call(condition, Cond.AND);

  export const isDisjunctionCondition = <T>(
    condition: Condition<T>
  ): condition is DisjunctionCondition<T> =>
    Object.prototype.hasOwnProperty.call(condition, Cond.OR);
}

/**
 * The root type for a custom condition that can be passed to `prepareCondition`
 * to construct a knex condition / query in a type-safe manner
 */
export type Condition<InstanceData> = OverallConditions.Condition<InstanceData>;

/**
 * Given a knex query builder, and one of our own custom conditions,
 * return the prepared condition to be used directly by knex.
 *
 * There are a few reasons we do this rather than simply using knex query
 * builder directly:
 *
 * * the query builder does not offer good type-safety (for example whereIn
 *   does not require the type of the values to match the type of the column)
 * * we find ourselves needing to use query builders often for very simple
 *   conditions that could be abstracted + simplified
 *
 * However, we retain the ability to use a query builder when needed.
 */
export const prepareCondition =
  <InstanceData>(
    condition: Condition<InstanceData>
  ): Knex.QueryCallback<InstanceData, InstanceData> =>
  (builder) => {
    if (OverallConditions.isQueryBuilderCondition(condition)) {
      builder.where(condition[Cond.BUILDER]);
    } else if (OverallConditions.isConjunctionCondition(condition)) {
      for (const c of condition[Cond.AND]) {
        builder.andWhere(prepareCondition(c));
      }
    } else if (OverallConditions.isDisjunctionCondition(condition)) {
      for (const c of condition[Cond.OR]) {
        builder.orWhere(prepareCondition(c));
      }
    } else {
      // Combine all property conditions in a single
      const propertyConditions = Object.entries(condition) as [
        keyof InstanceData,
        PropertyConditions.Condition<InstanceData[keyof InstanceData]>
      ][];
      for (const [property, propertyCondition] of propertyConditions) {
        if (PropertyConditions.isEqualityCondition(propertyCondition)) {
          builder.where(property, propertyCondition);
        } else if (PropertyConditions.isInCondition(propertyCondition)) {
          builder.whereIn(property, [...propertyCondition[Op.IN]]);
        } else if (PropertyConditions.isNotInCondition(propertyCondition)) {
          builder.whereNotIn(property, [...propertyCondition[Op.NOT_IN]]);
        } else {
          throw new Error(`Unexpected condition type: ${propertyCondition}`);
        }
      }
    }
  };
