import os from 'node:os';
import defaultGateway from 'default-gateway';

const v4Details = {
  family: 'IPv4',
  bit: 32,
};

export enum NetworkElement {
  GATEWAY = 'gateway',
  CURRENT_DEVICE = 'current-device',
  BROADCAST = 'broadcast',
}

/**
 * Generate ip list on IPv4 interface
 *
 * This function generates a list of available IPv4 addresses on the current network
 *
 * Optionally, specific network elements (gateway, broadcast or the device's own IP can be omitted from the list
 *
 * @example
 * ```typescript
 * const ipList = await v4IpList();
 * console.log(ipList); // ['192.168.1.1', '192.168.1.2', '192.168.1.3', '192.168.1.4', ... ]
 * ```
 *
 * @param {Object} [options] - Optional configuration for filtering specific network elements
 * @param {NetworkElement[]} [options.omit] - An array of network elements (see NetworkElement enum) to omit from the list
 *
 * @returns {Promise<string[]>} A promise that resolves to an array of IPv4 addresses as strings
 */
export async function v4IpList(options?: { omit: NetworkElement[] }): Promise<string[]> {
  // gateway and interface of current network
  const currentNetwork = await defaultGateway.v4();
  // all interfaces available
  const interfaces = os.networkInterfaces() as { [key: string]: os.NetworkInterfaceInfo[] };

  if (!interfaces[currentNetwork.interface]) {
    throw new Error('interface not found');
  }

  // IPv4 current interface
  const int = interfaces[currentNetwork.interface].find((n) => n.family === v4Details.family);
  if (!int) {
    throw new Error('v4 family not found in interface');
  }

  if (!int.cidr) {
    throw new Error('cidr not found');
  }

  // obtain prefix from Classless Inter-Domain Routing
  const prefixLengthIndex = int.cidr.indexOf('/') + 1;
  const prefixLength = Number(int.cidr.substring(prefixLengthIndex));
  // total addresses available in current network
  const totalAddresses = Math.pow(2, v4Details.bit - prefixLength);
  // ignore network address (the first one)
  let totalHosts = totalAddresses - 1;

  if (options?.omit.includes(NetworkElement.BROADCAST)) {
    // remove broadcast address (the last one)
    totalHosts--;
  }

  // ip list from gateway
  const gateway = currentNetwork.gateway;
  let ipList = _v4GenerateIpRange(gateway, totalHosts);

  if (options?.omit.includes(NetworkElement.CURRENT_DEVICE)) {
    const deviceIp = int.address;
    ipList = ipList.filter((ip) => ip !== deviceIp);
  }

  if (options?.omit.includes(NetworkElement.GATEWAY)) {
    ipList = ipList.filter((ip) => ip !== gateway);
  }

  return ipList;
}

/**
 * Generate a list of IPv4 addresses within the specified range
 *
 * This function creates a list of `n` consecutive IPv4 addresses starting from the given `ip`
 *
 * @param {string} ip - The starting IPv4 address
 * @param {number} n - The number of IPv4 addresses to generate
 *
 * @returns {string[]} A list containing the generated IPv4 addresses
 */
function _v4GenerateIpRange(ip: string, n: number): string[] {
  const ipParts = ip.split('.').map(Number);
  let ipList = [];

  for (let i = 0; i < n; i++) {
    ipList.push(ipParts.join('.'));
    ipParts[3]++;
    for (let j = 3; j >= 0; j--) {
      if (ipParts[j] > 255) {
        ipParts[j] = 0;
        ipParts[j - 1]++;
      }
    }
  }

  return ipList;
}
