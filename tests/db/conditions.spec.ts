import ContextProvider from '../testContext';

import { Cond, Op, prepareCondition } from '../../src/db/util/conditions';

const context = ContextProvider.Instance;

describe('prepareCondition', () => {
  type ExampleType = {
    id: number;
    name: string;
  };

  it('empty where clause', () => {
    const q = context.conn.queryBuilder();
    q.where(prepareCondition<ExampleType>({}));
    expect(q.toQuery()).toEqual('select *');
  });

  it('undefined property equality', () => {
    const q = context.conn.queryBuilder();
    q.where(
      prepareCondition<ExampleType>({
        id: undefined,
      })
    );
    expect(() => q.toQuery()).toThrowError('Unexpected undefined value for id');
  });

  it('single property equality', () => {
    const q = context.conn.queryBuilder();
    q.where(
      prepareCondition<ExampleType>({
        id: 123,
      })
    );
    expect(q.toQuery()).toEqual('select * where ("id" = 123)');
  });

  it('single property in list', () => {
    const q = context.conn.queryBuilder();
    q.where(
      prepareCondition<ExampleType>({
        id: {
          [Op.IN]: [123, 456],
        },
      })
    );
    expect(q.toQuery()).toEqual('select * where ("id" in (123, 456))');
  });

  it('single property not in list', () => {
    const q = context.conn.queryBuilder();
    q.where(
      prepareCondition<ExampleType>({
        id: {
          [Op.NOT_IN]: [123, 456],
        },
      })
    );
    expect(q.toQuery()).toEqual('select * where ("id" not in (123, 456))');
  });

  it('single property is null', () => {
    const q = context.conn.queryBuilder();
    q.where(
      prepareCondition<ExampleType>({
        name: {
          [Op.IS_NULL]: true,
        },
      })
    );
    expect(q.toQuery()).toEqual('select * where ("name" is null)');
  });

  it('single property is not null', () => {
    const q = context.conn.queryBuilder();
    q.where(
      prepareCondition<ExampleType>({
        name: {
          [Op.IS_NULL]: false,
        },
      })
    );
    expect(q.toQuery()).toEqual('select * where ("name" is not null)');
  });

  it('single property between', () => {
    const q = context.conn.queryBuilder();
    q.where(
      prepareCondition<ExampleType>({
        id: {
          [Op.BETWEEN]: [123, 456],
        },
      })
    );
    expect(q.toQuery()).toEqual('select * where ("id" between 123 and 456)');
  });

  it('single property like', () => {
    const q = context.conn.queryBuilder();
    q.where(
      prepareCondition<ExampleType>({
        name: {
          [Op.LIKE]: '%abc%',
        },
      })
    );
    expect(q.toQuery()).toEqual('select * where ("name" like \'%abc%\')');
  });

  it('single property ilike', () => {
    const q = context.conn.queryBuilder();
    q.where(
      prepareCondition<ExampleType>({
        name: {
          [Op.ILIKE]: '%abc%',
        },
      })
    );
    expect(q.toQuery()).toEqual('select * where ("name" ilike \'%abc%\')');
  });

  it('single property <', () => {
    const q = context.conn.queryBuilder();
    q.where(
      prepareCondition<ExampleType>({
        id: {
          [Op.LT]: 123,
        },
      })
    );
    expect(q.toQuery()).toEqual('select * where ("id" < 123)');
  });

  it('single property <=', () => {
    const q = context.conn.queryBuilder();
    q.where(
      prepareCondition<ExampleType>({
        id: {
          [Op.LTE]: 123,
        },
      })
    );
    expect(q.toQuery()).toEqual('select * where ("id" <= 123)');
  });

  it('single property >', () => {
    const q = context.conn.queryBuilder();
    q.where(
      prepareCondition<ExampleType>({
        id: {
          [Op.GT]: 123,
        },
      })
    );
    expect(q.toQuery()).toEqual('select * where ("id" > 123)');
  });

  it('single property >', () => {
    const q = context.conn.queryBuilder();
    q.where(
      prepareCondition<ExampleType>({
        id: {
          [Op.GTE]: 123,
        },
      })
    );
    expect(q.toQuery()).toEqual('select * where ("id" >= 123)');
  });

  it('multiple properties', () => {
    const q = context.conn.queryBuilder();
    q.where(
      prepareCondition<ExampleType>({
        name: 'foo',
        id: {
          [Op.NOT_IN]: [123, 456],
        },
      })
    );
    expect(q.toQuery()).toEqual(
      'select * where ("name" = \'foo\' and "id" not in (123, 456))'
    );
  });

  it('with builder', () => {
    const q = context.conn.queryBuilder();
    q.where(
      prepareCondition<ExampleType>({
        [Cond.BUILDER]: (qb) => qb.whereNull('name'),
      })
    );
    expect(q.toQuery()).toEqual('select * where (("name" is null))');
  });

  it('disjunction with multiple properties and builder', () => {
    const q = context.conn.queryBuilder();
    q.where(
      prepareCondition<ExampleType>({
        [Cond.OR]: [
          {
            name: 'foo',
            id: {
              [Op.NOT_IN]: [123, 456, 123],
            },
          },
          {
            [Cond.BUILDER]: (qb) => qb.whereNull('name'),
          },
        ],
      })
    );
    expect(q.toQuery()).toEqual(
      'select * where (("name" = \'foo\' and "id" not in (123, 456, 123)) or (("name" is null)))'
    );
  });

  it('disjunction with conjunction and multiple properties and builder', () => {
    const q = context.conn.queryBuilder();
    q.where(
      prepareCondition<ExampleType>({
        [Cond.OR]: [
          {
            name: 'foo',
            id: {
              [Op.NOT_IN]: [123, 456],
            },
          },
          {
            [Cond.AND]: [
              {
                [Cond.BUILDER]: (qb) => qb.whereNull('name'),
              },
              {
                [Cond.BUILDER]: (qb) => qb.whereNotNull('id'),
              },
            ],
          },
        ],
      })
    );
    expect(q.toQuery()).toEqual(
      'select * where (("name" = \'foo\' and "id" not in (123, 456)) or ((("name" is null)) and (("id" is not null))))'
    );
  });
});
