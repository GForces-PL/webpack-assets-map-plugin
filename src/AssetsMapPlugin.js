const fs = require('fs');
const path = require('path');

/** @typedef {import('./webpack').Compiler} Compiler */
/** @typedef {import('./webpack').Compilation} Compilation */
/** @typedef {import('./webpack').Entrypoint} Entrypoint */

/**
 * @typedef {Object} AssetsMapPluginResults
 * @property {Object.<string, string[]>} entrypoints
 * @property {Object.<string, string> | undefined} assets
 * @property {string[] | undefined} auxiliaryFiles
 */

/**
 * @callback Formatter
 * @param {AssetsMapPluginResults} output
 * @return string
 */

/**
 * @typedef {Object} AssetsMapPluginOptions
 * @property {boolean} assets
 * @property {boolean} auxiliaryFiles
 * @property {boolean} clean
 * @property {Formatter} formatter
 * @property {string} output
 * @property {string} rootPath
 */

/** @type {AssetsMapPluginOptions} */
const defaultOptions = {
  assets: true,
  auxiliaryFiles: false,
  clean: false,
  formatter: JSON.stringify,
  output: 'assetsMap.json',
  rootPath: '',
};

class AssetsMapPlugin {
  /** @param {Partial<AssetsMapPluginOptions>} options */
  constructor(options = {}) {
    this.options = {...defaultOptions, ...options};
  }

  /**
   * @param {Compiler} compiler
   * @return {void}
   */
  apply(compiler) {
    this.compilerOutputPath = compiler.options.output.path || '';
    this.options.rootPath = this.options.rootPath ? fs.realpathSync(this.options.rootPath) : this.compilerOutputPath;

    compiler.hooks.afterEmit.tap('AssetsMapPlugin', compilation => {
      /** @type {AssetsMapPluginResults} */
      const results = {
        entrypoints: {},
        assets: {},
        auxiliaryFiles: [],
      };
      compilation.entrypoints.forEach(entrypoint => {
        results.entrypoints[entrypoint.name] = [];
        entrypoint.options.dependOn?.forEach(/** @param {string} dependencyEntryPointName */ dependencyEntryPointName => {
          results.entrypoints[entrypoint.name].push(...this.getEntryPointFiles(compilation.entrypoints.get(dependencyEntryPointName)));
        });
        results.entrypoints[entrypoint.name].push(...this.getEntryPointFiles(entrypoint));
      });
      compilation.assetsInfo.forEach((info, file) => {
        if (info.sourceFilename) {
          results.assets[info.sourceFilename] = this.relativePath(this.modulePath(file));
        } else {
          results.auxiliaryFiles.push(this.relativePath(this.modulePath(file)));
        }
      });

      if (this.options.clean) {
        const assets = [...Object.values(results.entrypoints).flat(), ...Object.values(results.assets), ...results.auxiliaryFiles]
          .map(file => fs.realpathSync(`${this.options.rootPath}/${file}`));
        /** @type {string[]} */
        const checkedPaths = [];
        assets.forEach(asset => {
          const dir = path.dirname(asset);
          if (checkedPaths.includes(dir)) {
            return;
          }
          checkedPaths.push(dir);
          fs.readdirSync(dir, {withFileTypes: true})
            .filter(file => !(file.isDirectory() || assets.includes(`${dir}/${file.name}`)))
            .forEach(file => fs.rmSync(`${dir}/${file.name}`));
        });
      }

      ['assets', 'auxiliaryFiles'].forEach(option => !this.options[option] && delete results[option]);
      const content = this.options.formatter(results);
      fs.writeFileSync(this.options.output, content);
    });
  }

  /**
   * @param {string} file
   * @return {string}
   */
  relativePath(file) {
    return path.relative(this.options.rootPath, file);
  }

  /**
   * @param {string} file
   * @return {string}
   */
  modulePath(file) {
    return fs.realpathSync(`${this.compilerOutputPath}/${file}`);
  }

  /**
   * @param {Entrypoint} entryPoint
   * @return {string[]}
   */
  getEntryPointFiles(entryPoint) {
    return [...entryPoint.chunks.reduce((/** @type {string[]} files */ files, chunk) => files.concat([...Array.from(chunk.files).map(file => this.relativePath(this.modulePath(file)))]), [])];
  }
}

module.exports = AssetsMapPlugin;
