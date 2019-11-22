import { Request, Response, Router } from 'express';
import { BAD_REQUEST, OK } from 'http-status-codes';
import axios from 'axios';
import faker from 'faker';
import { clientId, clientSecret, clientURL } from '../config';
import { apiUrl } from '../ngrok';
import logger from '../logger';
import phoneNumbers from '../phoneNumbers';

// Init router and path
const router = Router();

console.log({ clientId, clientSecret, clientURL } );

/**
 * Webhook used as clinic endpoint
 */
router.post('/webhook', async (req: Request, res: Response) => {
  logger.info('Request from Sympto Health');
});

/**
 * Generate auth code and create a set of users and groups
 */
router.get('/setup', async (req: Request, res: Response) => {
  logger.info('Fetching auth code');

  // Generates auth code
  const { data: { Response: authCode } } = await axios.post(`${clientURL}/authorization`, {
    clientId,
    clientSecret,
  });
  logger.info(`Auth code is ${authCode}`);
  console.log('Bearer '+authCode);
  // Set clinic admin endpoint
  const { data } = await axios.post(`${clientURL}/clinicAdmin/clinics/endpoint`, {
    endpointURL: `${apiUrl}/api/webhook`,
    clientSecret: 'SampleAppClientSecret',
    clientId: 'SampleAppClientId',
    endpointQueryParam: 'SampleApp',
  }, { headers: {'Authorization': 'Bearer '+authCode} });
  logger.info(`Received response ${JSON.stringify(data)} from setting clinic endpoint`);

  res.send({
    response: 'success',
  });
});


/***
 * Create a set of users and groups
 */
router.get('/create', async (req: Request, res: Response) => {
  logger.info('Fetching auth code');

  // Generates auth code
  const { data: { Response: authCode } } = await axios.post(`${clientURL}/authorization`, {
    clientId,
    clientSecret,
  });
  logger.info(`Auth code is ${authCode}`);

  // Create 2 groups
  const { data: { Response: { groupId } } } = await axios.post(
    `${clientURL}/clinicAdmin/groups`,
    {
      groupName: 'Group 1',
    },
    { headers: {'Authorization': 'Bearer '+authCode} },
  );
  logger.info(`Group 1 created with group id: ${groupId}`);

  const { data: { Response: { groupId: groupId2 } } } = await axios.post(
    `${clientURL}/clinicAdmin/groups`,
    {
      groupName: 'Group 2',
    },
    { headers: {'Authorization': 'Bearer '+authCode} },
  );
  logger.info(`Group 2 created with group id: ${groupId2}`);


  // Create 4 patients
  const patientIds = await Promise.all([...Array(4).keys()]
    .map(async (i) => {
      logger.info(`Creating patient ${i}`);
      const firstName = faker.name.firstName();
      const lastName = faker.name.lastName();
      const { data: { Response: patientId } } = await axios.post(
        `${clientURL}/providers/patient/create`,
        {
          firstName: firstName,
          lastName: lastName,
          email: `${firstName}.${lastName}@mailinator.com`,
          phoneNumber: phoneNumbers[i],
          timeZone: 'America/Los_Angeles'
        },
        { headers: {'Authorization': 'Bearer '+authCode} },
      );
     return patientId;
    }));
  logger.info(`Received patient ids ${JSON.stringify(patientIds)}`)

  // Create 2 providers
  logger.info('Creating first provider');
  const { data: { Response: provider1Id }} = await axios.post(
    `${clientURL}/clinicAdmin/providers`,
    {
      firstName: 'Doctor',
      lastName: 'One',
      email: 'doc1@mailinator.com',
      notificationPreferences: ['email'],
      role: 'doctor',
      timeZone: 'America/Los_Angeles'
    },
    { headers: {'Authorization': 'Bearer '+authCode} },
  );

  logger.info('Creating second provider');
  const { data: { Response: provider2Id }} = await axios.post(
    `${clientURL}/clinicAdmin/providers`,
    {
      firstName: 'Doctor',
      lastName: 'Two',
      email: 'doc2@mailinator.com',
      notificationPreferences: ['email'],
      role: 'doctor',
      timeZone: 'America/Los_Angeles'
    },
    { headers: {'Authorization': 'Bearer '+authCode} },
  );
  const providerIds = [provider1Id, provider2Id];
  logger.info(`Received provider ids ${JSON.stringify(providerIds)}`)

  logger.info('Group management');
  logger.info('Adding patients one and two into group 1');
  await axios.post(
    `${clientURL}/clinicAdmin/groups/manage`,
    {
      groupIds: [groupId],
      userId: patientIds[0],
    },
    { headers: {'Authorization': 'Bearer '+authCode} },
  );

  await axios.post(
    `${clientURL}/clinicAdmin/groups/manage`,
    {
      groupIds: [groupId],
      userId: patientIds[1],
    },
    { headers: {'Authorization': 'Bearer '+authCode} },
  );

  logger.info('Adding patients three and four into group 2');
  await axios.post(
    `${clientURL}/clinicAdmin/groups/manage`,
    {
      groupIds: [groupId2],
      userId: patientIds[0],
    },
    { headers: {'Authorization': 'Bearer '+authCode} },
  );

  await axios.post(
    `${clientURL}/clinicAdmin/groups/manage`,
    {
      groupIds: [groupId2],
      userId: patientIds[1],
    },
    { headers: {'Authorization': 'Bearer '+authCode} },
  );

  logger.info('Adding provider one into group one');
  await axios.post(
    `${clientURL}/clinicAdmin/groups/manage`,
    {
      groupIds: [groupId],
      userId: providerIds[0],
    },
    { headers: {'Authorization': 'Bearer '+authCode} },
  );

  logger.info('Adding provider two into group two');
  await axios.post(
    `${clientURL}/clinicAdmin/groups/manage`,
    {
      groupIds: [groupId2],
      userId: providerIds[1],
    },
    { headers: {'Authorization': 'Bearer '+authCode} },
  );

  res.send({
    response: 'success',
  });
});


// Export the base-router
export default router;
