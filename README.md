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