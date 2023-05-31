import AuthClient, {AuthClientTypes} from '@walletconnect/auth-client';
import {Core as WalletConnectCore} from '@walletconnect/core';

const config = {
  walletConnectV2: {
    relayUrl: 'wss://relay.walletconnect.com',
    projectId: '10a5257c04d1d3097ff768a139c95f50',
  },
} as const;

const metadata = {
  name: 'Omni',
  description: 'Multi chain, self custodial cryptocurrency wallet',
  url: 'https://omni.app',
  icons: [
    'https://pbs.twimg.com/profile_images/1567522404070555653/vd4l61G3_400x400.jpg',
  ],
};

const core = new WalletConnectCore({
  projectId: config.walletConnectV2.projectId,
  relayUrl: config.walletConnectV2.relayUrl,
  logger: 'error',
});

const getAuthClient = (() => {
  let client: Promise<AuthClient> | null = null;

  const generateClient = () => {
    return AuthClient.init({
      core,
      projectId: config.walletConnectV2.projectId,
      metadata,
      relayUrl: config.walletConnectV2.relayUrl,
      logger: 'error',
    });
  };

  return async () => {
    if (client) {
      return client;
    }

    client = generateClient();

    return client;
  };
})();

const authReject = async (
  request: AuthClientTypes.EventArguments['auth_request'],
) => {
  const authClient = await getAuthClient();

  authClient.respond(
    {
      id: request.id,
      error: {
        message: 'User rejected.',
        code: 5000,
      },
    },
    '',
  );
};

export const handleAuthResponse = async ({
  request,
}: {
  request: AuthClientTypes.EventArguments['auth_request'];
}) => {
  await new Promise(res => setTimeout(res, 3000));

  return authReject(request);
};

const getTopicFromUri = (uri: string): string | null => {
  return uri.split(/[:@?]/)[1] ?? null;
};

export const handleUri = async (uri: string) => {
  const topic = getTopicFromUri(uri);

  if (!topic) {
    console.log('__INVALID_URI__');
    return;
  }

  console.log('__PAIRING__: ', uri);

  if (core.pairing.pairings.map.has(topic)) {
    console.log('__ALREADY_PAIRED__');
    return;
  }

  const pairResult = await core.pairing.pair({uri});

  console.log('__PAIR_RESULT__:  ', pairResult);
};

export const initialize = ({
  onAuthRequest,
  onReady,
}: {
  onAuthRequest: (
    event: AuthClientTypes.EventArguments['auth_request'],
  ) => void;
  onReady: () => void;
}) => {
  async function addListeners() {
    const authClient = await getAuthClient();
    authClient.on('auth_request', onAuthRequest);
  }

  async function removeListeners() {
    const authClient = await getAuthClient();
    authClient.removeListener('auth_request', onAuthRequest);
  }

  addListeners().then(onReady);

  return () => {
    removeListeners();
  };
};
