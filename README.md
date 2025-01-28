# network-ip-list
[![CI](https://github.com/lucafornerone/network-ip-list/workflows/CI/badge.svg)](https://github.com/lucafornerone/network-ip-list/actions?query=workflow%3ACI)

## Purpose

Easily generate a comprehensive list of available IPv4 addresses on your current network. This package includes filtering options, allowing you to exclude specific addresses such as routers, broadcast addresses, and your own device IP for a cleaner, more focused result.


## Installation

```bash
npm install network-ip-list
```

## Usage

ESM-syntax:

```javascript
import { v4IpList } from 'network-ip-list';
```

CommonJS:

```javascript
const { v4IpList } = require('network-ip-list');
```

Example:

```javascript
(async () => {
  // Get all available IPv4 addresses in the network
  const ipList = await v4IpList();
  console.log(ipList);
  /*
  [
  '192.168.1.1', '192.168.1.2', '192.168.1.3', '192.168.1.4',
  '192.168.1.5', '192.168.1.6', '192.168.1.7', '192.168.1.8',
  ... ]
  */

  // Omit the gateway and device's own IP from the results
  const filteredIpList = await v4IpList({
    omit: [NetworkElement.GATEWAY, NetworkElement.CURRENT_DEVICE],
  });
  console.log(filteredIpList);
  /*
  [
  '192.168.1.2', '192.168.1.3', '192.168.1.4', '192.168.1.6',
  '192.168.1.7', '192.168.1.8',
  ... ]
  */
})();
```

### Test

For unit testing run the following command:

```bash
npm run test
```

## Contribute

I'm happy to welcome any contribution, big or small — feel free to contribute however you prefer! Whether it's code or just suggestions, everything is appreciated.
Please use the GitHub Discussions section to share your ideas or ask questions.

The next big goal is to add IPv6 support, so if you'd like to help make that happen, you're more than welcome!

## License

network-ip-list is [MIT licensed](LICENSE).
