import {Chunk, Compilation as WebpackCompilation, Compiler as WebpackCompiler, EntryOptions} from 'webpack';
import {AsyncSeriesHook} from 'tapable';

export interface Entrypoint {
  name: string
  options: EntryOptions
  chunks: Chunk[]
}

export interface Compilation extends Omit<WebpackCompilation, 'entrypoints'> {
  entrypoints: Map<string, Entrypoint>
}

export interface Compiler extends WebpackCompiler {
  hooks: Omit<WebpackCompiler['hooks'], 'readonly afterEmit'> & {
    readonly afterEmit: AsyncSeriesHook<[Compilation]>;
  };
}
