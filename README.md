# network-ip-list
[![CI](https://github.com/lucafornerone/network-ip-list/workflows/CI/badge.svg)](https://github.com/lucafornerone/network-ip-list/actions?query=workflow%3ACI)

## Purpose

Easily generate a comprehensive list of available IPv4 addresses on your current network. This package includes filtering options, allowing you to exclude specific addresses such as routers, broadcast addresses, and your own device IP for a cleaner, more focused result.

It is ESM-only and fully written in TypeScript. It is available on JSR and npm.

## Works on
The package has been tested and works correctly on the following operating systems and runtimes:

|             | Bun  | Deno | Node |
|-------------|------|------|------|
| **macOS**   |  ✔  |  ✔   |  ✔  |
| **Linux**   |  ✔  |  ✔   |  ✔  |
| **Windows** |  ✔  |  ✔   |  ✔  |

## JSR

For complete installation and usage details with JSR, visit the [package page](https://jsr.io/@lucafornerone/network-ip-list).

From JSR, you can install the package and access documentation for all available methods. It is recommended for use with Bun and Deno, with sources available directly in TypeScript.

## npm

Installation:

```bash
npm install network-ip-list
```

## Usage example

```javascript
import { v4IpList } from 'network-ip-list';

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
    omit: [NetworkElement.Gateway, NetworkElement.CurrentDevice],
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

## Test

Bun:

```bash
bun install
bun test test/v4-bun.test.ts
```

Deno:

```bash
deno test test/v4-deno.test.ts --allow-run
```

Node:

```bash
npm install
npm run test
```

## Contribute

I'm happy to welcome any contribution, big or small, feel free to contribute however you prefer! Whether it's code or just suggestions, everything is appreciated.
Please use the GitHub Discussions section to share your ideas or ask questions.

The next big goal is to add IPv6 support, so if you'd like to help make that happen, you're more than welcome!

## License

network-ip-list is [MIT licensed](LICENSE).
