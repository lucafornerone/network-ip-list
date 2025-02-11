const { v4IpList, NetworkElement } = require('../dist/index');
const fs = require('node:fs');
const os = require('node:os');
const defaultGateway = require('default-gateway');
const { deepStrictEqual } = require('assert');
const path = require('path');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));

describe('_v4GetIpList: v4 with 24 bit network', async () => {
  let originalMethods;

  beforeEach(() => {
    originalMethods = {
      v4: defaultGateway.v4,
      networkInterfaces: os.networkInterfaces,
    };

    // mock packages function
    defaultGateway.v4 = () => ({ gateway: '192.168.1.1', interface: 'en0' });
    os.networkInterfaces = () => ({
      lo0: [
        {
          address: '127.0.0.1',
          netmask: '255.0.0.0',
          family: 'IPv4',
          mac: '00:00:00:00:00:00',
          internal: true,
          cidr: '127.0.0.1/8',
        },
        {
          address: '::1',
          netmask: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
          family: 'IPv6',
          mac: '00:00:00:00:00:00',
          internal: true,
          cidr: '::1/128',
          scopeid: 0,
        },
        {
          address: 'fe80::1',
          netmask: 'ffff:ffff:ffff:ffff::',
          family: 'IPv6',
          mac: '00:00:00:00:00:00',
          internal: true,
          cidr: 'fe80::1/64',
          scopeid: 1,
        },
      ],
      en0: [
        {
          address: 'fe80::146a:7118:260f:62a6',
          netmask: 'ffff:ffff:ffff:ffff::',
          family: 'IPv6',
          mac: 'ab:cd:ef:01:23:45',
          internal: false,
          cidr: 'fe80::146a:7118:260f:62a6/64',
          scopeid: 11,
        },
        {
          address: '192.168.1.11',
          netmask: '255.255.255.0',
          family: 'IPv4',
          mac: 'ab:cd:ef:01:23:45',
          internal: false,
          cidr: '192.168.1.11/24',
        },
      ],
    });
  });

  afterEach(() => {
    defaultGateway.v4 = originalMethods.v4;
    os.networkInterfaces = originalMethods.networkInterfaces;
  });

  describe('wifi interface with 192.168.1.1 gateway', () => {
    it('should return all network ip list', async () => {
      const json = fs.readFileSync(path.join(__dirname, './v4-192.168.1.11-24/all.json'), 'utf8');
      const mock = JSON.parse(json);
      const result = await v4IpList();
      deepStrictEqual(result, mock);
    });

    it('should return network ip list without gateway', async () => {
      const json = fs.readFileSync(
        path.join(__dirname, './v4-192.168.1.11-24/omit-gateway.json'),
        'utf8'
      );
      const mock = JSON.parse(json);
      const result = await v4IpList({ omit: NetworkElement.GATEWAY });
      deepStrictEqual(result, mock);
    });

    it('should return network ip list without current device', async () => {
      const json = fs.readFileSync(
        path.join(__dirname, './v4-192.168.1.11-24/omit-current-device.json'),
        'utf8'
      );
      const mock = JSON.parse(json);
      const result = await v4IpList({ omit: NetworkElement.CURRENT_DEVICE });
      deepStrictEqual(result, mock);
    });

    it('should return network ip list without broadcast', async () => {
      const json = fs.readFileSync(
        path.join(__dirname, './v4-192.168.1.11-24/omit-broadcast.json'),
        'utf8'
      );
      const mock = JSON.parse(json);
      const result = await v4IpList({ omit: NetworkElement.BROADCAST });
      deepStrictEqual(result, mock);
    });

    it('should not include the gateway if it is specified in the omit parameter', async () => {
      const result = await v4IpList({ omit: NetworkElement.GATEWAY });
      expect(result).to.not.include('192.168.1.1');
    });

    it('should not include the current device ip if it is specified in the omit parameter', async () => {
      const result = await v4IpList({ omit: NetworkElement.CURRENT_DEVICE });
      expect(result).to.not.include('192.168.1.11');
    });

    it('should not include the broadcast if it is specified in the omit parameter', async () => {
      const result = await v4IpList({ omit: NetworkElement.BROADCAST });
      expect(result).to.not.include('192.168.1.255');
    });

    it('should not include the gateway, current device ip, or broadcast if they are specified in the omit parameter', async () => {
      const result = await v4IpList({
        omit: [NetworkElement.GATEWAY, NetworkElement.CURRENT_DEVICE, NetworkElement.BROADCAST],
      });
      expect(
        ['192.168.1.1', '192.168.1.11', '192.168.1.255'].every((item) => !result.includes(item))
      ).to.be.true;
    });
  });
});

