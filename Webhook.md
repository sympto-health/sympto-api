

# Integrating Single Sign On with Sympto

This tutorial is a step by step guide on how to integrate SSO / iFrames within Sympto.

*By the end of this guide, you will be able to generate a Sympto authentication token, which can then be used as a form of authentication on the Sympto platform.*

#### Security Notes

 - Your client id and client secret are **secure and sensitive** credentials. These should not be stored anywhere in **plain text**
 - Use best practices when storing and using your client id and secret, in accordance with HITECH / HIPAA
 - Note that e-PHI is accessible using your client id and secret
 - Understand that by using this API, you are responsible for securing any mechanisms that allow access to e-PHI. 
 - Sympto audits all usage of the SSO integration, and these audits are available upon request. 
 - Reset your password every 15 days
 - **Insecure usage of the API  and insecure storage of credentials are both in violation of the Sympto Business Addendum Agreement** 

> We will use JavaScript and the [Axios](https://github.com/axios/axios) library as examples axios in this document. 

> For the purposes of this integration, we will assume that your sandbox backend URL is **https://symptosandboxapi.com**.

## **1. Generate a Bearer Token**

Use the `/authorization` endpoint to generate a temporary bearer token. The bearer token is used as an authentication mechanism for the API and **expires 15 minutes after creation**. 

> We recommend that you initiate a new bearer token for every new set of APIs being used on the Sympto platform.

#### API Information
URL: `/authorization`
Type: `POST`
Body: 
| Variable | Type  |
|--|--|
| clientId | Email or phone number used to authenticate your clinic admin account |
| clientSecret | Password used to authenticate your clinic admin account |
Response (JSON)

    {
	    Status: 'OK',
		Response: {
			authCode: 'BEARER_TOKEN_AUTH_CODE',
		},
	}


*Javascript Request Example*

    const { data: { Response: authCode } } = await axios.post(
      'https://symptosandboxapi.com/authorization', 
      {
        clientId: 'MY_CLIENT_ID',
        clientSecret: 'MY_CLIENT_SECRET',
      },
    );

 
## **2. Generate a login token**

 
Now that we have a bearer token, we can now access the Sympto API.

In step 2, we will be generating a login token associated with an individual user. This might be a patient or provider whom we want to authenticate using our single sign on or iFrame system.

For the sake of this example, imagine we are building an SSO system and trying to authenticate John Doe, whose email is `john.doe@gmail.com`.


#### API Information
URL: `/authorization/login/token`
Type: `POST`
Headers: Use `authCode` from Step 1 as a [bearer token](https://swagger.io/docs/specification/authentication/bearer-authentication/)
Body: 
| Variable | Type  |
|--|--|
| email | Email of user being authenticated |
Response (JSON)

    {
	    Status: 'OK',
		Response: {
			userAuthToken: 'USER_AUTH_TOKEN',
		},
	}


*Javascript Request Example*

    const { 
        data: { Response: { userAuthToken } },
      } = await axios.post(
        `${clientURL}/authorization/login/token`,
        {
          email,
        },
        { headers: {'Authorization': 'Bearer '+authCode} },
      );

####  Important: User Auth Token Properties
 - After an auth token is created, it must be used to authenticate a user **within 60 seconds**. After 60 seconds, the auth token will *expire* and you will be required to generate a new one. 
 - Auth Tokens are single use. Once an auth token is used, it will automatically *expire*, and for future authentications, a new auth token will need to be created. 


## **3. Authenticate the user**
In this step, we are finally ready to authenticate our doctor, John Doe. 

In step 2, generated a user auth token for John, which will now be used by the Sympto frontend client to verify and authenticate John.

> For the purposes of this integration, we will assume that your sandbox frontend URL is **https://symptosandboxfrontend.com**.

All we have to do is a construct a URL. For example, if we want to take John to the patient dashboard, we'd use the following structure
`https://symptosandboxfrontend.com/provider/dashboard?userAuthToken=USER_AUTH_TOKEN`

Now, we can redirect John to this URL, and Sympto will automatically authenticate John.

Note that this URL must be visited within 60 seconds of step 2, or the *user auth token* will expire. 

Additionally, the *user auth token* is one time use token. After John visits the patient dashboard once, a new token will need to be generated

### All Done!!!
<img src="https://media1.giphy.com/media/l3q2zVr6cu95nF6O4/source.gif" alt="party" width="200"/>

#### Email prithvi@symptohealth.com with any further questions.
