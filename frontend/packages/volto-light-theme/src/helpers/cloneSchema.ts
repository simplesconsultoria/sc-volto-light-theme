/**
 * Deep copy of a block schema before handing it to a form that mutates it.
 *
 * Plain objects and arrays are copied; anything else (functions such as a
 * widget's `filterOptions`, class instances, primitives) is kept by
 * reference. A JSON round-trip would silently drop the functions.
 */
export function cloneSchema<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneSchema(item)) as T;
  }
  if (
    value !== null &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cloneSchema(item)]),
    ) as T;
  }
  return value;
}
