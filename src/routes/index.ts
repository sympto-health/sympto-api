import { Request, Response, Router } from 'express';
import { BAD_REQUEST, OK } from 'http-status-codes';
import axios from 'axios';
import faker from 'faker';
import base64 from 'base-64';
import { clientId, clientSecret, clientURL, clientFrontendURL } from '../config';
import { fetchApiUrl } from '../ngrok';
import logger from '../logger';

// Init router and path
const router = Router();

logger.info({ clientId, clientSecret, clientURL, clientFrontendURL } );

// Generates auth code using API
const generateAuthCode = async (clientId: string, clientSecret: string) => {
  try {
    const { data: { Response: authCode } } = await axios.post(`${clientURL}/authorization`, {
      clientId,
      clientSecret,
    });
    logger.info(`Auth code is ${authCode}`);
    return authCode;
  } catch (e) { 
    logger.error('Errored on generating bearer token', e.response.data);
    throw new Error(JSON.stringify(e.response.data));
  }
}

/**
 * Patient Webhook used as clinic endpoint
 */
router.post('/patient/webhook', async (req: Request, res: Response) => {
  logger.info('Request from Sympto Health for new patient');
  logger.info(req.body);
  res.send(true);
});

/**
 * Generate auth code and create a set of users and groups
 */
router.get('/setup', async (req: Request, res: Response) => {
  logger.info('Fetching auth code');

  const authCode = await generateAuthCode(clientId, clientSecret);

  // Set patient webhook endpoint
  const { data: patientWebhook } = await axios.post(`${clientURL}/clinicAdmin/webhook`, {
    webhookData: {
      url: `${fetchApiUrl()}/patient/webhook`,
      secret: 'TEST',
    },
  }, { headers: {'Authorization': 'Bearer '+authCode} });
  logger.info(`Received response ${JSON.stringify(patientWebhook)} from setting clinic patient set webhook endpoint`);


  res.send({
    response: `success. endpoint set to ${fetchApiUrl()}`,
  });
});


/***
 * Create a set of users and groups
 */
router.get('/create', async (req: Request, res: Response) => {
  const authCode = await generateAuthCode(clientId, clientSecret);

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
          phoneNumber: null, // Phone numbers are optional
          timeZone: 'America/Los_Angeles',
          notificationType: ['email'],
          options: {
            disableIntroEmail: true,
            forceResetPassword: false,
          },
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
      options: {
        disableIntroEmail: false,
        forceResetPassword: false,
      },
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
      options: {
        disableIntroEmail: false,
        forceResetPassword: false,
      },
      notificationPreferences: ['email'],
      role: 'doctor',
      timeZone: 'America/Los_Angeles'
    },
    { headers: {'Authorization': 'Bearer '+authCode} },
  );
  const providerIds = [provider1Id, provider2Id];
  logger.info(`Received provider ids ${JSON.stringify(providerIds)}`)

  logger.info('Group management');

  logger.info('Adding patients three and four into group 2');
  await axios.post(
    `${clientURL}/clinicAdmin/groups/manage`,
    {
      groupIds: [groupId2],
      userId: patientIds[2],
    },
    { headers: {'Authorization': 'Bearer '+authCode} },
  );
  await axios.post(
    `${clientURL}/clinicAdmin/groups/manage`,
    {
      groupIds: [groupId2],
      userId: patientIds[3],
    },
    { headers: {'Authorization': 'Bearer '+authCode} },
  );


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


/**
 * Lists users and endpoint information
 */
router.get('/info', async (req: Request, res: Response) => {
  logger.info('Fetching auth code');

  // Generates auth code
  const authCode = await generateAuthCode(clientId, clientSecret);

  logger.info('Fetching provider info');
  const { data: { Response } } = await axios({
    url: `${clientURL}/clinicAdmin/users`,
    method: 'get',
    headers: {'Authorization': 'Bearer '+authCode},
  });


  res.send({
    response: Response,
  });
});

router.get('/url', async (req: Request, res: Response) => {
  const { email } = req.query;
  if (email == null) {
    throw new Error('Email required to generate auth key');
  }

  const authCode = await generateAuthCode(clientId, clientSecret);
  const { data: { Response: { userAuthToken } } } = await axios.post(
    `${clientURL}/authorization/login/token`,
    {
      email,
    },
    { headers: {'Authorization': 'Bearer '+authCode} },
  );

  logger.info('Creating auth key');
 
  res.send({
    url: `${clientFrontendURL}?userAuthToken=${userAuthToken}`,
  });
});

router.get('/', async (req: Request, res: Response) => {
  res.send('Server started. Continue to next steps in documentation');
});

// Export the base-router
export default router;
