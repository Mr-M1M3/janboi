export type Entries<T extends Record<PropertyKey, unknown>> = {
  [x in keyof T]: [x, T[x]];
}[keyof T][];
