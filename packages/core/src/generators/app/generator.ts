import {
  addProjectConfiguration,
  formatFiles,
  getWorkspaceLayout,
  names,
  normalizePath,
  Tree,
} from '@nrwl/devkit';
import * as path from 'path';
import { NxDotnetGeneratorSchema } from './schema';
import { execSync } from 'child_process';
import { DotNetClient, dotnetFactory } from '../../core';

interface NormalizedSchema extends NxDotnetGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  projectLanguage: string;
  projectTemplate: string;
  parsedTags: string[];
}

function normalizeOptions(
  host: Tree,
  options: NxDotnetGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(host).appsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
    projectLanguage: options.language,
    projectTemplate: options.template,
  };
}

export default async function (host: Tree, options: NxDotnetGeneratorSchema) {
  const dotnetClient = new DotNetClient(dotnetFactory());
  const normalizedOptions = normalizeOptions(host, options);
  addProjectConfiguration(host, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'application',
    sourceRoot: `${normalizedOptions.projectRoot}`,
    targets: {
      build: {
        executor: '@nx-dotnet/core:build',
      },
    },
    tags: normalizedOptions.parsedTags,
  });
  dotnetClient.new(normalizedOptions.template, [
    {
      flag: 'language',
      value: normalizedOptions.language,
    },
    {
      flag: 'name',
      value: normalizedOptions.name,
    },
    {
      flag: 'output',
      value: normalizedOptions.projectRoot,
    },
  ]);

  await formatFiles(host);
}
