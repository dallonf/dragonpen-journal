export const sanitizeIndexName = (input: string) =>
  input.replace(/[\/*?"<>| ,#]/g, '');
