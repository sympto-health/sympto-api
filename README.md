
# Sympto API Docs

## Basic Setup

This repository is an example **Node / Express Application** that integrates the Sympto API.

To get started, after checking out this repository,  go to the cloned folder and run `touch .env` to create a new .env file in the root of the repository.  Open the .env file and set the following environment variables.

```
CLIENT_ID=<XXX>
CLIENT_SECRET=<XXX>
CLIENT_URL=<XXX>
CLIENT_FRONTEND_URL=<XXX>
```


# Sympto API Docs

## Basic Setup

This repository is an example **Node / Express Application** that integrates the Sympto API.

To get started, after checking out this repository,  go to the cloned folder and run `touch .env` to create a new .env file in the root of the repository.  Open the .env file and set the following environment variables.

```
CLIENT_ID=<XXX>
CLIENT_SECRET=<XXX>
CLIENT_URL=<XXX>
CLIENT_FRONTEND_URL=<XXX>
```



> Note that the Client URL must be in the format http://<DEV_BOX_URL>
>    (No trailing slash, and include http)
>  The client frontend URL will usually be the Client URL without the specified port number, unless otherwise noted.

A sample .env file might look like for a dev setup (where we give you a client URL and a client frontend):

```
CLIENT_ID=team@symptohealth.com
CLIENT_SECRET=password1234
CLIENT_URL=http://112.89.343.341:5000
CLIENT_FRONTEND_URL=http://112.89.343.341
```

## Starting the Application

This application runs node, and both the node runtime and npm are required for any functionality.

After installing node and npm, run `npm install` within the repository. This will install all dependencies.

Next, run `npm run build` to create a minified build of the codebase, followed by `npm run start`

Starting the application will expose port `3000` locally, allowing you to access the express app via `http://localhost:3000`

