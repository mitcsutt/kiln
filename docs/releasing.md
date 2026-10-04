# Releasing

Kiln releases with [Changesets](https://changesets.dev). Each package has its own version ([ADR 0008](adr/0008-versioning-and-release.md)), and npm publishing goes through trusted publishing with provenance ([ADR 0016](adr/0016-trusted-publishing.md)).

Nothing has been published yet. The pipeline is in place, but publishing stays switched off until the [prerequisites](#prerequisites) below are done.

## How a release happens

1. **A pull request adds a changeset.** Any pull request that changes a published package runs `pnpm changeset` and commits the file it creates (see [CONTRIBUTING](../CONTRIBUTING.md#changesets)). The `Changeset` job in CI fails if one is missing.
2. **Merging to `main` opens a "Version packages" pull request.** The [release workflow](../.github/workflows/release.yml) runs on every push to `main`. While there are pending changesets, it runs `changeset version` and opens or updates a pull request titled `chore(release): version packages`. That pull request bumps versions, writes each package's `CHANGELOG.md` and deletes the consumed changesets.
3. **Merging the version pull request publishes.** On the next run there are no changesets, but some versions aren't on npm yet. The workflow builds, packs the tarballs (`changeset pack`), and publishes them from the `npm` environment. It then pushes a git tag per package (`@mitcsutt/kiln-ui@0.2.0`) and creates a GitHub release for each.

Pull requests opened by the workflow's `GITHUB_TOKEN` don't trigger other workflows, so CI doesn't run on the version pull request by itself. Run it from the Actions tab, or close and reopen the pull request, before merging.

## Prerequisites

The repository owner does these once. None of them are in the repo, and no secrets are needed.

1. **Own the `@mitcsutt` scope on npm.** Every package publishes as `@mitcsutt/kiln-*` with public access. The npm account that owns the scope needs two-factor authentication turned on.
2. **Allow Actions to open pull requests.** In the repository settings, under _Actions > General_, turn on _Allow GitHub Actions to create and approve pull requests_. Without it, the version job fails with `GitHub Actions is not permitted to create or approve pull requests`.
3. **Create the `npm` environment.** Under _Settings > Environments_, create an environment named `npm` and add yourself as a required reviewer. Each publish then waits for approval.
4. **Make the repository public before the first publish.** npm only creates provenance attestations for packages published from a public repository. From a private repository, the publish still succeeds, but without provenance. [ADR 0013](adr/0013-licence-and-visibility.md) plans for the repository to go public at `1.0.0`, so publishing `0.x` with provenance means going public sooner. That's the owner's call.
5. **Publish each new package once by hand.** npm sets up trusted publishing in a package's settings page, which only exists once the package does. For each package that isn't on npm yet, publish its first version locally from a clean checkout of `main`:

   ```sh
   pnpm install --frozen-lockfile
   pnpm build
   npm login
   pnpm changeset publish   # prompts for a one-time password
   git push --follow-tags
   ```

   Versions published this way have no provenance. If npm has since added a way to set up trusted publishing before a package's first publish, use that and skip this step.

6. **Add a trusted publisher to each package.** On npmjs.com, open each package's _Settings > Trusted publishing_ and add a GitHub Actions publisher: owner `mitcsutt`, repository `kiln`, workflow `release.yml`, environment `npm`. Then set _Publishing access_ to require two-factor authentication and disallow tokens.
7. **Switch publishing on.** Under _Settings > Secrets and variables > Actions > Variables_, add a repository variable `NPM_PUBLISH_ENABLED` set to `true`. Until it exists, the workflow still opens version pull requests but skips the pack and publish jobs.

Steps 5 and 6 also apply later, whenever a new package joins the repo.

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
