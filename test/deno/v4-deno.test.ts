import { v4DefaultGateway } from 'jsr:@lucafornerone/network-default-gateway@1.2.4';
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
  const file = await import(`${import.meta.dirname}/../${path}`, { with: { type: 'json' } });
  return file.default;
}

// v4: address validation with actual default gateway
Deno.test('should return only valid IPv4 addresses', async () => {
  mockState.currentResponse = await v4DefaultGateway();
  const result = await v4IpList();
  assert(result.every((ip) => isIPv4(ip)));
});

Deno.test('should return a populated list', async () => {
  mockState.currentResponse = await v4DefaultGateway();
  const result = await v4IpList();
  assert(result && result.length > 0);
});

Deno.test('should not contain duplicate elements', async () => {
  mockState.currentResponse = await v4DefaultGateway();
  const result = await v4IpList();
  const uniqueIpList = [...new Set(result)];
  assertEquals(result.length, uniqueIpList.length);
});

// v4: wifi interface with 192.168.1.1 gateway
Deno.test('24 bit network: should return all network ip list', async () => {
  mockState.currentResponse = mocksDefaultGateway['24bit'];
  const json = await getJsonByFilePath('v4-192.168.1.11-24/all.json');
  const result = await v4IpList();
  assertEquals(result, json);
});

Deno.test('24 bit network: should return network ip list without gateway', async () => {
  mockState.currentResponse = mocksDefaultGateway['24bit'];
  const json = await getJsonByFilePath('v4-192.168.1.11-24/omit-gateway.json');
  const result = await v4IpList({ omit: [NetworkElement.Gateway] });
  assertEquals(result, json);
});

Deno.test('24 bit network: should return network ip list without current device', async () => {
  mockState.currentResponse = mocksDefaultGateway['24bit'];
  const json = await getJsonByFilePath('v4-192.168.1.11-24/omit-current-device.json');
  const result = await v4IpList({ omit: [NetworkElement.CurrentDevice] });
  assertEquals(result, json);
});

Deno.test('24 bit network: should return network ip list without broadcast', async () => {
  mockState.currentResponse = mocksDefaultGateway['24bit'];
  const json = await getJsonByFilePath('v4-192.168.1.11-24/omit-broadcast.json');
  const result = await v4IpList({ omit: [NetworkElement.Broadcast] });
  assertEquals(result, json);
});

Deno.test('24 bit network: should not include the gateway if it is specified in the omit parameter', async () => {
  mockState.currentResponse = mocksDefaultGateway['24bit'];
  const result = await v4IpList({ omit: [NetworkElement.Gateway] });
  assert(!result.includes(mocksDefaultGateway['24bit'].gateway));
});

Deno.test('24 bit network: should not include the current device ip if it is specified in the omit parameter', async () => {
  mockState.currentResponse = mocksDefaultGateway['24bit'];
  const result = await v4IpList({ omit: [NetworkElement.CurrentDevice] });
  assert(!result.includes(mocksDefaultGateway['24bit'].ip));
});

Deno.test('24 bit network: should not include the broadcast if it is specified in the omit parameter', async () => {
  mockState.currentResponse = mocksDefaultGateway['24bit'];
  const result = await v4IpList({ omit: [NetworkElement.Broadcast] });
  assert(!result.includes('192.168.1.255'));
});

Deno.test('24 bit network: should not include the gateway, current device ip, or broadcast if they are specified in the omit parameter', async () => {
  mockState.currentResponse = mocksDefaultGateway['24bit'];
  const result = await v4IpList({
    omit: [NetworkElement.Gateway, NetworkElement.CurrentDevice, NetworkElement.Broadcast],
  });
  assert(
    [mocksDefaultGateway['24bit'].gateway, mocksDefaultGateway['24bit'].ip, '192.168.1.255'].every(
      (ip) => !result.includes(ip)
    )
  );
});

// v4: ethernet interface with 192.168.2.1 gateway
Deno.test('23 bit network: should return all network ip list', async () => {
  mockState.currentResponse = mocksDefaultGateway['23bit'];
  const json = await getJsonByFilePath('v4-192.168.3.220-23/all.json');
  const result = await v4IpList();
  assertEquals(result, json);
});

Deno.test('23 bit network: should return network ip list without gateway', async () => {
  mockState.currentResponse = mocksDefaultGateway['23bit'];
  const json = await getJsonByFilePath('v4-192.168.3.220-23/omit-gateway.json');
  const result = await v4IpList({ omit: [NetworkElement.Gateway] });
  assertEquals(result, json);
});

Deno.test('23 bit network: should return network ip list without current device', async () => {
  mockState.currentResponse = mocksDefaultGateway['23bit'];
  const json = await getJsonByFilePath('v4-192.168.3.220-23/omit-current-device.json');
  const result = await v4IpList({ omit: [NetworkElement.CurrentDevice] });
  assertEquals(result, json);
});

Deno.test('23 bit network: should return network ip list without broadcast', async () => {
  mockState.currentResponse = mocksDefaultGateway['23bit'];
  const json = await getJsonByFilePath('v4-192.168.3.220-23/omit-broadcast.json');
  const result = await v4IpList({ omit: [NetworkElement.Broadcast] });
  assertEquals(result, json);
});
