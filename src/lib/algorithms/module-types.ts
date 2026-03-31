export type SearchAlgorithmModule<TArgs extends unknown[], TResult> = {
  search: (...args: TArgs) => TResult;
};

export type SortAlgorithmModule<TArgs extends unknown[], TResult> = {
  sort: (...args: TArgs) => TResult;
};

export type RunAlgorithmModule<TOptions, TResult> = {
  run: (options: TOptions) => TResult;
};

export type SolveAlgorithmModule<TArgs extends unknown[], TResult> = {
  solve: (...args: TArgs) => TResult;
};

export type GenerateStepsAlgorithmModule<TArgs extends unknown[], TStep> = {
  generateSteps: (...args: TArgs) => TStep[];
};

export type CreateAlgorithmModule<TArgs extends unknown[], TResult> = {
  create: (...args: TArgs) => TResult;
};

export type AddAlgorithmModule<TTarget, TArgs extends unknown[], TResult> = {
  add: (target: TTarget, ...args: TArgs) => TResult;
};

export interface QuickSortAlgorithmModule<
  TResult,
> extends SearchAlgorithmModule<[number[], string?, string?], TResult> {
  quickSort: (
    arr: number[],
    partitionScheme?: string,
    pivotStrategy?: string,
  ) => TResult;
}
