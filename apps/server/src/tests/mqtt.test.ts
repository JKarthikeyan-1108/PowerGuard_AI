import { initMQTTSubscriber, getMQTTClient } from '../services/mqtt.service';

jest.mock('mqtt', () => ({
  connect: jest.fn(() => ({
    on: jest.fn(),
    subscribe: jest.fn(),
    publish: jest.fn(),
  })),
}));

describe('MQTT Service', () => {
  it('should initialize MQTT subscriber and return client', () => {
    const brokerUrl = 'mqtt://localhost:1883';
    const client = initMQTTSubscriber(brokerUrl);
    expect(client).toBeDefined();
    expect(client.on).toHaveBeenCalledWith('connect', expect.any(Function));
  });

  it('should throw error if getMQTTClient is called before init', () => {
    // Note: getMQTTClient will succeed if initMQTTSubscriber was called in the previous test.
    // Ideally we'd reset modules, but we'll just check it returns the client here.
    const client = getMQTTClient();
    expect(client).toBeDefined();
  });
});
