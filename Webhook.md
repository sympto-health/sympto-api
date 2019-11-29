## You've successfully integrated with the Sympto API, now what?

> Before this step, it is expected that you have been able to integrate with the Sympto API. This means that you have successfully created user accounts and groups on Sympto. 
> **If you have not yet reached this stage, please first try integrating the basic authentication and account creation API** 

**1. Set up a mechanism generate user-specific auth tokens within your codebase**
For example, JSON web tokens are a popular mechanism for generating auth tokens. 

In our sample integration documentation, you can find an example of JWT usage:
[https://github.com/sympto-health/sympto-api/blob/master/src/jwt.ts](https://github.com/sympto-health/sympto-api/blob/master/src/jwt.ts) 
For this example:
 - An auth token with a user's email is generated with an expiry of 10 minutes. (createAuthKey method)
 - Given an auth token, a user's email is returned  - if the auth token has not yet expired (verifyAuthKey method)

> We strongly recommend that all generated auth tokens automatically expire, and that, as a system administrator, you have the ability to invalidate any given auth token. 
 
 **2. Set up a webhook endpoint**
 In our codebase, set up an endpoint for Sympto to call to help authenticate a given user.

Sympto will directly call your endpoint on page load, passing in an auth token (generated from step 1) along with a clientId and clientSecret.

Here is an example of a webhook endpoint: [https://github.com/sympto-health/sympto-api/blob/master/src/routes/index.ts#L26-L48](https://github.com/sympto-health/sympto-api/blob/master/src/routes/index.ts#L26-L48)

For this example:
 - First, the endpoint verifies that the authentication header and authenticationCode are passed in correctly (as non null values)
 - Second, the endpoint validates the authentication header. The authentication header is passed using  [HTTP basic auth](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#Basic_authentication_scheme). The passed in client id and client secret are compared to the expected credentials. 
> **Validating the authentication header is completely optional, but a recommended security measure, to ensure that only Sympto is calling your webhook endpoint.** 
 - Finally, the authenticationCode itself is decoded (this is the same JWT token that we generated in step 1), and the endpoint responds with an email, in the form `{ email: <email>  }`.

Make sure that your endpoint fits the following constraints:

 - Supports the HTTP POST method
 - Validates the client id and client secret using HTTP basic auth *(optional, but strongly recommended)*
 - Decodes the authenticationCode and returns the email address of the user based on this authentication code
 - Returns a response in the format `{email: <email>}` with a status code of 200


 **3. Configure Sympto to use your webhook endpoint**
 
