# Contributing to `@unocha/hpc-api-core`

## Database library ([`src/db`](src/db))

This library is the primary way with which we interact with the HPC database,
and uses `knex` in the backend. We made a conscious decision to move away from
using sequelize (which is used in the legacy codebase), and use `knex` for a
number of reasons:

- **Discouraging the use of Joins:**

  The HPC API codebase has been known to make SQL queries with a very large
  number of joins (i.e. dozens) in a single query. These queries have previously
  locked-up the postgres database due to the contention that it causes, and
  drastically impact performance.

  Sequelize's ORM methodology & design (along with our model definitions),
  in particular the ease of writing queries that "include" data from other
  tables, encourages developers to write these large queries that should be
  avoided.

  It's still possible to write queries in `knex` with joins of course,
  but the temptation to write them is reduced.

  (beyond this, we go further to encourage a more no-sql approach to accessing
  data, which is described below)

- **Discouraging the use of hooks:**

  Sequelize allows the definition of "hooks" as part of the model, which are
  functions that run as part of a database access
  (e.g. modifying data before an update, or performing an action after a new row
  has been inserted into a table, etc...).

  In the HPC codebase, hooks have had a history of obscuring exactly what's
  happening to data in the database at the business-logic layer, when it is
  assumed that the `update`, `create` or `destroy` actions that are run are the
  only changes that will happen to the database.

  It has been agreed upon by the development team that a better approach would
  be to have logic that would typically be encapsulated in hooks be expressed as
  libraries built on-top of the database model instead, and used directly by the
  business-logic code. This allows for these behaviors to be much more clearly
  discovered and understood.

- **Better library for query-building:**

  Without the use of hooks and joins, then we'd be using the sequelize library
  for little more than a query building library (and to define the schema).
  Given that:

  - Defining the model/schema has to be done in migrations anyway
    (so is effectively duplicated)
  - Sequelize model definitions don't provide any static-type checking
  - Knex is a more feature-rich query building library
  - We already use `knex` in portions of our codebase
    (such as in some unit-tests)

  It made more sense to move forward with `knex`.

In addition to the above,
the library has been designed in a way to try and help us reduce existing
technical debt, and prevent it's accumulation in the future by:

- **Encouraging a no-sql approach to database accesses:**

  For our use of database storage, eventually consistent access is sufficient.

  More specifically, when reading data, it's usually okay for us to read data
  using multiple queries (where data may have changed between query executions)
  and combining the data as appropriate using business-logic.

  In cases where this is insufficient, transactions can be used.

  Borrowing from ideas of other no-sql systems (such as Google Datastore),
  the library is designed to make single-table accesses very easy and
  discoverable, and should be used in almost all cases.

  (that being said, it's always possible to access a raw knex table for a model
  when the exposed functions are insufficient, though this must be used
  sparingly).

- **Special handling of "accidentally optional" fields:**

  Historically, the HPC schema used to have many columns (across various tables)
  defined as possibly `NULL`, whereas those columns should really be `NOT NULL`.
  In cases where application code treated these columns as `NOT NULL`, a migration
  fixed all these definitions and added `NOT NULL` constraints to the columns.

  However, there are some columns which should also have `NOT NULL` constraint,
  but there are some (usually very old) records where this column is actually `NULL`,
  thus these columns were not covered by the aforementioned migration.

  In order to prevent creating new records where this column would have `NULL`,
  those columns can be marked as "accidentally optional".

  When this is done, the static type-checking requires this field to be
  specified when creating new rows for a table, but when reading data
  from the table, it is defined as possibly `null`.

- **Requiring type-validation of JSON fields:**

  Rather than assuming that each JSON field of a table has type `any` or
  `unknown`, when defining a model using this library, an `io-ts` type
  definition needs to be provided. This type definition is then used to validate
  all data as it's read from the database (and used for static type-checking of
  database writes), throwing an error upon read if invalid data is encountered.

  This means that unexpected data is discovered as soon as possible,
  and doesn't propagate through the application.

- **Allowing for type-narrowing of string fields:**

  In addition to specifying generic string columns, string unions can be defined
  when the values are expected to be one of a specific set of values,
  but where an ENUM was not used.

  This validation occurs in the same way as JSON fields, throwing an error upon
  a read when unexpected data is encountered.

- **Limiting returned data to well-known fields:**

  There may be cases when a database table has more columns that is defined in
  the model (for example when a new field has been added to a table via a
  migration, but the legacy API has not been updated with the new model).

  In these cases, the new fields will be removed when reading the data from
  the database to avoid returning data that may be unexpected.

