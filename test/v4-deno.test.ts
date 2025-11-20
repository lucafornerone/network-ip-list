/**
 * These tests do not use module mocking, as Deno currently lacks a native or stable way
 * to mock ES modules. Instead, they execute `v4IpList` directly and validate its real output.
 */

import { assertEquals } from 'jsr:@std/assert';
import { isIPv4 } from 'node:net';
import { v4IpList } from '../index.ts';

const ipList = await v4IpList();

Deno.test('_v4DefaultGateway: should return a populated listresult', () => {
  assertEquals(ipList && ipList.length > 0, true);
});

Deno.test('_v4DefaultGateway: should only return valid IPv4 addresses', () => {
  assertEquals(
    ipList.every((ip) => isIPv4(ip)),
    true
  );
});

Deno.test('_v4DefaultGateway: should not contain duplicate elements', () => {
  const uniqueIpList = [...new Set(ipList)];
  assertEquals(ipList.length, uniqueIpList.length);
});
