/**
 * Layer:      Repository Helpers
 *
 * Purpose:
 * Provides shared utilities for repository queries, such as
 * tenant-scoping filters to prevent duplication.
 */

const withStoreScope = (storeId, query = {}) => ({
  ...query,
  where: {
    ...query.where,
    storeId,
  },
});

module.exports = {
  withStoreScope,
};
