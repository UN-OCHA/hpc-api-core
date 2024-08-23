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
  export const IS_NULL = Symbol('is null');
  export const BETWEEN = Symbol('between');
  export const LIKE = Symbol('like');
  export const ILIKE = Symbol('ilike');
  export const LT = Symbol('less than');
  export const LTE = Symbol('less than or equal to');
  export const GT = Symbol('greater than');
  export const GTE = Symbol('greater than or equal to');

  /**
   * Symbols to use when constructing conditions for a single property
   */
  export const Op = {
    IN: IN,
    NOT_IN: NOT_IN,
    IS_NULL: IS_NULL,
    BETWEEN: BETWEEN,
    LIKE: LIKE,
    ILIKE: ILIKE,
    LT: LT,
    LTE: LTE,
    GT: GT,
    GTE: GTE,
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

  export type IsNullCondition = {
    [Op.IS_NULL]: boolean;
  };

  export type BetweenCondition<T> = {
    [Op.BETWEEN]: [T, T];
  };

  // Simple binary operator conditions

  export type LikeCondition<T> = {
    [Op.LIKE]: T & string;
  };
  export type ILikeCondition<T> = {
    [Op.ILIKE]: T & string;
  };
  export type LtCondition<T> = {
    [Op.LT]: T;
  };
  export type LteCondition<T> = {
    [Op.LTE]: T;
  };
  export type GtCondition<T> = {
    [Op.GT]: T;
  };
  export type GteCondition<T> = {
    [Op.GTE]: T;
  };
  /**
   * A condition that must hold over a single property whose type is T
   */
  export type Condition<T> =
    | EqualityCondition<T>
    | InCondition<T>
    | NotInCondition<T>
    | IsNullCondition
    | BetweenCondition<T>
    | LikeCondition<T>
    | ILikeCondition<T>
    | LtCondition<T>
    | LteCondition<T>
    | GtCondition<T>
    | GteCondition<T>;

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

  export const isNullCondition = <T>(
    condition: Condition<T>
  ): condition is IsNullCondition =>
    Object.prototype.hasOwnProperty.call(condition, Op.IS_NULL);

  export const isBetweenCondition = <T>(
    condition: Condition<T>
  ): condition is BetweenCondition<T> =>
    Object.prototype.hasOwnProperty.call(condition, Op.BETWEEN);

  export const isLikeCondition = <T>(
    condition: Condition<T>
  ): condition is LikeCondition<T> =>
    Object.prototype.hasOwnProperty.call(condition, Op.LIKE);

  export const isILikeCondition = <T>(
    condition: Condition<T>
  ): condition is ILikeCondition<T> =>
    Object.prototype.hasOwnProperty.call(condition, Op.ILIKE);

  export const isLtCondition = <T>(
    condition: Condition<T>
  ): condition is LtCondition<T> =>
    Object.prototype.hasOwnProperty.call(condition, Op.LT);

  export const isLteCondition = <T>(
    condition: Condition<T>
  ): condition is LteCondition<T> =>
    Object.prototype.hasOwnProperty.call(condition, Op.LTE);

  export const isGtCondition = <T>(
    condition: Condition<T>
  ): condition is GtCondition<T> =>
    Object.prototype.hasOwnProperty.call(condition, Op.GT);

  export const isGteCondition = <T>(
    condition: Condition<T>
  ): condition is GteCondition<T> =>
    Object.prototype.hasOwnProperty.call(condition, Op.GTE);
}

namespace OverallConditions {
  // Overall Condition Definitions

  /**
   * A collection of conditions across different properties that must all
   * hold true at the same time
   */
  export type PropertyConjunctionCondition<InstanceData> = {
    [P in keyof InstanceData & string]?: PropertyConditions.Condition<
      InstanceData[P]
    >;
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
      const propertyConditions = Object.entries(condition) as Array<
        [
          keyof InstanceData,
          PropertyConditions.Condition<InstanceData[keyof InstanceData]>,
        ]
      >;
      for (const [property, propertyCondition] of propertyConditions) {
        if (propertyCondition === undefined) {
          throw new Error(
            `Unexpected undefined value for ${property.toString()}`
          );
        } else if (PropertyConditions.isEqualityCondition(propertyCondition)) {
          builder.where(property as string, propertyCondition as any);
        } else if (PropertyConditions.isInCondition(propertyCondition)) {
          builder.whereIn(property, [...propertyCondition[Op.IN]] as any);
        } else if (PropertyConditions.isNotInCondition(propertyCondition)) {
          builder.whereNotIn(property, [
            ...propertyCondition[Op.NOT_IN],
          ] as any);
        } else if (PropertyConditions.isNullCondition(propertyCondition)) {
          if (propertyCondition[Op.IS_NULL]) {
            builder.whereNull(property);
          } else {
            builder.whereNotNull(property);
          }
        } else if (PropertyConditions.isBetweenCondition(propertyCondition)) {
          builder.whereBetween(property, [
            propertyCondition[Op.BETWEEN][0],
            propertyCondition[Op.BETWEEN][1],
          ]);
        } else if (PropertyConditions.isLikeCondition(propertyCondition)) {
          builder.where(property as string, 'like', propertyCondition[Op.LIKE]);
        } else if (PropertyConditions.isILikeCondition(propertyCondition)) {
          builder.where(
            property as string,
            'ilike',
            propertyCondition[Op.ILIKE]
          );
        } else if (PropertyConditions.isLtCondition(propertyCondition)) {
          builder.where(
            property as string,
            '<',
            propertyCondition[Op.LT] as any
          );
        } else if (PropertyConditions.isLteCondition(propertyCondition)) {
          builder.where(
            property as string,
            '<=',
            propertyCondition[Op.LTE] as any
          );
        } else if (PropertyConditions.isGtCondition(propertyCondition)) {
          builder.where(
            property as string,
            '>',
            propertyCondition[Op.GT] as any
          );
        } else if (PropertyConditions.isGteCondition(propertyCondition)) {
          builder.where(
            property as string,
            '>=',
            propertyCondition[Op.GTE] as any
          );
        } else {
          throw new Error(`Unexpected condition: ${propertyCondition}`);
        }
      }
    }
  };
