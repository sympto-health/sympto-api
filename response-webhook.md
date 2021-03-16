### **API Token**

Use the `/authorization` endpoint to generate a temporary bearer token. The bearer token is used as an authentication mechanism for the API and **expires 15 minutes after creation**. 

URL: `/authorization`

Type: `POST`

Body: 

| Variable     | Type                                                         |
| ------------ | ------------------------------------------------------------ |
| clientId     | Email or phone number used to authenticate your clinic admin account |
| clientSecret | Password used to authenticate your clinic admin account      |

Response (JSON)

    {
        Status: 'OK',
    	Response: {
    		authCode: 'BEARER_TOKEN_AUTH_CODE',
    	},
    }



#### **Patient Creation**

Creates a patient.
URL: `/providers/patient/create`

Type: `POST`

Headers: Use `authCode` from Step 1 as a [bearer token](https://swagger.io/docs/specification/authentication/bearer-authentication/)

Body:

| Field            | Value                  |                                                              |
| ---------------- | ---------------------- | ------------------------------------------------------------ |
| firstName        | *string (required)*    |                                                              |
| lastName         | *string (required)*    |                                                              |
| timeZone         | *string (required)*    | Timezone of the patient (patient will receive automated messages based on their timezone) [https://gist.github.com/prithvin/97266af350cf1becfc1887253a0e5a1d](https://gist.github.com/prithvin/97266af350cf1becfc1887253a0e5a1d)  see this list for a complete list of timezones Ex: Africa/Bangui is a timezone with a UTC offset of GMT+01:00 |
| email            | *string (optional)*    | Email or phone number are required for patient creation      |
| phoneNumber      | *string (optional)*    | Email or phone number are required for patient creation. We accept the e.164 phone number format ([https://www.twilio.com/docs/glossary/what-e164](https://www.twilio.com/docs/glossary/what-e164)) |
| sex              | *enum (optional)*      | *enum values*: `'M' 'F' 'X'`                                 |
| dob              | *string (optional)*    | format `YYYY-MM-DD`                                          |
| language         | *enum (optional)*      | `'English' | 'Spanish' | 'French'` -> patients receive automated Whatsapp consent messages in specified language / see patient portal in specified language \| |
| mrn              | *string (optional)*    | Medical record number                                        |
| notificationType | Array<enum> (required) | `email` `text` `whatsapp`.<br /><br />Options for how the patient would like to receive notifications: `email` `text` `whatsapp`. Patient must have email provided if email notifications set. Patient must have phone provided if text or WhatsApp notifications set. |
| metadata         | *Object (optional)*    | Set of key-value pairs that you can attach to a patient. This can be useful for storing additional information about the object in a structured format. |

Response:

```json
{
	Status: 'OK',
	Response: PATIENT_UUID
}
```



### **Webhook Configuration**

URL: `/responses/webhook`

Type: `POST`

Headers: Use `authCode` from Step 1 as a [bearer token](https://swagger.io/docs/specification/authentication/bearer-authentication/)

Body:

| Field | **Value**                        |
| ----- | -------------------------------- |
| url   | The URL of the webhook endpoint. |

Response:

```javascript
{
	Status: 'OK',
	Response: {
		endpointSecret: The endpoint’s secret, used to generatwebhook signatures. Only returned at creation.
	}
}
```



### **Webhook Response**

Webhooks are sent whenever a new response is created or updated within Sympto. Webhooks for responses are guaranteed to be sent **at least once**. On webhook endpoint failure (non-`200` status code), the webhook will automatically retry with exponential backoff over the next <u>3 days</u>

**Headers** 

> Use headers to verify events that Sympto sends to your webhook endpoint.

| **Field**                  | Value                                                        |
| -------------------------- | ------------------------------------------------------------ |
| X-Sympto-Webhook-Signature | base64 encoded HMAC SHA-256 hash and timestamp (to prevent replay attacks) |



> Sympto generates the timestamp and signature each time an event is sent to your endpoint. If Sympto retries an event (e.g., your endpoint previously replied with a non-`200` status code), then a new signature and timestamp is generated for the new delivery attempt.

Example signature:

```
X-Sympto-Webhook-Signature: t=1492774577,v=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd
```

How to validate signature?

1. Extract timestamp / signatures from the header. 

   Split the header, using the `,` character as the separator, to get a list of elements. Then split each element, using the `=` character as the separator, to get a prefix and value pair.

   The value for the prefix `t` corresponds to the timestamp, and `v` corresponds to the signature (or signatures). You can discard all other elements.
   
   

2. Use the response body to compute an HMAC with the SHA256 hash function (with the `endpointSecret` as the key)
   
   

3. Compare the signature (or signatures) in the header to the expected signature. For an equality match, compute the difference between the current timestamp and the received timestamp, then decide if the difference is within your tolerance.

**Body**

```javascript
{
	Status: 'OK',
	Response: ResponseDataModel JSON,
}
```



>  See  Response Data Model for webhook payload example

#### Response Data Model

| Field            | **Value**                                                    |
| ---------------- | ------------------------------------------------------------ |
| patientSurveyId  | string (UUID of individual item sent out to the user)        |
| instrumentType   | enum (type of item sent out `instrument`, `attachment`, `message`, `checklist`, `exercise`, `media`, `chatbot`) |
| completionMedium | Array (list of all the users who participated in creating the final response) |
| response         | response answers data object model                           |

> Patient surveys are unique ids representing the individual item sent to the patient. A Generic Survey (model) should have multiple patient surveys.

#### Response Answers Data Model

| Field              | **Value**                                                    |
| ------------------ | ------------------------------------------------------------ |
| dateCompleted      | number (Date in milliseconds from epoch for completion time) |
| responseCompletion | enum (type of item sent out `Full` (item fully complete), `Partial` (item partially complete), `Empty` (user not started item)) |
| description        | Description of generic survey model associated with response |
| surveyName         | Name of generic survey model associated with response        |
| response           | Object - JSON blob, containing list of responses. Based on specific questions. Schema left to developer discretion. |
| questions          | Object - JSON blob - containing list of questions in associated generic survey model |
| responseId         | UUID associated with the response                            |

#### Completion Item Data Model

| Field          | Value                                                        |
| -------------- | ------------------------------------------------------------ |
| channel        | enum (`Mobile` or `In-App`), medium where item was completed |
| user.type      | role of the responder `'patient'`                             |
| user.firstName | first name of responder                                      |
| user.lastName  | last name of responser                                       |
| user.tvid      | UUID associated with responder (PatientTvId for patient - see patient model) |

#### 
