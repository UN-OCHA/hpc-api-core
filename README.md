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

## Testing

Unit tests are essential for the stability of the project. They should be written
using `ContextProvider` singleton, which gives access to models.

To avoid the need for providing tables to clear in each test suite, we use
transaction approach. There is `getTransaction` utility function and all
tests should access DB using the transaction, which is reverted after each test case.

### Running the tests

The test can be run with the bash script: `bin/test.sh`

This will compose up the docker containers needed to run the tests, then will run the test suites.
After the tests, will set down the containers.

### Debug the tests

Assuming the use of VSCode, you can find two files inside `.vscode` folder.
These tasks describe the behaviour needed to debug the tests.

Just simply add the breakpoints in the code editor and run 'Debug Jest Tests' inside 'Debug and Run' tab.

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
