export const mockState = {
  currentResponse: {} as {
    ip: string;
    gateway: string;
    interface: string;
    prefixLength: number;
  },
};

export async function v4DefaultGateway() {
  return mockState.currentResponse;
}