Since this application is designed to test connectivity with Sympto Health, ngrok ([https://ngrok.com/](https://ngrok.com/)) is used to publicly expose the web server.

To verify your configuration, on application start, you should see the following:

```
{"message":{"clientId": <CLIENT_ID>,"clientSecret":<CLIENT_SECRET>,"clientURL":<CLIENT_URL>,"clientFrontendURL": <CLIENT_FRONTEND_URL>}

{"message":"Started server on url https://dd8aa578.ngrok.io","level":"info"}

{"message":"Express server started on port: 3000","level":"info"}
```
> Note that the ngrok url is randomly generated. The express app can either be accessed via localhost:3000 or the ngrok url directly

## Testing the endpoints

All the endpoints that are user accessible are `GET` endpoints and can be queried directly from the browser.

Endpoints can be found in `src/routes/index.ts`

**The following are the available endpoints**

`/setup` endpoint first fetches an auth code from Sympto (using the environment variable set client id and secret), and then sets the user creation webhook to point to the **POST** `/patient/webhook` endpoint.

`/create` creates 2 groups, 4 patients accounts, and 2 providers. It then assigns each provider and user account to a group.

> If you receive a 422 on /create on first run, it probably means you have already run this endpoint. You cannot create two users with the same set of emails and phone numbers. Look at the console logs for the server process to debug this, and contact us directly.

​

`/info` responses with a list of groups, patients and providers, along with information set for the webhook endpoint

> Note that logs are generated when each endpoint is called.  These logs are accessible from the STDOUT output of npm run start

Note that these endpoints take no parameters and can either be run from Postman or from the browser directly, by navigating to 	`http://localhost:3000/<endpoint>`.

Make sure to run each of these commands in sequence for best results.

## Testing the iFrame / SSO

### What are auth Tokens?
Auth tokens *allow* you to maintain programmatic control over which users are allowed to login to Sympto and when.

You can accomplish this in two ways, either using an iFrame to restrict certain users to particular pages within the Sympto application, or leveraging your in-house software platform to connect with Sympto via SSO. 

####  Auth Token Properties
Auth tokens are generated using the **Sympto API** and have the following properties:
 - After an auth token is created, it must be used to authenticate a user **within 60 seconds**. After 60 seconds, the auth token will *expire* and you will be required to generate a new one. 
 - Auth Tokens are single use. Once an auth token is used, it will automatically *expire*, and for future authentications, a new auth token will need to be created. 


> In this example code, we generate and use an auth token from the `/url`  endpoint. The steps below describe the functionality of the endpoint in detail. 

**For the sake of this example, lets pretend that we are trying to set up single sign on for Bob, whose email is bob@gmail.com.**

### 1. Generating a bearer token
First, we generate a bearer token using the `/authorization` endpoint in Sympto. This bearer token is used to authenticate all future API requests. 
  
### 2. Generating auth token
Once we identify a user whom we would like to authenticate, we then call the `/authorization/login/token` endpoint, passing in Bob's email. 

This endpoint will return a `userAuthToken` string, representing the single use authentication token.

> By default, in our seeds, we create two providers, one with the email doc1@mailinator.com and doc2@mailinator.com for testing purposes with this endpoint.

### 2. Using Auth Token

Finally, we generate a URL using the auth token, in the following format:

 `https://symptohealthdeployment.com?userAuthToken=123123123123`
 -  `https://symptohealthdeployment.com` represents your Sympto sandbox **frontend url** 
 - `123123123123` represents your fetched userAuthToken

Bob can now use this URL to securely login to Sympto. The `userAuthToken` is verified, and if Bob is redirected to the URL within 60 seconds, and the auth token is original, Bob can now interact with the Sympto platform. 

### How do I test this?
The `/url` endpoint takes in an email parameter, automatically generates a **frontend URL** authenticating the user with the given email.  
Try generating a Sympto url with the following emails:

 - `/api/url?email=doc1@mailinator.com`
 - `/api/url?email=doc2@mailinator.com`

Note that users with both of these email addresses are automatically created by the `/create` endpoint

Once a user is successfully authorized, a 15 minute user session is generated, allowing the user to freely navigate the Sympto platform.


### More documetation
[SSO / Webhook Integration](https://github.com/sympto-health/sympto-api/blob/master/Webhook.md)



> Note that the Client URL must be in the format http://<DEV_BOX_URL>
>    (No trailing slash, and include http)
>  The client frontend URL will usually be the Client URL without the specified port number, unless otherwise noted.

A sample .env file might look like for a dev setup (where we give you a client URL and a client frontend):

```
CLIENT_ID=team@symptohealth.com
CLIENT_SECRET=password1234
CLIENT_URL=http://112.89.343.341:5000
CLIENT_FRONTEND_URL=http://112.89.343.341
```

## Starting the Application

This application runs node, and both the node runtime and npm are required for any functionality.

After installing node and npm, run `npm install` within the repository. This will install all dependencies.

Next, run `npm run build` to create a minified build of the codebase, followed by `npm run start`

Starting the application will expose port `3000` locally, allowing you to access the express app via `http://localhost:3000`

Since this application is designed to test connectivity with Sympto Health, ngrok ([https://ngrok.com/](https://ngrok.com/)) is used to publicly expose the web server.

To verify your configuration, on application start, you should see the following:

```
{"message":{"clientId": <CLIENT_ID>,"clientSecret":<CLIENT_SECRET>,"clientURL":<CLIENT_URL>,"clientFrontendURL": <CLIENT_FRONTEND_URL>}

{"message":"Started server on url https://dd8aa578.ngrok.io","level":"info"}

{"message":"Express server started on port: 3000","level":"info"}
```
> Note that the ngrok url is randomly generated. The express app can either be accessed via localhost:3000 or the ngrok url directly

## Testing the endpoints

All the endpoints that are user accessible are `GET` endpoints and can be queried directly from the browser.

Endpoints can be found in `src/routes/index.ts`

**The following are the available endpoints**

`/setup` endpoint first fetches an auth code from Sympto (using the environment variable set client id and secret), and then sets the authentication webhook to point to the **POST** `/webhook` endpoint.

`/create` creates 2 groups, 4 patients accounts, and 2 providers. It then assigns each provider and user account to a group.

> If you receive a 422 on /create on first run, it probably means you have already run this endpoint. You cannot create two users with the same set of emails and phone numbers. Look at the console logs for the server process to debug this, and contact us directly.

​

`/info` responses with a list of groups, patients and providers, along with information set for the webhook endpoint

> Note that logs are generated when each endpoint is called.  These logs are accessible from the STDOUT output of npm run start

Note that these endpoints take no parameters and can either be run from Postman or from the browser directly, by navigating to 	`http://localhost:3000/<endpoint>`.

Make sure to run each of these commands in sequence for best results.

## Testing the iFrame / SSO

### 1. Auth Token generation
Auth tokens are generated using JSON web tokens with a 10 minute expiry.  Within each JWT, the user's email is encoded, so that on decoding, we can fetch the email associated with the JWT. After 10 minutes, the JWT will return expired. The JWT implementation can be found here: `src/jwt.ts`

The JWT is encoded with a user email, and when decoded, a user email is decoded.

This is an example of an approach that could be used to generate auth tokens. Other approaches aside from JWT are compatible with our system, since our system does not directly mutate or read the token in any way.

### 2. Sympto URL generation
The Sympto URL with the auth code can be generated from the `/url`  endpoint.
This endpoint takes in an email address as a query parameter, `email`
(ie `/url?email=bob@gmail.com`)
and generates an auth token specific to that email address. The endpoint returns a URL to Sympto along with the auth code.

> By default, in our seeds, we create two providers, one with the email doc1@mailinator.com and doc2@mailinator.com
>
> Patient account emails should never be used in this endpoint, since patients interact with Sympto soley via their own email or phone.

**When going to the URL, if you receive the message 'Unable to connect to Sympto Health. Invalid auth code.', this means that you either entered an invalid email (ie the webhook responded with an invalid code) or your webhook is not configured correctly - by default in this repo, the webhook is configured correctly**

### 3.  Authentication

When you navigate to the generated Sympto URL, Sympto will attempt to authenticate the auth token using the  **POST** `/webhook` endpoint. The `/webhook` endpoint returns an email address, in the format `{ email: <email> }`, and if a user with the given email has an account on Sympto, the user will be logged in.

> Note that if a user with the specified email does not exist on the Sympto platform, the generated URL will not work. Make sure that you call the /create endpoint before testing out the iFrame

Try generating a Sympto url with the following emails:

 - `/api/url?email=doc1@mailinator.com`
 - `/api/url?email=doc2@mailinator.com`

Note that both these email addresses are hard coded in the `/create` endpoint

Once a user is successfully authorized, a 15 minute user session is generated, allowing the user to freely navigate the Sympto platform.


### More documetation
[SSO / Webhook Integration](https://github.com/sympto-health/sympto-api/blob/master/Webhook.md)
