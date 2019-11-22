
# Sympto API Docs



## Basic Setup

This repository is an example **Node / Express Application** that integrates the Sympto API.



To get started, after checking out this repository, run create a new `.env` file in the root of the repository with the following variables

```
CLIENT_ID=<XXX>
CLIENT_SECRET=<XXX>
CLIENT_URL=<XXX>
CLIENT_FRONTEND_URL=<XXX>
```



> Note that the Client URL must be in the format http://<DEV_BOX_URL>
>    (No trailing slash, and include http)
>  The client frontend URL will usually be the Client URL without the specified port number, unless otherwise noted.


## Starting the Application

This application runs node, and both the node runtime and npm are required for any functionality.



After installing node and npm, run `npm install` within the repository. This will install all dependencies.



Next, run `npm run build` to create a minified build of the codebase, followed by `npm run start`



Starting the application will expose port `3000` locally, allowing you to access the express app via `localhost:3000`



Since this application is designed to test connectivity with Sympto Health, ngrok ([https://ngrok.com/](https://ngrok.com/)) is used to publicly expose the web server.



To verify your configuration, on application start, you should see the following:

```
{
	clientId: <CLIENT ID>,
	clientSecret: <CLIENT SECRET>,
	clientURL: <CLIENT URL>,
	clientFrontendURL: <CLIENT_FRONTEN_URL>
}

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

### 1. Auth Token generation
Auth tokens are generated using JSON web tokens with 10 minute expiries. The JWT implementation can be found here: `src/jwt.ts`

The JWT is encoded with a user email, and when decoded, a user email is decoded.

### 2. Sympto URL generation
The Sympto URL with the auth code can be generated from the `/api/url`  endpoint.
This endpoint takes in an email address
(ie `/api/url?email=bob@gmail.com`)
and generates an auth token specific to that email address. The endpoint returns a URL to Sympto along with the auth code.

### 3.  Authentication
When you navigate to the generated Sympto URL, Sympto will attempt to authenticate the auth token using the  **POST** `/webhook` endpoint. The `/webhook` endpoint returns an email address, in the format `{ email: <email> }`, and if a user with the given email has an account on Sympto, the user will be logged in.

> Note that if a user with the specified email does not exist on the Sympto platform, the generated URL will not work. Make sure that you call the /create endpoint before testing out the iFrame

Try generating a Sympto url with the following emails:
`/api/url?email=doc1@mailinator.com`
`/api/url?email=doc2@mailinator.com`
Note that both these email addresses are hard coded in the `/create` endpoint

Once a user is successfully authorized, a 15 minute user session is generated, allowing the user to freely navigate the Sympto platform.
