export interface ModelState {
  counter: number;
}

export function createModelState(): ModelState {
  return { counter: 0 };
}
