/**
 * Maximum number of clauses allowed when parsing a boolean
 * query string in Solr; 1024 is the default value
 *
 * [Source](https://solr.apache.org/guide/8_1/query-settings-in-solrconfig.html#maxbooleanclauses)
 */
export const SOLR_MAX_BOOLEAN_CLAUSES = 1024;

/**
 * The maximum number of query parameters in PostgreSQL is 65,535
 *
 * [Source](https://www.postgresql.org/docs/current/limits.html)
 */
export const PG_MAX_QUERY_PARAMS = 2 ** 16 - 1;
