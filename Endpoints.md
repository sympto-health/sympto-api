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
| dob              | *string (optional)*    | format `MM/DD/YYYY`                                          |
| language         | *enum (optional)*      | `'English', 'Spanish', 'French'` -> patients receive automated Whatsapp consent messages in specified language / see patient portal in specified language |
| mrn              | *string (optional)*    | Medical record number                                        |
| notificationType | Array<enum> (required) | `email` `text` `whatsapp` `email-instrument` <br /><br />Options for how the patient would like to receive notifications: `email` `text` `whatsapp`. Patient must have email provided if email notifications set. Patient must have phone provided if text or WhatsApp notifications set. Email allows patient to receive messages *and* questionnaires via email. Email instrument allows patient to receive questionnaires via email |
| patientTvId      | *string (required*)    | UUID for patient                                             |

#### **Patient Creation**

Creates a patient. Patients by default are not accessible by any providers aside from the clinic administrator.

In order to give providers access to a patient, a patient must be added to a group associated with a provider.

##### **Side effects of patient account creation**

> Patient receives introductory consent message via notification channels


URL: `/providers/patients` 

Type: `POST`

Headers: Use `authCode` from Step 1 as a [bearer token](https://swagger.io/docs/specification/authentication/bearer-authentication/)

Body:

| Field             | Value (See Data Model)                                       |
| ----------------- | ------------------------------------------------------------ |
| firstName         | *string (required)*                                          |
| lastName          | *string (required)*                                          |
| timeZone          | *string (required)*                                          |
| email             | *string (optional)*                                          |
| phoneNumber       | *string (optional)*                                          |
| sex               | *enum (optional)*                                            |
| dob               | *string (optional)*                                          |
| language          | *enum (optional)*                                            |
| mrn               | *string (optional)*                                          |
| notificationType  | *Array<enum> (required)*                                     |
| campaignIds       | Array<string> (optional) - list of campaign ids to enroll patient in (see campaign data model) |
| patientAttributes | Array(PatientAttributeModel) (optional) - list  of patient attributes to enroll patient in |

Response:

```javascript
{
  Status: 'OK',
  Response: patientTvId (see patient data model)
}
```



#### **Patient Management**

URL: `/providers/patient` 

Type: `GET`

Headers: Use `authCode` from Step 1 as a [bearer token](https://swagger.io/docs/specification/authentication/bearer-authentication/)

Query Parameters:

| **Field** | **Value**                                                    |
| --------- | ------------------------------------------------------------ |
| query     | **optional**. String representing a filter search term. Internally uses fuzzy search to query based on firstName, lastName, timeZone, email, phoneNumber, sex, dob, language and mrn fields |
| limit     | number. **optional**. default none                           |
| offset    | **optional**. UUID for last patient on previous page         |

Body: Response:

```javascript
{
  Status: 'OK',
  Response: Array<Patient Data Model + Group Data Model> (see example response)
}
```

Example 

```javascript
{
  Status: 'OK',
  Response: [{
    firstName: 'John',
    lastName: 'Doe',
    timeZone: 'America/Los_Angeles',
    email: null,
    phoneNumber: '+16507935243',
    sex: 'M',
    dob: '12-24-1934',
    language: 'English',
    mrn: null,
    notificationType: ['email'],
    groups: Array<{
      groupName: 'Provider Group',
      groupId: '3c0084bc-8b79-410f-b392-853e469b7753'
    }>
    // may include extra fields with patient metadata
  }]
}
```



#### **Patient Update**

URL: `/providers/patients/:patientTvId/update`

> URL Parameters :patientTvId -> (see patient data model)

Type: `POST`

Headers: Use `authCode` from Step 1 as a [bearer token](https://swagger.io/docs/specification/authentication/bearer-authentication/)

Body:

| Field             | Value (See Data Model)                                       |
| ----------------- | ------------------------------------------------------------ |
| firstName         | *string (required)*                                          |
| lastName          | *string (required)*                                          |
| timeZone          | *string (required)*                                          |
| email             | *string (optional) - either email or phone number required*  |
| phoneNumber       | *string (optional) - either email or phone number required*  |
| sex               | *enum (optional)*                                            |
| dob               | *string (optional)*                                          |
| language          | *enum (optional)*                                            |
| mrn               | *string (optional)*                                          |
| notificationType  | *Array<enum> (required)*                                     |
| patientAttributes | Array(PatientAttributeModel) (optional) - list  of patient attributes to enroll patient in |

> **Important Note**: If a patient's phone number is updated to a number that is already in use by another patient, the **system phone number** (the number from which the patient receives messages) may change. This is to maintain a one-to-one mapping between each patient's phone number and the system's outgoing message number.
>
> **Example Scenario**:
>
> 1. **Initial Situation**:
>    - Patient A has the phone number +123456789.
>    - Patient B updates their phone number to +123456789, which is now the same as Patient A's number.
>
> 2. **Change Due to Update**:
>    - To ensure clear and private communication, the system will assign different outgoing numbers for Patient A and Patient B.
>    - For instance, Patient A might continue to receive messages from the system number +9988776655.
>    - Patient B, after the update, might start receiving messages from a different system number, such as +1122334455.
>
> 3. **Outcome**:
>    - Both Patient A and Patient B have the same personal phone number (+123456789).
>    - However, they receive messages from the system in separate text threads from different numbers (Patient A from +9988776655, and Patient B from +1122334455).
>
> This approach ensures that each patient receives messages in a distinct and secure conversation thread, even if their personal phone numbers are identical.

Body: Response:

```javascript
{
  Status: 'OK',
  Response: true
}
```



#### **Patient Deletion**

Patient soft deleted from the digital clinic.  

Up to 4 other new patients with the same phone number can be created after an existing patient is deleted. **After 4 patients with the same phone number are created**, the phone number will no longer be available for use.

Beyond 4 patients, the phone numbers for existing patients must be replaced before a new patient with the same phone number can be created. 

##### **Side effects of patient account creation**

> Patient removed from all groups, and will not receive any further messages until re-enabled from the Sympto UI. Only the clinic administrator will have access to this patient.

URL: `/providers/patients/:patientTvId` 

> URL Parameters :patientTvId -> (see patient data model)

Type: `DELETE`

Headers: Use `authCode` from Step 1 as a [bearer token](https://swagger.io/docs/specification/authentication/bearer-authentication/)

Body Parameters: N/A

Body: Response:

```javascript
{
  Status: 'OK',
  Response: true
}
```



####  Configuring Patient Webhook

URL: `/patients/webhook`

Type: `POST`

Body Parameters:

| **Field** | **Value**                                  |
| --------- | ------------------------------------------ |
| url       | URL of webhook (must be a `POST` endpoint) |

Body Response: 

```javascript
{
  Status: 'OK',
  Response: true
}
```

**Webhook Payload**

See Webhook [webhook validation](https://github.com/sympto-health/sympto-api/blob/master/Endpoints.md#Webhook%20Validation) for more information

Request Body Example

```javascript
{
  firstName: 'John',
  lastName: 'Doe',
  timeZone: 'America/Los_Angeles',
  email: null,
  phoneNumber: '+16507935243',
  sex: 'M',
  dob: '12-24-1934',
  language: 'English',
  mrn: null,
  notificationType: ['email']
}
```

> Patient Data Model sent whenever a patient is created or updated



#### 

------



## **Patient Attributes**

#### Data Model

##### Patient Attribute Model

| **Field** | Value    | **Notes**                                                    |
| --------- | -------- | ------------------------------------------------------------ |
| title     | `string` | Title that shows for a given patient attribute in the GUI    |
| id        | `string` | UUID for patient attribute                                   |
| name      | `string` | Name of patient attribute (set in clinic admin settings, can be different from title). <u>unique</u> per clinic |
| type      | *enum*   | Type of patient attribute<br />`null`,  `string `, `boolean`,  `number` |



##### Patient Attribute Values Model

| **Field**          | Value                               | **Notes**                                                    |
| ------------------ | ----------------------------------- | ------------------------------------------------------------ |
| value              | `null`  `string` `boolean` `number` | Based on the type of the patient attribute                   |
| patientAttributeId | UUID for patient attribute          | Can fetch this via endpoint  GET request  `/providers/clinic/attributes` |



#### Listing Attributes

URL: `/providers/clinic/attributes`

Type: `GET`

Response:

```javascript
{
  Status: 'OK',
  Response: Array<PatientAttributeDataModel> (see message data model)
}
```



#### Set Attribute

URL: `/providers/:patientTvId/attributes`

> URL Parameters :patientTvId -> (see patient data model)

Type: `POST`

Body: 

| Variable       | Type                                 | **Value**                                  |
| -------------- | ------------------------------------ | ------------------------------------------ |
| name           | `string`                             | Attribute **name** (not UUID)              |
| attributeValue | AttributeValue data type (see below) | Based on the type of the patient attribute |

Attribute Value Data Type:

| Variable | Type                                | **Value**                                                    |
| -------- | ----------------------------------- | ------------------------------------------------------------ |
| type     | *`enum`*                            | type of patient attribute<br />`'string', 'boolean', 'number'` |
| value    | `null`  `string` `boolean` `number` | Based on the type of the patient attribute                   |

Example Request: 

```javascript
{
  name: 'dob',
  attributeValue: {
    type: 'string',
    value: '12-24-1997',
  }
}
{
  name: 'age',
  attributeValue: {
    type: 'number',
    value: 23,
  }
}
```

Response:

```javascript
{
  Status: 'OK',
  Response: true
}
```

> When a patient attribute is set, the patient is automatically enrolled in any campaigns that depend on the patient attribute



#### How to use Patient Attributes

1. Log in as a clinic admin

2. <img src="./settings.png" alt="image-20220117235133618" height="200" />

3. Create a new patient attribute

   <img src="./attribute.png" alt="image-20220117235241410" height="200" />

4. Navigate to campaigns tab and create campaign

   <img src="./campaignsdropdown.png" alt="image-20220117235404185" height="200" />

5. Auto enroll user in campaign if test attribute == a certain value

   <img src="./autoenroll.png" alt="image-20220117235536449" height="200" />

6. When patient attribute set, user will be automatically enrolled in the campaign

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
| role           | Enum              | role of the sender<br />`'patient', 'doctor', 'nurse', 'admin', 'system', 'clinicAdmin', 'audit'` |

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



####  

------



## Campaigns

#### Campaign Data Model

| **Field**     | Value         | Notes                          |
| ------------- | ------------- | ------------------------------ |
| name          | *string*      | Name of the campaign           |
| description   | *string*      | Description of campaign        |
| campaignItems | *Array<JSON>* | Array of items in the campaign |
| campaignId    | *string*      | UUID representing the campaign |



#### Fetch campaigns endpoint

URL: `/providers/campaigns`

Type: `GET` 

Parameters: N/A

Response:

```javascript
{
  Status: 'OK',
  Response: Array<Campaign Data Model>
}
```

####  

#### Assign patient to campaign

URL: `/providers/patients/:patientTvId/campaigns`

> URL Parameters :patientTvId -> (see patient data model)

Type: `POST` 

Query Parameters:

| **Field**  | **Value**                                                    |
| ---------- | ------------------------------------------------------------ |
| campaignId | **required**. UUID representing the campaign (see campaignId in campaign data model) |

Response:

```javascript
{
  Status: 'OK',
  Response: { patientCampaignId: string }
}
```

#### 

------



## Generic Surveys

#### Generic Survey Data Model 

| Field           | **Value**                       |
| :-------------- | ------------------------------- |
| genericSurveyId | string (UUID of generic survey) |

> Each generic survey (or media item / instrument) created within sympto is associated with a unique id.



#### Start Date Preferences Data Model 

| **Field**         | **Value**                                                    |
| ----------------- | ------------------------------------------------------------ |
| type              | 'adhoc', 'recurring' <br />if type adhoc, then only sent out through GUI. |
| nOccurrences      | (for type recurring) number of times item should be sent out |
| timeOfDay.hours   | (for type recurring), when item should be sent out in patient timezone hours (0-23) |
| timeOfDay.minutes | (for type recurring), when item should be sent out in patient timezone minutes (0-59) |
| surveyStartDate   | (for type recurring), when item should be sent out in patient timezone (date)<br />format `YYYY-MM-DD` |
| frequency         | (for type recurring)<br /><br />`{ type: 'weekly', everyN: number, days: Array<'Sun','Mon','Tue','Wed','Thu','Fri','Sat'>, }`<br />type weekly, send out every n weeks on specified days <br /><br />`{ type: 'daily', everyN: number }`<br />type weekly, send out every n days <br /><br />`{ type: 'monthly', everyN: number, day: number }`<br />type monthly, send out every n months on a specific day (1-31) of the month <br /> |

#### Recurring Survey Data Model 

| Field               | **Value**           | **Notes**                                                    |
| ------------------- | ------------------- | ------------------------------------------------------------ |
| recurringSurveyId   | *string*            | UUID representing the recurring survey                       |
| name                | *string*            | Name of the generic survey                                   |
| type                | *enum*              | Type of generic survey<br />`'instrument', 'attachment', 'message', 'checklist', 'exercise', 'video'` |
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
| survey.messageData.creation            | *JSON*        | ```{ text: null OR <MESSAGE>, email: null | { subject: <MESSAGE>, body: <MESSAGE> } } ```<br /><br />JSON blob specifying the message to send over to the patient over email / text (optionally can leave both values as null) on item creation |
| survey.messageData.reminder            | *JSON*        | ```{ text: null OR <MESSAGE>, email: null | { subject: <MESSAGE>, body: <MESSAGE> } } ```<br /><br />JSON blob specifying the message to send over to the patient over email / text (optionally can leave both values as null) for **reminders** |
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
  Response: Array<Recurring Survey Data Model>
}
```

## 

------



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

------



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
| user.type      | role of the  responder<br />`'patient', 'doctor', 'nurse', 'admin', 'system', 'clinicAdmin', 'audit'` |
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

URL: `/responses/webhook`

Type: `POST`

Body Parameters:

| **Field** | **Value**                                  |
| --------- | ------------------------------------------ |
| url       | URL of webhook (must be a `POST` endpoint) |

Body Response: 

```javascript
{
  Status: 'OK',
  Response: true
}
```

**Webhook Payload**

See Webhook [webhook validation](https://github.com/sympto-health/sympto-api/blob/master/Endpoints.md#Webhook%20Validation) for more information

Request Body Example

```javascript
{
  patientSurveyId: 'd7f92712-f34a-4123-a623-f0fc55544204',
  instrumentType: 'instrument',
  completionMedium: [{
    channel: 'Mobile',
    user: {
      type: 'patient',
      firstName: 'John',
      lastName: 'Doe',
      tvid: 'd62e7336-1288-4efc-8a92-938e225070a1',
    },
  }],
  response: {
    dateCompleted: 1615978718331,
    responseCompletion: 'Partial',
    description: 'Sample description',
    surveyName: 'Sample instrument',
    response: {...},
    questions: {...},
    responseId: '314a18e0-4bc6-4be2-8dda-f21349d33789',
  },
}
```

> Response Data Model sent whenever a user interacts with a questionnaire and updates a response



------

### Providers

#### Data Model

| Field                   | Value                  | Notes                                                        |
| ----------------------- | ---------------------- | :----------------------------------------------------------- |
| firstName               | *string (required)*    |                                                              |
| lastName                | *string (required)*    |                                                              |
| timeZone                | *enum (required)*      | Timezone of the patient (patient will receive automated messages based on their timezone) [https://gist.github.com/prithvin/97266af350cf1becfc1887253a0e5a1d](https://gist.github.com/prithvin/97266af350cf1becfc1887253a0e5a1d)  see this list for a complete list of timezones Ex: Africa/Bangui is a timezone with a UTC offset of GMT+01:00 |
| email                   | *string (optional)*    | Email or phone number are required for patient creation      |
| phoneNumber             | *string (optional)*    | Email or phone number are required for patient creation. We accept the e.164 phone number format ([https://www.twilio.com/docs/glossary/what-e164](https://www.twilio.com/docs/glossary/what-e164)) |
| role                    | *enum*                 | *enum values*: `clinicAdmin`, `provider`                     |
| notificationPreferences | Array<enum> (required) | `email` `text` .<br /><br />Options for how the patient would like to receive notifications: `email` `text`. Patient must have email provided if email notifications set. Patient must have phone provided if text notifications set. |
| notificationType        | Array<enum> (required) | `patient-message`, `provider-message`, `daily-summary-message`, `alert` <br /> Types of notifications that provider would like to be notified for. **We recommend setting alert and patient-message** as defaults |
| providerTvId            | *string (required*)    | UUID for provider                                            |

#### **Provider Creation**  

Creates a provider + creates a group associated with the provider. See [groups](https://github.com/sympto-health/sympto-api/blob/master/Endpoints.md#Groups)

In order to give providers access to a patient, a patient must be added to a group associated with a provider.

##### **Side effects of provider account creation**

> Provider receives introductory password reset / welcome message via notification channels

URL: `/providers`

Type: `POST`

Headers: Use `authCode` from Step 1 as a [bearer token](https://swagger.io/docs/specification/authentication/bearer-authentication/)

Body:

| Field                     | Value (See Data Model)                                       |
| ------------------------- | ------------------------------------------------------------ |
| firstName                 | *string (required)*                                          |
| lastName                  | *string (required)*                                          |
| timeZone                  | *string (required)*                                          |
| email                     | *string (optional)*                                          |
| phoneNumber               | *string (optional)*                                          |
| role                      | *enum (optional)*                                            |
| notificationPreferences   | *Array (required)* - see Provider data model                 |
| notificationType          | *Array (required)* - see Provider data model                 |
| options.disableIntroEmail | *boolean (optional)*<br />if set to true, does not send out introductory password reset / welcome message - this can be later sent out manually through the UI |

Response:

```
{
  Status: 'OK',
  Response: providerTvId (see provider data model)
}
```

#### Provider Management

URL: `/clinicAdmin/careTeam`

Type: `GET`

Headers: Use `authCode` from Step 1 as a [bearer token](https://swagger.io/docs/specification/authentication/bearer-authentication/)

Query: -

> Always returns a list of all providers in the clinic

Response:

```javascript
{
  Status: 'OK',
  Response: Array<Provider Data Model + Group Data Model> (see example response)
}
```

Example Response:

```javascript
{
  Status: 'OK',
  Response: {
    firstName: 'John',
    lastName: 'Doe',
    timeZone: 'America/Los_Angeles',
    email: null,
    phoneNumber: '+16507935243',
    role: 'clinicAdmin',
    notificationPreferences: ['email'],
    groups: Array<{
      groupName: 'Provider Group',
      groupId: '3c0084bc-8b79-410f-b392-853e469b7753'
    }>
    // may include extra fields with patient metadata
  }
}
```

> Note: Providers can only be disabled / deleted via the UI 

#### **Provider U**pdating

Updates provider data fields

##### **Side effects of provider account creation**

> Provider data model is updated for given `providerTvId`

URL: `/clinicAdmin/providers/:providerTvId/update`

Type: `POST`

Headers: Use `authCode` from Step 1 as a [bearer token](https://swagger.io/docs/specification/authentication/bearer-authentication/)

Body:

| Field                   | Value (See Data Model)                                       |
| ----------------------- | ------------------------------------------------------------ |
| firstName               | *string (required)*                                          |
| lastName                | *string (required)*                                          |
| timeZone                | *string (required)*                                          |
| email                   | *string (optional)*                                          |
| phoneNumber             | *string (optional)* - either email or phone number is required |
| role                    | *enum (optional)*                                            |
| notificationPreferences | *Array (required)* - see Provider data model                 |
| notificationType        | *Array (required)* - see Provider data model                 |

Response:

```javascript
{
  Status: 'OK',
  Response: true
}
```

#### 



------

### Groups

#### Data Model

| Field     | Value                                                        | Notes          |
| --------- | ------------------------------------------------------------ | :------------- |
| groupName | *string (required)*                                          |                |
| groupId   | *string (required)*                                          | UUID for group |
| users     | Array<{ tvid: Provider or Patient UUID, role: 'provider' \| 'clinicAdmin' \| 'patient" }> |                |


#### **Group Creation**

> Note that whenever a provider is created (see Provider Management APIs), a group is automatically created too, named "<First Name> <Last Name>'s Group'". The provider is automatically assigned to the group


URL: `/providers/groups` 

Type: `POST`

Headers: Use `authCode` from Step 1 as a [bearer token](https://swagger.io/docs/specification/authentication/bearer-authentication/)

Body:

| Field     | Value (See Data Model) |
| --------- | ---------------------- |
| groupName | *string (required)*    |

Response:

```javascript
{
  Status: 'OK',
  Response: groupId (see group data model)
}
```



#### **Editing Group**

URL: `/groups/:groupId` 

> URL Parameters :groupId -> (see group data model)

Type: `POST`

Headers: Use `authCode` from Step 1 as a [bearer token](https://swagger.io/docs/specification/authentication/bearer-authentication/)

Body:

| Field     | Value (See Data Model) |
| --------- | ---------------------- |
| groupName | *string (required)*    |

##### **Side effects of e**diting group

> Group name is updated

Response:

```javascript
{
  Status: 'OK',
  Response: true
}
```



#### **Deleting Group**

URL: `/groups/:groupId` 

> URL Parameters :groupId -> (see group data model)

Type: `DELETE`

Headers: Use `authCode` from Step 1 as a [bearer token](https://swagger.io/docs/specification/authentication/bearer-authentication/)

Body: -

##### **Side effects of deleting group

> Group is deleted

Response:

```javascript
{
  Status: 'OK',
  Response: true
}
```



### Managing Group Memberships

The `/clinicAdmin/groups/manage` endpoint provides three operations for managing group memberships: adding users to groups, removing users from groups, and setting a user's complete group membership list.

#### Add User to Group

URL: `/clinicAdmin/groups/manage` 

Type: `PUT`

Headers: Use `authCode` from Step 1 as a [bearer token](https://swagger.io/docs/specification/authentication/bearer-authentication/)

Body:

| Field   | Value (See Data Model)                                       |
| ------- | ------------------------------------------------------------ |
| userId  | *string (required)*<br />UUID representing either patient (see patientTvId in Patient Data Model) or provider (see providerTvId in Provider Data Model) |
| groupId | *string (required)*<br />UUID representing group (see groupId in Group Data Model) |

##### Side effects of adding user to group

> User is added to the specified group. If the user is already in the group, no changes are made.

Example Request:
```javascript
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "groupId": "7b44b47d-af99-4891-b631-918528940123"
}
```

Response:
```javascript
{
  Status: 'OK',
  Response: true
}
```

#### Remove User from Group

URL: `/clinicAdmin/groups/manage` 

Type: `DELETE`

Headers: Use `authCode` from Step 1 as a [bearer token](https://swagger.io/docs/specification/authentication/bearer-authentication/)

Body:

| Field   | Value (See Data Model)                                       |
| ------- | ------------------------------------------------------------ |
| userId  | *string (required)*<br />UUID representing either patient (see patientTvId in Patient Data Model) or provider (see providerTvId in Provider Data Model) |
| groupId | *string (required)*<br />UUID representing group (see groupId in Group Data Model) |

##### Side effects of removing user from group

> User is removed from the specified group. If the user is not in the group, no changes are made.

Example Request:
```javascript
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "groupId": "7b44b47d-af99-4891-b631-918528940123"
}
```

Response:
```javascript
{
  Status: 'OK',
  Response: 'User removed from group!'
}
```

#### Set All Groups for User

URL: `/clinicAdmin/groups/manage` 

Type: `POST`

Headers: Use `authCode` from Step 1 as a [bearer token](https://swagger.io/docs/specification/authentication/bearer-authentication/)

Body:

| Field    | Value (See Data Model)                                       |
| -------- | ------------------------------------------------------------ |
| userId   | *string (required)*<br />UUID representing either patient (see patientTvId in Patient Data Model) or provider (see providerTvId in Provider Data Model) |
| groupIds | *Array<string> (required)*<br />Array of UUIDs representing groups (see groupId in Group Data Model) |

##### Side effects of setting user groups

> This endpoint replaces all of the user's group memberships with the provided list. The user will be:
> - Added to any groups in the groupIds array that they weren't already in
> - Removed from any current groups that aren't in the groupIds array
> - After execution, the user will only be a member of the groups specified in groupIds

Example Request:
```javascript
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "groupIds": [
    "7b44b47d-af99-4891-b631-918528940123",
    "9c55c58e-ba00-5902-c742-029639051234"
  ]
}
```

Response:
```javascript
{
  Status: 'OK',
  Response: true
}
```


------



### **Webhook Validation**

Webhooks are sent whenever a new response is created or updated within Sympto. Webhooks for responses are guaranteed to be sent **at least once**. On webhook endpoint failure (non-`200` status code), the webhook will automatically retry with exponential backoff over the next 3 days

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


#### Email [prithvi@relyhealth.care](prithvi@relyhealth.care)  with any further questions.
