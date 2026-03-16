import 'reflect-metadata';
import { ConfigProperty, getConfigProperties } from '../decorators/config-property.decorator';

describe('@ConfigProperty', () => {
  class TestService {
    @ConfigProperty({ description: 'The application port', required: true })
    get port() {
      return 3000;
    }

    @ConfigProperty({ description: 'Secret key', sensitive: true })
    get secret() {
      return 'shh';
    }

    @ConfigProperty()
    get noOptions() {
      return 'value';
    }
  }

  it('should store metadata on the class', () => {
    const properties = getConfigProperties(TestService);
    expect(properties).toHaveLength(3);
  });

  it('should store description and required flag', () => {
    const properties = getConfigProperties(TestService);
    const portProp = properties.find((p) => p.key === 'port');
    expect(portProp).toBeDefined();
    expect(portProp?.description).toBe('The application port');
    expect(portProp?.required).toBe(true);
  });

  it('should store sensitive flag', () => {
    const properties = getConfigProperties(TestService);
    const secretProp = properties.find((p) => p.key === 'secret');
    expect(secretProp).toBeDefined();
    expect(secretProp?.sensitive).toBe(true);
  });

  it('should handle decorator with no options', () => {
    const properties = getConfigProperties(TestService);
    const noOptsProp = properties.find((p) => p.key === 'noOptions');
    expect(noOptsProp).toBeDefined();
    expect(noOptsProp?.description).toBeUndefined();
    expect(noOptsProp?.required).toBeUndefined();
    expect(noOptsProp?.sensitive).toBeUndefined();
  });

  it('should return empty array for class with no decorators', () => {
    class PlainService {
      get value() {
        return 1;
      }
    }

    const properties = getConfigProperties(PlainService);
    expect(properties).toEqual([]);
  });

  it('should not share metadata between different classes', () => {
    class ServiceA {
      @ConfigProperty({ description: 'A prop' })
      get propA() {
        return 'a';
      }
    }

    class ServiceB {
      @ConfigProperty({ description: 'B prop' })
      get propB() {
        return 'b';
      }
    }

    const propsA = getConfigProperties(ServiceA);
    const propsB = getConfigProperties(ServiceB);

    expect(propsA).toHaveLength(1);
    expect(propsA[0].key).toBe('propA');
    expect(propsB).toHaveLength(1);
    expect(propsB[0].key).toBe('propB');
  });
});
