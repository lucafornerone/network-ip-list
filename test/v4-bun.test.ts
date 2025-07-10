import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { NetworkElement, v4IpList } from '../index.ts';
import { IPv4_REGEX } from './v4-regex.mjs';

async function getJsonByFilePath(path: string): Promise<string[]> {
  const file = Bun.file(`${import.meta.dir}/${path}`);
  return await file.json();
}

describe('_v4GetIpList: v4 address validation', () => {
  it('should return only valid IPv4 addresses', async () => {
    const result = await v4IpList();
    expect(result.every((ip) => IPv4_REGEX.test(ip))).toBe(true);
  });
});

describe('_v4GetIpList: v4 with 24 bit network', () => {
  beforeEach(() => {
    mock.module('network-default-gateway', () => ({
      v4DefaultGateway: () => ({
        gateway: '192.168.1.1',
        ip: '192.168.1.11',
        interface: 'en0',
        prefixLength: 24,
      }),
    }));
  });

  describe('wifi interface with 192.168.1.1 gateway', () => {
    it('should return all network ip list', async () => {
      const json = await getJsonByFilePath('v4-192.168.1.11-24/all.json');
      const result = await v4IpList();
      expect(result).toEqual(json);
    });

    it('should return network ip list without gateway', async () => {
      const json = await getJsonByFilePath('v4-192.168.1.11-24/omit-gateway.json');
      const result = await v4IpList({ omit: [NetworkElement.GATEWAY] });
      expect(result).toEqual(json);
    });

    it('should return network ip list without current device', async () => {
      const json = await getJsonByFilePath('v4-192.168.1.11-24/omit-current-device.json');
      const result = await v4IpList({ omit: [NetworkElement.CURRENT_DEVICE] });
      expect(result).toEqual(json);
    });

    it('should return network ip list without broadcast', async () => {
      const json = await getJsonByFilePath('v4-192.168.1.11-24/omit-broadcast.json');
      const result = await v4IpList({ omit: [NetworkElement.BROADCAST] });
      expect(result).toEqual(json);
    });

    it('should not include the gateway if it is specified in the omit parameter', async () => {
      const result = await v4IpList({ omit: [NetworkElement.GATEWAY] });
      expect(result).not.toContain('192.168.1.1');
    });

    it('should not include the current device ip if it is specified in the omit parameter', async () => {
      const result = await v4IpList({ omit: [NetworkElement.CURRENT_DEVICE] });
      expect(result).not.toContain('192.168.1.11');
    });

    it('should not include the broadcast if it is specified in the omit parameter', async () => {
      const result = await v4IpList({ omit: [NetworkElement.BROADCAST] });
      expect(result).not.toContain('192.168.1.255');
    });

    it('should not include the gateway, current device ip, or broadcast if they are specified in the omit parameter', async () => {
      const result = await v4IpList({
        omit: [NetworkElement.GATEWAY, NetworkElement.CURRENT_DEVICE, NetworkElement.BROADCAST],
      });
      expect(
        ['192.168.1.1', '192.168.1.11', '192.168.1.255'].every((ip) => !result.includes(ip))
      ).toBe(true);
    });
  });
});

describe('_v4GetIpList: v4 with 23 bit network', () => {
  beforeEach(() => {
    mock.module('network-default-gateway', () => ({
      v4DefaultGateway: () => ({
        gateway: '192.168.2.1',
        ip: '192.168.3.220',
        interface: 'eth1',
        prefixLength: 23,
      }),
    }));
  });

  describe('ethernet interface with 192.168.2.1 gateway', () => {
    it('should return all network ip list', async () => {
      const json = await getJsonByFilePath('v4-192.168.3.220-23/all.json');
      const result = await v4IpList();
      expect(result).toEqual(json);
    });

    it('should return network ip list without gateway', async () => {
      const json = await getJsonByFilePath('v4-192.168.3.220-23/omit-gateway.json');
      const result = await v4IpList({ omit: [NetworkElement.GATEWAY] });
      expect(result).toEqual(json);
    });

    it('should return network ip list without current device', async () => {
      const json = await getJsonByFilePath('v4-192.168.3.220-23/omit-current-device.json');
      const result = await v4IpList({ omit: [NetworkElement.CURRENT_DEVICE] });
      expect(result).toEqual(json);
    });

    it('should return network ip list without broadcast', async () => {
      const json = await getJsonByFilePath('v4-192.168.3.220-23/omit-broadcast.json');
      const result = await v4IpList({ omit: [NetworkElement.BROADCAST] });
      expect(result).toEqual(json);
    });
  });
});
