# `@unocha/hpc-api-core`

[![](https://badgen.net/npm/v/@unocha/hpc-api-core)](https://www.npmjs.com/package/@unocha/hpc-api-core)

This NPM library contains the core code that is shared between the various parts
of the HPC.Tools API (`https://api.hpc.tools`), in particular:

- The existing legacy API systems
- The new v4 open-source API:
  [github.com/UN-OCHA/hpc-api](https://github.com/UN-OCHA/hpc-api)

It is not designed to be used outside these applications,
as it requires direct access to the HPC.Tools database,
which is only available from inside the HPC.Tools deployment environments.

## Usage

This library is supposed to be used in conjunction with `ts-node`,
so includes TypeScript source code only and is not published with compiled JS
and type declaration files.

This is done to improve the development experience in a number of ways, in
particular:

- Jump-to-definition (in vscode etc...) goes to original source files, rather
  than generated declarations
- Manual compilation can be avoided while developing
- Certain TypeScript quirks can be avoided by importing TypeScript files
  directly (such as needing `unique symbol` to only be used in exported
  interfaces, reducing how much inference can be used)

## Development

If you are contributing to the development of this library,
more information can be found in our [CONTRIBUTING](CONTRIBUTING.md) document.

## License

Copyright 2020 United Nations Office for the Coordination of Humanitarian Affairs

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

<http://www.apache.org/licenses/LICENSE-2.0>

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
