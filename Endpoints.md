  

# Available Endpoints 

This guide provides an overview on how to use various endpoints within the Sympto ecosystem.
*For Single Sign On Integration, see [here](https://github.com/sympto-health/sympto-api/blob/master/Webhook.md). We also support most **SAML** providers*

#### Security Notes

 - Your client id and client secret are **secure and sensitive** credentials. These should not be stored anywhere in **plain text**
 - Note that e-PHI is accessible using your client id and secret
 - Understand that by using this API, you are responsible for securing any mechanisms that allow access to e-PHI. 
- Rotate your API key on a recurring acdence. You will be prompted to rotate it every 15 days. 
 - **Insecure usage of the API  and insecure storage of credentials are both in violation of the Sympto Business Addendum Agreement** 


## **API Authorization**

Use the `/authorization` endpoint to generate a temporary bearer token. The bearer token is used as an authentication mechanism for the API and **expires 15 minutes after creation**. 

#### API Information

URL: `/authorization`

Type: `POST`

Body: 

| Variable     | Type                                                         |
| ------------ | ------------------------------------------------------------ |
| clientId     | Email or phone number used to authenticate your clinic admin account |
| clientSecret | API secret used to authenticate your clinic admin account    |

Response (JSON)

```javascript
{
		Status: 'OK',
		Response: {
				authCode: 'BEARER_TOKEN_AUTH_CODE',
		}
}
```

```javascript
const { data: { Response: authCode } } = await axios.post(
  'https://symptosandboxapi.com/authorization', 
  {
    clientId: 'MY_CLIENT_ID',
    clientSecret: 'MY_CLIENT_SECRET',
  },
);
```

-----

### Patients

#### Data Model

| Field            | Value                  | Notes                                                        |
| ---------------- | ---------------------- | :----------------------------------------------------------- |
| firstName        | *string (required)*    |                                                              |
| lastName         | *string (required)*    |                                                              |
| timeZone         | *enum (required)*      | Timezone of the patient (patient will receive automated messages based on their timezone) [https://gist.github.com/prithvin/97266af350cf1becfc1887253a0e5a1d](https://gist.github.com/prithvin/97266af350cf1becfc1887253a0e5a1d)  see this list for a complete list of timezones Ex: Africa/Bangui is a timezone with a UTC offset of GMT+01:00 |
| email            | *string (optional)*    | Email or phone number are required for patient creation      |
| phoneNumber      | *string (optional)*    | Email or phone number are required for patient creation. We accept the e.164 phone number format ([https://www.twilio.com/docs/glossary/what-e164](https://www.twilio.com/docs/glossary/what-e164)) |
| sex              | *enum (optional)*      | *enum values*: `'M' 'F' 'X'`                                 |
| dob              | *string (optional)*    | format `YYYY-MM-DD`                                          |
| language         | *enum (optional)*      | `'English' | 'Spanish' | 'French'` -> patients receive automated Whatsapp consent messages in specified language / see patient portal in specified language |
| mrn              | *string (optional)*    | Medical record number                                        |
| notificationType | Array<enum> (required) | `email` `text` `whatsapp`.<br /><br />Options for how the patient would like to receive notifications: `email` `text` `whatsapp`. Patient must have email provided if email notifications set. Patient must have phone provided if text or WhatsApp notifications set. |
| patientTvId      | *string (required*)    | UUID for patient                                             |


#### **Patient Creation**

Creates a patient. Patients by default are not accessible by any providers aside from the clinic administrator.

In order to give providers access to a patient, a patient must be added to a group associated with a provider.

##### **Side effects of patient account creation**

> Patient receives introductory consent message via notification channels


URL: `/providers/patient/create`

Type: `POST`

Headers: Use `authCode` from Step 1 as a [bearer token](https://swagger.io/docs/specification/authentication/bearer-authentication/)

Body:

| Field            | Value (See Data Model)   |
| ---------------- | ------------------------ |
| firstName        | *string (required)*      |
| lastName         | *string (required)*      |
| timeZone         | *string (required)*      |
| email            | *string (optional)*      |
| phoneNumber      | *string (optional)*      |
| sex              | *enum (optional)*        |
| dob              | *string (optional)*      |
| language         | *enum (optional)*        |
| mrn              | *string (optional)*      |
| notificationType | *Array<enum> (required)* |

Response:

```javascript
{
	Status: 'OK',
	Response: patientTvId (see patient data model)
}
```


## **Messages**

#### Data Model

| **Field**      | Value             | **Notes**                                                    |
| -------------- | ----------------- | ------------------------------------------------------------ |
| recentlyViewed | boolean           | Whether or not a given message has been recently viewed by the authenticated API user. Marked true if this is the first time the given API user has fetched this message. |
| from.name      | string            | Name of the user who sent the message                        |
| from.tvid      | string (optional) | UUID of the user who sent the message. PatientTvId if patient sent message, null if automated system message |
| isConsent      | boolean           | Whether or not this is a consent message (consent messages are sent by default on patient creation) |
| sentAt         | number            | Date in milliseconds from epoch.                             |
| message        | string            | Message received by the patient                              |
| id             | string            | UUID of message                                              |
| viewed         | Array<object>     | Array of objects specifying  who has viewed the message      |
| patientId      | string            | patientTvId (see patient data model) of the message receiver |
| role           | Enum              | role of the sender<br />`'patient' | 'doctor' | 'nurse' | 'admin' | 'system' | 'clinicAdmin' | 'audit'` |

#### Message Creation

URL: `/provider/messaging/:patientTvId`

> URL Parameters :patientTvId -> (see patient data model)

Type: `POST`


Body: 

| Variable | Type                                |
| -------- | ----------------------------------- |
| message  | (string) Message to send to patient |

Response:

```javascript
{
	Status: 'OK',
	Response: true,
}
```

#### Message Fetch

URL: `/provider/messaging/:patientTvId`

> URL Parameters :patientTvId -> (see patient data model)

Type: `GET`

Body: 

| Variable | Type                | **Value**                                                    |
| -------- | ------------------- | ------------------------------------------------------------ |
| before   | *number (optional)* | Date in milliseconds from epoch. Returns all messages from **before** this timestamp |
| after    | *number (optional)* | Date in milliseconds from epoch. Returns all messages from **after** this timestamp |
| limit    | *number (optional)* | Number of messages to fetch                                  |

Response:

```javascript
{
	Status: 'OK',
	Response: {
    messages: Array<MessageDataModel>, (see message data model)
    hasNewMessages: boolean, (true when there are additional new messages still unread)
}
```





## Generic Surveys

#### Generic Survey Data Model 

| Field           | **Value**                       |
| :-------------- | ------------------------------- |
| genericSurveyId | string (UUID of generic survey) |

> Each generic survey (or media item / instrument) created within sympto is associated with a unique id.



#### Start Date Preferences Data Model 

| **Field**         | **Value**                                                    |
| ----------------- | ------------------------------------------------------------ |
| type              | 'adhoc' \| 'recurring' <br />if type adhoc, then only sent out through GUI. |
| nOccurrences      | (for type recurring) number of times item should be sent out |
| timeOfDay.hours   | (for type recurring), when item should be sent out in patient timezone hours (0-23) |
| timeOfDay.minutes | (for type recurring), when item should be sent out in patient timezone minutes (0-59) |
| surveyStartDate   | (for type recurring), when item should be sent out in patient timezone (date)<br />format `YYYY-MM-DD` |
| frequency         | (for type recurring)<br /><br />`{ type: 'weekly', everyN: number, days: Array<'Sun'|'Mon'|'Tue'|'Wed'|'Thu'|'Fri'|'Sat'>, }`<br />type weekly, send out every n weeks on specified days <br /><br />`{ type: 'daily', everyN: number }`<br />type weekly, send out every n days <br /><br />`{ type: 'monthly', everyN: number, day: number }`<br />type monthly, send out every n months on a specific day (1-31) of the month <br /> |

#### Reccuring Survey Data Model 

| Field               | **Value**           | **Notes**                                                    |
| ------------------- | ------------------- | ------------------------------------------------------------ |
| recurringSurveyId   | *string*            | UUID representing the recurring survey                       |
| name                | *string*            | Name of the generic survey                                   |
| type                | *enum*              | Type of generic survey<br />`'instrument' | 'attachment' | 'message' | 'checklist' | 'exercise' | 'video'` |
| startDatePreference | *JSON*              | See **Start Date Preference**  data model                    |
| patientSurveys      | *JSON*              | Array of every instance of the recurring survey sent out. See **PatientSurvey** data model |
| campaign.id         | *string (optional)* | Id of campaign associated with recurring survey (if applicable) |
| campaign.name       | *string (optional)* | Name of campaign associated with recurring survey (if applicable) |

> Generic surveys that are assigned to patients are called RecurringSurveys. Each patient has an individual recurring survey for each assigned media item / instrument.
>
> Recurring surveys can be assigned to patients manually **or ** through a campaign. When assigned via campaign, the associated campaign is available within the recurring survey data model





#### Schedule / Send Survey Endpoint

URL: `/providers/patients/:patientTvId/genericSurvey`

> URL Parameters :patientTvId -> (see patient data model)

Type: `POST`

Body Parameters:

| **Field**                              | **Value**     |                                                              |
| -------------------------------------- | ------------- | ------------------------------------------------------------ |
| survey.duration                        | *number*      | number of hours item should be valid for                     |
| survey.genericSurveyId                 | *string*      | GenericSurveyId to be sent out                               |
| survey.messageData.creation            | *JSON*        | ```{ text: null | <MESSAGE>, email: null | { subject: <MESSAGE>, body: <MESSAGE> } } ```<br /><br />JSON blob specifying the message to send over to the patient over email / text (optionally can leave both values as null) on item creation |
| survey.messageData.reminder            | *JSON*        | ```{ text: null | <MESSAGE>, email: null | { subject: <MESSAGE>, body: <MESSAGE> } } ```<br /><br />JSON blob specifying the message to send over to the patient over email / text (optionally can leave both values as null) for **reminders** |
| survey.notifications.daysBeforeDueDate | Array<number> | Array of the number of days before the due date to send reminder to patient. Ex: `[1]` would send reminder to patient one day before the due date |
| survey.startDatePreference             | *JSON*        | See Start Date Preference  data model                        |

Response:

```javascript
{
	Status: 'OK',
	Response: RecurringSurveyId (see Recurring Survey data model)
}
```

## 



####  Fetch Instrument Responses  Endpoint

URL: `/providers/patients/:patientTvId/items`

> URL Parameters :patientTvId -> (see patient data model)

Type: `GET`

Query Parameters:

| **Field**       | **Value**                                                    |
| --------------- | ------------------------------------------------------------ |
| genericSurveyId | **optional**. Filter the fetched recurring surveys by generic survey.  If not passed in, all recurring surveys associated with the patient are returned. |

Body: Response:

```javascript
{
	Status: 'OK',
	Response: Array<Reccuring Survey Data Model>
}
```

## 



## File Management 

####  Sending Files Endpoint

URL: `/providers/file`

Type: `POST`

Body Parameters:

| **Field**   | **Value**                                                    |
| ----------- | ------------------------------------------------------------ |
| file        | **Blob / File** (see https://developer.mozilla.org/en-US/docs/Web/API/Blob for Javascript). |
| patientTvId | patientTvId (see patient data model) of the message receiver |
| message     | ***string*** Message received by the patient                 |
| fileName    | ***string*** Name of the file (shown in the GUI to both the patient / provider) |
| threadId    | ***(optional) string*** By default, this does not need to be passed. *threadId* represents the UUID of the provider thread. |

Body: Response:

```javascript
{
	Status: 'OK',
	Response: true
}
```

####  

## Response Model 

#### Response Data Model 

| Field            | **Value**                                                    |
| :--------------- | ------------------------------------------------------------ |
| patientSurveyId  | string (UUID of individual item sent out to the user)        |
| instrumentType   | enum (type of item sent out `instrument`, `attachment`, `message`, `checklist`,  `exercise`, `media`, `chatbot`) |
| completionMedium | Array<completion item object model> (list of all the users who participated in creating the final response) |
| response         | response answers data object model                           |

> Patient surveys are unique ids representing the individual item sent to the patient. A Generic Survey (model) should have multiple patient surveys.

#### Response Answers Data Model 

| Field              | **Value**                                                    |
| :----------------- | ------------------------------------------------------------ |
| dateCompleted      | number (Date in milliseconds from epoch for completion time) |
| responseCompletion | enum (type of item sent out `Full` (item fully complete), `Partial` (item partially complete), ``Empty` (user not started item)) |
| description        | Description of generic survey model associated with response |
| surveyName         | Name of generic survey model associated with response        |
| response           | Object - JSON blob, containing list of responses. Based on specific questions |
| questions          | Object - JSON blob - containing list of questions in associated generic survey model |
| responseId         | UUID associated with the response                            |

#### Completion Item Data Model 

| Field          | Value                                                        |
| :------------- | ------------------------------------------------------------ |
| channel        | enum (`Mobile` or `In-App`), medium where item was completed |
| user.type      | role of the  responder<br />`'patient' | 'doctor' | 'nurse' | 'admin' | 'system' | 'clinicAdmin' | 'audit'` |
| user.firstName | first name of responder                                      |
| user.lastName  | last name of responser                                       |
| user.tvid      | UUID associated with responder (PatientTvId for patient - see patient model) |

####  Creating a new Response / Sending patient items

URL : `/providers/patients/:patientTvId/recurringSurvey/:recurringSurveyId`

> Recurring  surveys ids are unique ids representing the set of items sent to the user.  (See Reccuring Survey Data Model)

> PatientTvId is the  unique ids representing the  patient.  (See Patient Data Model)

Type: `POST`

Body Parameters:

| **Field**  | **Value**                                                    |
| ---------- | ------------------------------------------------------------ |
| type       | enum (`immediate`, `dates`) immediate sends item immediately. dates scheduled item by date |
| startDates | Array<format `YYYY-MM-DD-hh-mm`> of dates to send item out (when type = `dates`) |

Body Response:

```javascript
{
	Status: 'OK',
	Response: Array<ResponseId> // see Response model (one response id for each start date)
}
```

####  

####  Updating a Response

URL: `/patients/responses/adhoc/:recurringSurveyId`

> Recurring  surveys ids are unique ids representing the set of items sent to the user.  (See Reccuring Survey Data Model)

Type: `POST`

Body Parameters:

| **Field**          | **Value**                                                    |
| ------------------ | ------------------------------------------------------------ |
| response           | Object - JSON blob, containing list of responses. Based on specific questions |
| responseId         | UUID of response                                             |
| responseCompletion | enum (type of item sent out `Full` (item fully complete), `Partial` (item partially complete)). Passing in `Full` marks the item as complete |

Body Response: 

```javascript
{
	Status: 'OK',
	Response: true
}
```



####  Configuring Response Webhook

> See Reccuring Survey Data Model for webhook payload example. This payload is encrypted with the **public key**

URL: `/responses/webhook`

Type: `POST`

Body Parameters:

| **Field** | **Value**                                  |
| --------- | ------------------------------------------ |
| url       | URL of webhook (must be a `POST` endpoint) |
| secret    | public key  (for asymmetric encryption)    |

Body Response: 

```javascript
{
	Status: 'OK',
	Response: true
}
```



#### Email prithvi@symptohealth.com with any further questions.
