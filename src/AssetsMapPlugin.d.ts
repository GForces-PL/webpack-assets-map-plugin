type AssetsMapPluginResults = {
  entrypoints: {
    [name: string]: string[];
  }
  dependencies?: {
    [name: string]: string[];
  }
  assets?: {
    [source: string]: string;
  }
  auxiliaryFiles?: string[]
};

type AssetsMapPluginOptions = {
  assets: boolean;
  auxiliaryFiles: boolean;
  clean: boolean;
  dependencies: boolean;
  formatter: (output: AssetsMapPluginResults) => string;
  output: string;
  rootPath: string;
}

declare class AssetsMapPlugin {
  constructor(options?: Partial<AssetsMapPluginOptions>);
}

export = AssetsMapPlugin;