- **Model Abstraction layers & masking (as opposed to "hooks"):**

  As written above, hooks are not implemented using this library given how they
  hide or mask behavior. However, they do have the nice property that they are
  **always** applied, no matter who is interacting with the database.

  As a result, mandatory actions are always ensured when using hooks.

  So if we are moving this behavior to libraries instead, how to we prevent
  these libraries being circumvented, and ensure that we can require mandatory
  use?

  To do this, our model library is written in a way that allows specific tables
  to:

  - overwrite their implementation of certain functions
  - hide certain functions that should never be directly accessed
  - introduce functions specific to that model

  For example:

  - the util `sequelize-model` builds on-top of `raw-model` to:
    - add `createdAt`, `updatedAt` and `deletedAt` fields do model definitions.
    - overwrite the behavior of `create` and `update` to update the above
      fields as required.
  - `authGrant` builds on-top of a model defined using `sequelize-model` to:
    - define custom `create` and `update` functions that transactionally log the
      change to the grant in addition to changing or creating the grant itself.
    - define a helper function `createOrUpdate` that is accessible in the model.

### Creating new Tables

When choosing which library functions to use when creating new tables,
it ultimately depends on what data needs to be tracked for each table.

For most data storage, use [Versioned Tables](#versioned-tables).
If there's no specific reason why something else should be used,
then this is the most sensible default,
as it provides a number of different features [see below](#versioned-tables).

**Exceptions:** However, Versioned Tables are not always suitable, and sometimes
it makes more sense to use [Raw Tables](#raw-tables) instead.

- Tables that cache data, or are only used for lookups / optimizing queries
- Tables that are solely data derrived from other tables (i.e. they're non-
  canonical)
- Tables where versioning data is deliberately handled in another manner, or
  not needed, and for a good reason, such as:
  - auth tables (where logging is handled via `authGrantLog`)
  - Logging data (as each entry is final, and will never change)
- Creating models for tables that already exist (i.e. legacy tables that were
  created using sequelize in `hpc_service`).

#### Versioned Tables

These tables have a number of features that are handled automatically:

- Using the `no-sql` methodology to store the primary data
  (data definitions are defined using `io-ts`, and allow for migration-less
  updates to many changes in the model)
- Being versioned
  (providing a full auditable and usable (revertable) log,
  and optionally storing the user IDs of those who made changes)
- Preventing asynchronous changes
  (i.e. providing functionality that allows for transactional checks that
  prevent one user accidentally overwriting / changing data from another user)
- Easy derivation of lookup columns by specifying a `prepare` function

To create a new Versioned table, the best bet is to look at some examples that
already use them:

- [`operation`](src/db/models/operation.ts)
- [`reportingWindowAssignment`](src/db/models/reportingWindowAssignment.ts)

But in short, you need to do the following:

- Create a new module in `src/db/models` with the same
  name that the table will have. Inside this module:

  - Specify a branded ID type:

    ```ts
    export type MyTableId = Brand<
      number,
      { readonly s: unique symbol },
      'myTable.id'
    >;

    export const MY_TABLE_ID = brandedType<number, MyTableId>(t.number);
    ```

    The type definition `MyTableId` and accompanying `io-ts` codec `MY_TABLE_ID`
    are then used to ensure that IDs from one table are not accidentally used in
    other tables (when e.g. filtering data from the database) using TypeScript
    static typing.

    Though as they are simply numeric values, there is no runtime type checking.

  - Specify an `io-ts` type definition that defines the structure of the data that
    needs to be stored (i.e., stored for each version of an entity of this type).

    ```ts
    export const MY_TABLE_DATA = t.type({
      foo: t.number,
      bar: t.string,
    });
    ```

  - Export the final definition as a default value. Call `defineVersionedModel`
    like so:

    ```ts
    export default defineVersionedModel({
      tableBaseName: 'myTable',
      idType: MY_TABLE_ID,
      data: MY_TABLE_DATA,
      lookupColumns: {
        columns: {},
        prepare: async () => ({}),
      },
    });
    ```

    You can optionally specify lookup columns that should be added to the "root"
    (i.e. head) database entry for each entity of this table. This allows for
    creating postgres queries with where clauses that allow for filtering the
    results based on the data in the most recent version

    It's also possible to use lookup columns to create additional constraints
    on the data, such as foreign keys or uniqueness constraints.

- Add the model to `src/db/index.ts`
- Create a migration in `hpc_service` to create the tables as needed.

#### Raw Tables

These tables are indirectly used by `Versioned Tables` above,
and should only be used for a table if there is a very good reason that
Versioned Tables are unsuitable.

- Create a new module in `src/db/models` with the same
  name that the table will have. Inside this module:
  - Pick an appropriate function to base your model definition on, i.e:
    - `defineIDModel`:
      to describe a table that was previously defined using sequelize,
      and that has a unique ID field
    - `defineSequelizeModel`:
      to describe a table that was previously defined using sequelize,
      and that does not have a unique `ID` field
    - `defineRawModel`:
      to describe any other table (e.g. association tables)
  - Export a call to the above function as default.
- Add the model to `src/db/index.ts`
