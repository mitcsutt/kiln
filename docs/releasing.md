# Releasing

Kiln releases with [Changesets](https://changesets.dev). Each package has its own version ([ADR 0008](adr/0008-versioning-and-release.md)), and npm publishing goes through trusted publishing with provenance ([ADR 0016](adr/0016-trusted-publishing.md)).

All five packages are on npm. Their first versions (`0.1.0`) were published by hand on 2026-10-05, so they have no provenance. The [prerequisites](#prerequisites) below are done, and later versions publish from the release workflow.

## How a release happens

1. **A pull request adds a changeset.** Any pull request that changes a published package runs `pnpm changeset` and commits the file it creates (see [CONTRIBUTING](../CONTRIBUTING.md#changesets)). The `Changeset` job in CI fails if one is missing.
2. **Merging to `main` opens a "Version packages" pull request.** The [release workflow](../.github/workflows/release.yml) runs on every push to `main`. While there are pending changesets, it runs `changeset version` and opens or updates a pull request titled `chore(release): version packages`. That pull request bumps versions, writes each package's `CHANGELOG.md` and deletes the consumed changesets.
3. **Merging the version pull request publishes.** On the next run there are no changesets, but some versions aren't on npm yet. The workflow builds, packs the tarballs (`changeset pack`), and publishes them from the `npm` environment. It then pushes a git tag per package (`@mitcsutt/kiln-ui@0.2.0`) and creates a GitHub release for each.

Pull requests opened by the workflow's `GITHUB_TOKEN` don't trigger other workflows, so CI doesn't run on the version pull request by itself. Run it from the Actions tab, or close and reopen the pull request, before merging.

## Prerequisites

A maintainer with admin access to the repository and the npm scope does these once. None of them are in the repo, and no secrets are needed. They were done on 2026-10-05 for the five current packages. Steps 5 and 6 still apply to any new package.

1. **Own the `@mitcsutt` scope on npm.** Every package publishes as `@mitcsutt/kiln-*` with public access. The npm account that owns the scope needs two-factor authentication turned on.
2. **Allow Actions to open pull requests.** In the repository settings, under _Actions > General_, turn on _Allow GitHub Actions to create and approve pull requests_. Without it, the version job fails with `GitHub Actions is not permitted to create or approve pull requests`.
3. **Create the `npm` environment.** Under _Settings > Environments_, create an environment named `npm`. Under _Deployment branches and tags_, restrict it to `main`. GitHub only offers required reviewers on public repositories and some paid plans. Where they're available, add a maintainer so each publish waits for approval. Without required reviewers, the manual gate is merging the "Version packages" pull request.
4. **Make the repository public.** npm only creates provenance attestations for packages published from a public repository. From a private repository, the publish still succeeds, but without provenance. [ADR 0032](adr/0032-public-before-1-0.md) makes the repository public before `1.0.0`, once it meets the bar in [ADR 0013](adr/0013-licence-and-visibility.md).
5. **Publish each new package once by hand.** npm sets up trusted publishing in a package's settings page, which only exists once the package does. For each package that isn't on npm yet, publish its first version locally from a clean checkout of `main`:

   ```sh
   pnpm install --frozen-lockfile
   pnpm build
   npm login
   pnpm changeset publish   # prompts for a one-time password
   git push --follow-tags
   ```

   Versions published this way have no provenance. A newly published scoped package can take a few minutes to appear on the public registry, so wait before looking for its settings page or running `npm view`. If npm has since added a way to set up trusted publishing before a package's first publish, use that and skip this step.

6. **Add a trusted publisher to each package.** On npmjs.com, open each package's _Settings > Trusted publishing_ and add a GitHub Actions publisher: owner `mitcsutt`, repository `kiln`, workflow `release.yml`, environment `npm`. Under _Allowed actions_, `npm stage publish` is always allowed. Also allow publishing directly, because the release workflow publishes directly and a staged publish would need promoting by hand. Leave dist-tag management off. Then, under _Settings > Publishing access_, choose _Require two-factor authentication and disallow bypass 2fa tokens (recommended)_. npm notes that every publishing-access option works with trusted publishers, so the workflow keeps publishing.
7. **Switch publishing on.** Under _Settings > Secrets and variables > Actions > Variables_, add a repository variable `NPM_PUBLISH_ENABLED` set to `true`. Until it exists, the workflow still opens version pull requests but skips the pack and publish jobs.

Steps 5 and 6 also apply later, whenever a new package joins the repo. [Adding a new package](#adding-a-new-package) does both with a placeholder version, so the first real version still comes from the workflow, with provenance.

## Adding a new package

A new package can't get a trusted publisher until it exists on npm, and a version published by hand has no provenance. So the first publish is a placeholder, `0.0.0`, and the first real version (`0.1.0`) publishes from the workflow like any other. `@mitcsutt/kiln-structure` was the first package added this way.

1. **The package's pull request leaves it at `0.0.0`.** Its `package.json` says `"version": "0.0.0"`, and its changeset is a `minor`, so the "Version packages" pull request bumps it to `0.1.0`. Merge the package's pull request, but don't merge that version pull request until step 4.
2. **A maintainer publishes `0.0.0` by hand.** From a clean checkout of `main`:

   ```sh
   pnpm install --frozen-lockfile
   npm login
   cd packages/<name>
   pnpm publish --access public --no-git-checks   # prompts for a one-time password
   ```

   `pnpm publish` swaps `workspace:` and `catalog:` ranges for real versions, as the workflow does. Don't tag or push anything: the placeholder isn't a release. A newly published scoped package can take a few minutes to appear, so wait until `npm view @mitcsutt/kiln-<name>` finds it.

3. **Add the trusted publisher and lock publishing down.** With npm 11.10 or later, the publisher can be added from the command line:

   ```sh
   npm trust github @mitcsutt/kiln-<name> --repo mitcsutt/kiln --file release.yml --env npm
   npm trust list @mitcsutt/kiln-<name>   # check it
   ```

   This is the same publisher as [step 6](#prerequisites) above, so check the package's _Settings > Trusted publishing_ page allows publishing directly. Then, under _Settings > Publishing access_, choose _Require two-factor authentication and disallow bypass 2fa tokens (recommended)_. Optionally, mark the placeholder so nobody installs it: `npm deprecate @mitcsutt/kiln-<name>@0.0.0 "Placeholder. Use 0.1.0 or later."`.

4. **Merge the version pull request.** The workflow publishes `0.1.0` through trusted publishing, with provenance, tags it and creates its GitHub release. Check for `dist.attestations` as in [Provenance details](#provenance-details).

## Checking the pipeline without publishing

Run these from a clean checkout to rehearse a release locally. They change files, so throw the changes away afterwards (`git checkout . && git clean -fd packages .changeset`).

```sh
pnpm changeset --patch @mitcsutt/kiln-tsconfig -m "Rehearsal"   # add a changeset
pnpm changeset version                                           # bump versions, write changelogs
pnpm changeset publish-plan                                      # what would be published
pnpm changeset pack --out-dir /tmp/kiln-pack                     # build the tarballs
pnpm publish /tmp/kiln-pack/packages/<tarball>.tgz --dry-run --access public --no-git-checks
```

`changeset pack` packs with `pnpm pack`, which swaps `workspace:` and `catalog:` ranges for real versions. `pnpm publish --dry-run` runs every check except the upload.

## Provenance details

Changesets publishes with `pnpm publish` and can't pass it extra flags. pnpm 12 attaches provenance on its own when it publishes through trusted publishing from a public repository, and the package is public. A token-based publish doesn't get provenance through Changesets, which is one more reason the workflow uses trusted publishing only.

To check a release, run `npm view @mitcsutt/kiln-<name> --json` and look for `dist.attestations`, or look for the provenance badge on the package page.
