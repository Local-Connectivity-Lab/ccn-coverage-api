# ccn-coverage-api
An API service to receive `POST` data from test platform with SCN measurement testbed installed and providing `GET` data for the measurement visualization.

## Installation
Generate API keys and put it in `keys/api-pub` and `keys/api-secret`, used it for signing/validating the keys from Android's measurement app.

Make sure to have the following tools installed on your host system:
- make
- docker

For API Spec, please checkout our [models](https://github.com/Local-Connectivity-Lab/ccn-coverage-models).

## Development
We provide a development docker image for consistent developing environment. You can use `make dev` target to execute into the dev container and start developing if you don't have all the required dependencies installed on your system.

The project uses `Node.js` and `TypeScript` for most of the components.

Avoid committing your change directly to the `main` branch. Check out your own private branch for your development and submit a pull request when the feature/bug fix/cleanup is ready for review. Follow the [Angular Commit Message Conventions](https://github.com/angular/angular/blob/main/contributing-docs/commit-message-guidelines.md) for your commit message. Versions will be managed based on those commit messages. 

Refer to our [development guide](DEVELOPMENT.md) for more information.

## Testing
We use `docker compose` to mock other components in the system, i.e. LDAP for authentication and MongoDB with mock data. 
Run `docker compose up` to run the whole system. The main API service is running under port 3000, which is also exposed to the host machine.

## Contributing
Any contribution and pull requests are welcome! However, before you plan to implement some features or try to fix an uncertain issue, it is recommended to open a discussion first. You can also join our [Discord channel](https://discord.com/invite/gn4DKF83bP), or visit our [website](https://seattlecommunitynetwork.org/).

## License
ccn-coverage-api is released under Apache License. See [LICENSE](/LICENSE) for more details.


## CI/CD releases

Pushes and merges to `main` run the Release workflow: application checks followed
by semantic-release creating a version, Git tag, and GitHub release. This workflow
does not log in to a container registry or publish an image.

A published release starts two independent workflows for its tag:

- **Update deployment version** updates `input-manifest.yml` in
  `ccn-coverage-docker`. Registry availability does not affect this update.
- **Publish Docker image** checks out the exact release tag and pushes
  `icr.seattlecommunitynetwork.org/<repository>:<version>`. It updates `latest`
  only when that tag is the newest GitHub release, so retrying an older version
  does not move `latest` backwards.

Both follow-up workflows can also be started manually with an existing tag such
as `v1.2.3`. Image publication can be retried without creating another release or
changing the downstream version. Existing tags can be built even when their
Makefile does not have a publish target.

The downstream manifest can contain the new version before its image is available.
Deploy that version after the image-publishing workflow succeeds.

New commits receive at least a patch release; `feat:` selects a minor release and
`BREAKING CHANGE:` selects a major release. Releases on `main` are serialized.
A run with no unreleased changes does not create another release.

Required settings are `GH_TOKEN`, `REGISTRY_USERNAME`, `REGISTRY_PASSWORD`, and the
existing `SCN_GIT_NAME` / `SCN_GIT_EMAIL` variables. `GH_TOKEN` must be a personal
access token or GitHub App token that can release this repository and update the
deployment repository. Events created using only the default `GITHUB_TOKEN` do
not start the follow-up release workflows. See
[GitHub's workflow-trigger documentation](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow).
