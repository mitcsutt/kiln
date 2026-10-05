# Architecture decision records

Each record captures one decision: the context, what was decided, and what follows from it. Records are numbered and never rewritten. To change a decision, add a new record that supersedes the old one, and mark the old one `Superseded by NNNN`.

| #                                                  | Decision                                                  | Status                    |
| -------------------------------------------------- | --------------------------------------------------------- | ------------------------- |
| [0001](0001-standalone-repo-and-naming.md)         | Standalone repo, `@mitcsutt/kiln-*` naming                | Accepted                  |
| [0002](0002-port-by-copy.md)                       | Port by copy, rename Press to Kiln                        | Accepted                  |
| [0003](0003-theming-model.md)                      | Token contract, `paper` default, opt-in presets           | Accepted                  |
| [0004](0004-react-18-and-19.md)                    | Support React 18 and 19                                   | Accepted                  |
| [0005](0005-library-build.md)                      | Vite library mode for every runtime package               | Accepted, amended by 0022 |
| [0006](0006-toolchain.md)                          | Monorepo toolchain                                        | Accepted                  |
| [0007](0007-shared-config-packages.md)             | Shared ESLint, Prettier and TS config packages            | Accepted                  |
| [0008](0008-versioning-and-release.md)             | Changesets, independent versions, start at 0.1.0          | Accepted, amended by 0017 |
| [0009](0009-docs-and-storybook.md)                 | Fumadocs for public docs, Storybook as workbench          | Accepted                  |
| [0010](0010-information-architecture.md)           | One nested tree for docs and Storybook                    | Accepted                  |
| [0011](0011-ai-tooling.md)                         | Agent skills via TanStack Intent, plus llms.txt           | Accepted                  |
| [0012](0012-design-standards.md)                   | Carry over the design and authoring standards             | Accepted                  |
| [0013](0013-licence-and-visibility.md)             | MIT, private repo written as public                       | Accepted                  |
| [0014](0014-config-package-shape.md)               | Shape of the shared config packages                       | Accepted                  |
| [0015](0015-kiln-ui-port.md)                       | How `kiln-ui` was ported: theming, build, tests           | Accepted                  |
| [0016](0016-trusted-publishing.md)                 | Trusted publishing, switched on by the owner              | Accepted                  |
| [0017](0017-kiln-forms-port.md)                    | How `kiln-forms` was ported: names, entries, checks       | Accepted                  |
| [0018](0018-storybook-workbench.md)                | How the Storybook workbench is built and tested           | Accepted                  |
| [0019](0019-docs-site.md)                          | How the docs site is built: Fumadocs core, Kiln chrome    | Accepted                  |
| [0020](0020-agent-skills.md)                       | How the agent skills are built from the docs              | Accepted                  |
| [0021](0021-forms-context-in-nested-components.md) | Typed form context for nested components in `kiln-forms`  | Accepted                  |
| [0022](0022-linked-consumers.md)                   | Linked consumers resolve built output through `kiln-dist` | Accepted                  |
| [0023](0023-theme-script-entry.md)                 | A React-free `theme-script` entry that plain Node loads   | Accepted                  |

New records use the next number and the same headings: Status, Context, Decision, Consequences.
