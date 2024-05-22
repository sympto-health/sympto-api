#### Security Notes

- Your client id and client secret are **secure and sensitive** credentials. These should not be stored anywhere in **plain text**.
- Use best practices when storing and using your client id and secret, in accordance with HITECH / HIPAA.
- Note that e-PHI is accessible using your client id and secret.
- Understand that by using this API, you are responsible for securing any mechanisms that allow access to e-PHI.
- Sympto audits all usage of the SSO integration, and these audits are available upon request.
- Reset your password every 15 days.
- **Insecure usage of the API and insecure storage of credentials are both in violation of the Rely Business Addendum Agreement**.

> We will use JavaScript and the [Axios](https://github.com/axios/axios) library as examples in this document.

## **1. Generate a Bearer Token**

Use the `/authorization` endpoint to generate a temporary bearer token. The bearer token is used as an authentication mechanism for the API and **expires 15 minutes after creation**.

> We recommend that you initiate a new bearer token for every new set of APIs being used on the Sympto platform.

#### API Information

URL: `/authorization`

Type: `POST`

Body:
| Variable | Type |
|--|--|
| clientId | Email or phone number used to authenticate your clinic admin account |
| clientSecret | Password used to authenticate your clinic admin account |

Response (JSON)

```json
{
  "Status": "OK",
  "Response": {
    "authCode": "BEARER_TOKEN_AUTH_CODE"
  }
}
```

*JavaScript Request Example*

```javascript
const { data: { Response: authCode } } = await axios.post(
  'https://api.staging.symptodev.site/authorization', 
  {
    clientId: 'MY_CLIENT_ID',
    clientSecret: 'MY_CLIENT_SECRET'
  }
);
```

## **2. Generate a Rate Token**

Use the `/authorization/rateToken` endpoint to generate a rate token. The rate token is used for rate limiting purposes and **expires 15 minutes after creation**.

#### API Information

URL: `/authorization/rateToken`

Type: `GET`

Response (JSON)

```json
{
  "Status": "OK",
  "Response": "RATE_TOKEN"
}
```

*JavaScript Request Example*

```javascript
const { data: { Response: rateToken } } = await axios.get(
  'https://api.staging.symptodev.site/authorization/rateToken'
);
```

## **3. Example Usage with Bearer Token and Rate Token**

Here is an example of using both the bearer token and rate token for making a request to the `/providers/patients` endpoint.

*JavaScript Request Example*

```javascript
const bearerToken = 'YOUR_BEARER_TOKEN';
const rateLimitToken = 'YOUR_RATE_TOKEN';

await axios.post(
  'https://api.staging.symptodev.site/providers/patients',
  {
    firstName: 'John',
    email: 'a@a.com',
    confirmEmail: 'a@a.com',
    lastName: 'Doe',
    phoneNumber: null,
    notificationType: ['email'],
    notes: '',
    timeZone: 'Asia/Tokyo'
  },
  {
    headers: {
      authorization: `Bearer ${bearerToken}`,
      'RATE-TOKEN': rateLimitToken
    }
  }
);
```

## **Best Practices**

-   If you successfully log in, you can call the authorization endpoint as many times as needed.
-   The authorization and rate-limit endpoints themselves are **NOT rate-limited** for successful calls.
-   However, if you make more than 10 invalid requests in a 5-minute period, you will be rate-limited.
