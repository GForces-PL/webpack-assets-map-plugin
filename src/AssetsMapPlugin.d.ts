type AssetsMapPluginResults = {
  entrypoints: {
    [name: string]: string[];
  }
  assets?: {
    [source: string]: string;
  }
  auxiliaryFiles?: string[]
};

type AssetsMapPluginOptions = {
  output: string;
  formatter: (output: AssetsMapPluginResults) => string;
  clean: boolean;
  assets: boolean;
  auxiliaryFiles: boolean;
  rootPath: string;
}

declare class AssetsMapPlugin {
  constructor(options?: Partial<AssetsMapPluginOptions>);
}

export = AssetsMapPlugin;
