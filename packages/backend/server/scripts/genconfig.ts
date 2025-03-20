/* eslint-disable */
import '../src/app';

import fs from 'node:fs';
import path from 'node:path';
import { ProjectRoot } from '@affine-tools/utils/path';
import {
  APP_CONFIG_DESCRIPTORS,
  ConfigDescription,
} from '../src/base/config/register';

interface PropertySchema {
  description: string;
  type: 'array' | 'boolean' | 'integer' | 'number' | 'object' | 'string';
  default?: any;
}

function convertDescriptorToSchemaProperty(descriptor: ConfigDescription<any>) {
  const property: PropertySchema = {
    description:
      descriptor.desc +
      (descriptor.env
        ? `\n@Environment \`${typeof descriptor.env === 'string' ? descriptor.env : descriptor.env[0]}\``
        : '') +
      (descriptor.link ? `\n@link ${descriptor.link}` : ''),
    default: descriptor.default,
    type: descriptor.type as any,
  };

  return property;
}

function generateJsonSchema() {
  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'AFFiNE Application Configuration',
    type: 'object',
    properties: {},
  };

  // Iterate through modules (top-level keys)
  for (const [moduleName, moduleDescriptors] of Object.entries(
    APP_CONFIG_DESCRIPTORS
  )) {
    // Create a property for each module
    schema.properties[moduleName] = {
      type: 'object',
      description: `Configuration for ${moduleName} module`,
      properties: {},
    };

    // Process properties for this module
    for (const [propKey, descriptor] of Object.entries(moduleDescriptors)) {
      // Convert the descriptor to a JSON schema property
      const property = convertDescriptorToSchemaProperty(descriptor);
      schema.properties[moduleName].properties[propKey] = property;
    }
  }

  return schema;
}

function main() {
  // Generate JSON schema
  const schema = generateJsonSchema();

  // Generate output file path
  const outputPath = ProjectRoot.join(
    '.docker',
    'selfhost',
    'schema.json'
  ).toString();

  // Write schema to file
  fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));

  console.log(`Config schema generated at: ${outputPath}`);
}

main();