describe('_v4GetIpList: v4 with 23 bit network', async () => {
  let originalMethods;

  beforeEach(() => {
    originalMethods = {
      v4: defaultGateway.v4,
      networkInterfaces: os.networkInterfaces,
    };

    // mock packages function
    defaultGateway.v4 = () => ({ gateway: '192.168.2.1', interface: 'Ethernet 3' });
    os.networkInterfaces = () => ({
      'Ethernet 2': [
        {
          address: 'fe80::ace8:247:de0:2c00',
          netmask: 'ffff:ffff:ffff:ffff::',
          family: 'IPv6',
          mac: 'fe:dc:ba:54:32:01',
          internal: false,
          cidr: 'fe80::ace8:247:de0:2c00/64',
          scopeid: 8,
        },
        {
          address: '172.16.17.16',
          netmask: '255.255.240.0',
          family: 'IPv4',
          mac: 'fe:dc:ba:54:32:01',
          internal: false,
          cidr: '172.16.17.16/20',
        },
      ],
      'Ethernet 3': [
        {
          address: 'fe80::bdce:28a3:1d84:3755',
          netmask: 'ffff:ffff:ffff:ffff::',
          family: 'IPv6',
          mac: 'aa:bb:cc:00:11:22',
          internal: false,
          cidr: 'fe80::bdce:28a3:1d84:3755/64',
          scopeid: 15,
        },
        {
          address: '192.168.3.220',
          netmask: '255.255.254.0',
          family: 'IPv4',
          mac: 'aa:bb:cc:00:11:22',
          internal: false,
          cidr: '192.168.3.220/23',
        },
      ],
    });
  });

  afterEach(() => {
    defaultGateway.v4 = originalMethods.v4;
    os.networkInterfaces = originalMethods.networkInterfaces;
  });

  describe('ethernet interface with 192.168.2.1 gateway', () => {
    it('should return all network ip list', async () => {
      const json = fs.readFileSync(path.join(__dirname, './v4-192.168.3.220-23/all.json'), 'utf8');
      const mock = JSON.parse(json);
      const result = await v4IpList();
      deepStrictEqual(result, mock);
    });

    it('should return network ip list without gateway', async () => {
      const json = fs.readFileSync(
        path.join(__dirname, './v4-192.168.3.220-23/omit-gateway.json'),
        'utf8'
      );
      const mock = JSON.parse(json);
      const result = await v4IpList({ omit: NetworkElement.GATEWAY });
      deepStrictEqual(result, mock);
    });

    it('should return network ip list without current device', async () => {
      const json = fs.readFileSync(
        path.join(__dirname, './v4-192.168.3.220-23/omit-current-device.json'),
        'utf8'
      );
      const mock = JSON.parse(json);
      const result = await v4IpList({ omit: NetworkElement.CURRENT_DEVICE });
      deepStrictEqual(result, mock);
    });

    it('should return network ip list without broadcast', async () => {
      const json = fs.readFileSync(
        path.join(__dirname, './v4-192.168.3.220-23/omit-broadcast.json'),
        'utf8'
      );
      const mock = JSON.parse(json);
      const result = await v4IpList({ omit: NetworkElement.BROADCAST });
      deepStrictEqual(result, mock);
    });
  });
});

describe('_v4GetIpList: throw v4 with 24 bit network', async () => {
  let originalMethods;

  beforeEach(() => {
    originalMethods = {
      v4: defaultGateway.v4,
      networkInterfaces: os.networkInterfaces,
    };
  });

  afterEach(() => {
    defaultGateway.v4 = originalMethods.v4;
    os.networkInterfaces = originalMethods.networkInterfaces;
  });

  it('should throw an error if network interface is not found', async () => {
    // mock packages function
    defaultGateway.v4 = () => ({ gateway: '192.168.1.1', interface: 'en0' });
    os.networkInterfaces = () => ({});

    await expect(v4IpList()).to.be.rejectedWith('interface not found');
  });

  it('should throw an error if v4 family is not found', async () => {
    // mock packages function
    defaultGateway.v4 = () => ({ gateway: '192.168.1.1', interface: 'en0' });
    os.networkInterfaces = () => ({
      en0: [
        {
          address: 'fe80::146a:7118:260f:62a6',
          netmask: 'ffff:ffff:ffff:ffff::',
          family: 'IPv6',
          mac: 'cc:bb:aa:22:11:00',
          internal: false,
          cidr: 'fe80::146a:7118:260f:62a6/64',
          scopeid: 11,
        },
      ],
    });

    await expect(v4IpList()).to.be.rejectedWith('v4 family not found in interface');
  });

  it('should throw an error if cidr is undefined in network interface', async () => {
    // mock packages function
    defaultGateway.v4 = () => ({ gateway: '192.168.1.1', interface: 'en0' });
    os.networkInterfaces = () => ({
      en0: [
        {
          address: '192.168.1.11',
          netmask: '255.255.255.0',
          family: 'IPv4',
          mac: 'cc:bb:aa:22:11:00',
          internal: false,
          cidr: undefined,
        },
      ],
    });

    await expect(v4IpList()).to.be.rejectedWith('cidr not found');
  });
});
