# Dragonpen Journal

An app for journaling in the cloud across multiple devices by making short entries throughout the day.

## Set up dev environment

### You will need

- A Posix environment; I have made no effort to make this work on Windows
- AWS SDK, authenticated for us-east-1
- Node (written with 14.5.0) and NPM (written with 6.14.5)
- An Auth0 app, set up with both client and API

### Configuration

Create a configuration file at `env/.env`:

```
ENV_NAME=local # can be something else if you want a different DB
EPHEMERAL_DATA=1
LOCALHOST_API=4000
LOCALHOST_APP=3000

# Optional
REPL_USER_ID=[The ID of a test user in Auth0 - used to initialize a server REPL]
AUTH0_TEST_CLIENT_ID=[The ID of a test web application in Auth0 - used to power the /jwt route locally for grabbing a JWT out of Auth0]
AUTH0_TEST_CLIENT_ID=[The secret key corresponding to the above]
```

In `env`, run `npm install` and `npm start`. This will generate more detailed configuration and distribute it to the other projects.

### Dependencies

Run `npm install` in `journaling-client` and `journaling-server`.

### Database

If there's no `JournalingDBStack-local` (or `JournalingDBStack-[ENV_NAME]`, if you changed it above) stack in AWS CloudFormation, you'll need to create it:

1. Enter the `cdk` directory
2. Run `npm install`
3. Run `npm deploy:db`

### Running dev servers

Finally, in the root of the repository, run `code journaling.code-workspace` (if you want to use Visual Studio Code) and `sh tmux-dev.sh`. This will start the web servers. To close Tmux and the servers, press `Ctrl-B` and then `d` (for "detach").

### Elaboration on Tmux setup

The Tmux client runs several commands simultaneously:

* Server
  * TypeScript checks. Not required, but helpful for viewing all type errors at a glance and with more helpful formatting than IDE integrations often give.
  * GraphQL/TypeScript codegen. This is required to get up-to-date strong types for GraphQL resolvers based on the schema definition.
  * The server itself, on port 4000.
* Client
  * TypeScript checks. Not required, but helpful for viewing all type errors at a glance and with more helpful formatting than IDE integrations often give.
  * GraphQL/TypeScript codegen. This is required to get up-to-date strong types for GraphQL queries.
  * The app itself, on port 3000.

## Using Ops Scripts

In the `ops-scripts` folder, you'll find a couple of scripts that are helpful for managing instances.

### dynamodb-copy-table.py

Copy all the data from one table to another with a compatible schema. Usage:

```sh
python3 ops-scripts/dynamodb-copy-table.py [source-table] [destination-table]
```
(hint: as of writing, the format for a table name in AWS is `Dragonpen-[table name]-[env name]`; for example, `Dragonpen-JournalEntries-production`)

By default, it assumes you're running in the `us-east-1` region; to change this, set the `AWS_DEFAULT_REGION` env variable.


## Deployment

Deployment relies on GitHub Actions. The intended workflow looks like this:

1. Develop on a feature branch.
2. When ready to deploy a test environment, create a pull request to master on GitHub.
3. Wait for the bots to post both a CDK diff and a link to a test environment where you should smoke-test the app for any regressions.
4. When you merge the pull request, it will automatically be deployed to production.
5. If you need to roll back, use the "Revert" button in the pull request to roll back the changes. To actually keep working on the branch in a way that can be merged back into master later, you'll need to revert the revert because Git is weird.

The config for this is in `.github/workflows`. These files should tell you what would need to be done for a manual deployment.

