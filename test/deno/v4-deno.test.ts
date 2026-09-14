import { v4DefaultGateway } from 'jsr:@lucafornerone/network-default-gateway@2.0.2';
import { assert, assertEquals } from 'jsr:@std/assert';
import { isIPv4 } from 'node:net';
import { NetworkElement, v4IpList } from '../../index.ts';
import { mockState } from './mock.ts';

const mocksDefaultGateway = {
  '24bit': {
    gateway: '192.168.1.1',
    ip: '192.168.1.11',
    interface: 'en0',
    prefixLength: 24,
  },
  '23bit': {
    gateway: '192.168.2.1',
    ip: '192.168.3.220',
    interface: 'eth1',
    prefixLength: 23,
  },
};

async function getJsonByFilePath(path: string): Promise<string[]> {
  const fileUrl = new URL(`../${path}`, import.meta.url).href;
  const file = await import(fileUrl, { with: { type: 'json' } });
  return file.default;
}

Deno.test('_v4GetIpList: v4 address validations', async (t: Deno.TestContext) => {
  mockState.currentResponse = await v4DefaultGateway();
  const result = await v4IpList();

  await t.step('should return only valid IPv4 addresses', () => {
    assert(result.every((ip) => isIPv4(ip)));
  });

  await t.step('should return a populated list', () => {
    assert(result && result.length > 0);
  });

  await t.step('should not contain duplicate elements', () => {
    const uniqueIpList = [...new Set(result)];
    assertEquals(result.length, uniqueIpList.length);
  });
});

Deno.test('_v4GetIpList: v4 with 24 bit network', async (t: Deno.TestContext) => {
  // mock v4: wifi interface with 192.168.1.1 gateway
  mockState.currentResponse = mocksDefaultGateway['24bit'];

  await t.step('should return all network ip list', async () => {
    const json = await getJsonByFilePath('v4-192.168.1.11-24/all.json');
    const result = await v4IpList();
    assertEquals(result, json);
  });

  await t.step('should return network ip list without gateway', async () => {
    const json = await getJsonByFilePath('v4-192.168.1.11-24/omit-gateway.json');
    const result = await v4IpList({ omit: [NetworkElement.Gateway] });
    assertEquals(result, json);
  });

  await t.step('should return network ip list without current device', async () => {
    const json = await getJsonByFilePath('v4-192.168.1.11-24/omit-current-device.json');
    const result = await v4IpList({ omit: [NetworkElement.CurrentDevice] });
    assertEquals(result, json);
  });

  await t.step('should return network ip list without broadcast', async () => {
    const json = await getJsonByFilePath('v4-192.168.1.11-24/omit-broadcast.json');
    const result = await v4IpList({ omit: [NetworkElement.Broadcast] });
    assertEquals(result, json);
  });

  await t.step(
    'should not include the gateway if it is specified in the omit parameter',
    async () => {
      const result = await v4IpList({ omit: [NetworkElement.Gateway] });
      assert(!result.includes(mocksDefaultGateway['24bit'].gateway));
    }
  );

  await t.step(
    'should not include the current device ip if it is specified in the omit parameter',
    async () => {
      const result = await v4IpList({ omit: [NetworkElement.CurrentDevice] });
      assert(!result.includes(mocksDefaultGateway['24bit'].ip));
    }
  );

  await t.step(
    '24 bit network: should not include the broadcast if it is specified in the omit parameter',
    async () => {
      const result = await v4IpList({ omit: [NetworkElement.Broadcast] });
      assert(!result.includes('192.168.1.255'));
    }
  );

  await t.step(
    '24 bit network: should not include the gateway, current device ip, or broadcast if they are specified in the omit parameter',
    async () => {
      const result = await v4IpList({
        omit: [NetworkElement.Gateway, NetworkElement.CurrentDevice, NetworkElement.Broadcast],
      });
      assert(
        [
          mocksDefaultGateway['24bit'].gateway,
          mocksDefaultGateway['24bit'].ip,
          '192.168.1.255',
        ].every((ip) => !result.includes(ip))
      );
    }
  );
});

Deno.test('_v4GetIpList: v4 with 23 bit network', async (t: Deno.TestContext) => {
  // mock v4: ethernet interface with 192.168.2.1 gateway
  mockState.currentResponse = mocksDefaultGateway['23bit'];

  await t.step('should return all network ip list', async () => {
    const json = await getJsonByFilePath('v4-192.168.3.220-23/all.json');
    const result = await v4IpList();
    assertEquals(result, json);
  });

  await t.step('should return network ip list without gateway', async () => {
    const json = await getJsonByFilePath('v4-192.168.3.220-23/omit-gateway.json');
    const result = await v4IpList({ omit: [NetworkElement.Gateway] });
    assertEquals(result, json);
  });

  await t.step('should return network ip list without current device', async () => {
    const json = await getJsonByFilePath('v4-192.168.3.220-23/omit-current-device.json');
    const result = await v4IpList({ omit: [NetworkElement.CurrentDevice] });
    assertEquals(result, json);
  });

  await t.step('should return network ip list without broadcast', async () => {
    const json = await getJsonByFilePath('v4-192.168.3.220-23/omit-broadcast.json');
    const result = await v4IpList({ omit: [NetworkElement.Broadcast] });
    assertEquals(result, json);
  });
});
