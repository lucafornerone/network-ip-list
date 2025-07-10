import { deepStrictEqual } from 'node:assert';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect } from 'chai';
import esmock from 'esmock';
import { NetworkElement, v4IpList } from '../dist/index.js';
import { IPv4_REGEX } from './v4-regex.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
async function getJsonByFilePath(path) {
  const json = readFileSync(join(__dirname, path), 'utf8');
  return JSON.parse(json);
}

describe('_v4GetIpList: v4 address validation', () => {
  it('should return only valid IPv4 addresses', async () => {
    const result = await v4IpList();
    expect(result.every((ip) => IPv4_REGEX.test(ip))).to.be.true;
  });
});

describe('_v4GetIpList: v4 with 24 bit network', async () => {
  let networkIpList;

  beforeEach(async () => {
    networkIpList = await esmock('../dist/index.js', {
      'network-default-gateway': {
        v4DefaultGateway: () => ({
          gateway: '192.168.1.1',
          ip: '192.168.1.11',
          interface: 'en0',
          prefixLength: 24,
        }),
      },
    });
  });

  describe('wifi interface with 192.168.1.1 gateway', () => {
    it('should return all network ip list', async () => {
      const json = await getJsonByFilePath('./v4-192.168.1.11-24/all.json');
      const result = await networkIpList.v4IpList();
      deepStrictEqual(result, json);
    });

    it('should return network ip list without gateway', async () => {
      const json = await getJsonByFilePath('./v4-192.168.1.11-24/omit-gateway.json');
      const result = await networkIpList.v4IpList({ omit: [NetworkElement.GATEWAY] });
      deepStrictEqual(result, json);
    });

    it('should return network ip list without current device', async () => {
      const json = await getJsonByFilePath('./v4-192.168.1.11-24/omit-current-device.json');
      const result = await networkIpList.v4IpList({ omit: [NetworkElement.CURRENT_DEVICE] });
      deepStrictEqual(result, json);
    });

    it('should return network ip list without broadcast', async () => {
      const json = await getJsonByFilePath('./v4-192.168.1.11-24/omit-broadcast.json');
      const result = await networkIpList.v4IpList({ omit: [NetworkElement.BROADCAST] });
      deepStrictEqual(result, json);
    });

    it('should not include the gateway if it is specified in the omit parameter', async () => {
      const result = await networkIpList.v4IpList({ omit: [NetworkElement.GATEWAY] });
      expect(result).to.not.include('192.168.1.1');
    });

    it('should not include the current device ip if it is specified in the omit parameter', async () => {
      const result = await networkIpList.v4IpList({ omit: [NetworkElement.CURRENT_DEVICE] });
      expect(result).to.not.include('192.168.1.11');
    });

    it('should not include the broadcast if it is specified in the omit parameter', async () => {
      const result = await networkIpList.v4IpList({ omit: [NetworkElement.BROADCAST] });
      expect(result).to.not.include('192.168.1.255');
    });

    it('should not include the gateway, current device ip, or broadcast if they are specified in the omit parameter', async () => {
      const result = await networkIpList.v4IpList({
        omit: [NetworkElement.GATEWAY, NetworkElement.CURRENT_DEVICE, NetworkElement.BROADCAST],
      });
      expect(
        ['192.168.1.1', '192.168.1.11', '192.168.1.255'].every((item) => !result.includes(item))
      ).to.be.true;
    });
  });
});

describe('_v4GetIpList: v4 with 23 bit network', async () => {
  let networkIpList;

  beforeEach(async () => {
    networkIpList = await esmock('../dist/index.js', {
      'network-default-gateway': {
        v4DefaultGateway: () => ({
          gateway: '192.168.2.1',
          ip: '192.168.3.220',
          interface: 'eth1',
          prefixLength: 23,
        }),
      },
    });
  });

  describe('ethernet interface with 192.168.2.1 gateway', () => {
    it('should return all network ip list', async () => {
      const json = await getJsonByFilePath('./v4-192.168.3.220-23/all.json');
      const result = await networkIpList.v4IpList();
      deepStrictEqual(result, json);
    });

    it('should return network ip list without gateway', async () => {
      const json = await getJsonByFilePath('./v4-192.168.3.220-23/omit-gateway.json');
      const result = await networkIpList.v4IpList({ omit: [NetworkElement.GATEWAY] });
      deepStrictEqual(result, json);
    });

    it('should return network ip list without current device', async () => {
      const json = await getJsonByFilePath('./v4-192.168.3.220-23/omit-current-device.json');
      const result = await networkIpList.v4IpList({ omit: [NetworkElement.CURRENT_DEVICE] });
      deepStrictEqual(result, json);
    });

    it('should return network ip list without broadcast', async () => {
      const json = await getJsonByFilePath('./v4-192.168.3.220-23/omit-broadcast.json');
      const result = await networkIpList.v4IpList({ omit: [NetworkElement.BROADCAST] });
      deepStrictEqual(result, json);
    });
  });
});
