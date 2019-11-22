
# Sympto API Docs



## Basic Setup

This repository is an example **Node / Express Application** that integrates the Sympto API.



To get started, after checking out this repository, run create a new `.env` file in the root of the repository with the following variables

```
CLIENT_ID=<XXX>
CLIENT_SECRET=<XXX>
CLIENT_URL=<XXX>
```



> Note that the Client URL must be in the format http://<DEV_BOX_URL>
>    (No trailing slash, and include http)



## Starting the Application

This application runs node, and both the node runtime and npm are required for any functionality.



After installing node and npm, run `npm install` within the repository. This will install all dependencies.



Next, run `npm run build` to create a minified build of the codebase, followed by `npm run start`



Starting the application will expose port `3000` locally, allowing you to access the express app via `localhost:3000`



Since this application is designed to test connectivity with Sympto Health, ngrok ([https://ngrok.com/](https://ngrok.com/)) is used to publicly expose the web server.



To verify your configuration, on application start, you should see the following:

```
{ clientId: <CLIENT ID>,
clientSecret: <CLIENT SECRET>,
clientURL: <CLIENT URL> }

{"message":"Started server on url https://0f352c83.ngrok.io","level":"info"}

{"message":"Express server started on port: 3000","level":"info"}
```
> Note that the ngrok url is randomly generated. The express app can either be accessed via localhost:3000 or the ngrok url directly

## Testing the endpoints

All the endpoints that are user accessible have been made `GET` endpoints and can be queried directly from the browser.

Endpoints can be found in `src/routes/index.ts`

`/api/setup` endpoint first fetches an auth code from Sympto (using the environment variable set client id and secret), and then sets the authentication webhook to point to the **POST** `/webhook` endpoint.

`/api/create` creates 2 groups, 4 patients accounts, and 2 providers. It then assigns each provider and user account to a group.

`/api/info` responses with a list of groups, patients and providers, along with information set for the webhook endpoint

> Note that logs are generated when each endpoint is called.  These logs are accessible from the STDOUT output of npm run start

## Testing the iFrame
