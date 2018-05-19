// @flow
import merge from '../';

describe('merge', () => {
  it('requires objects as input', function() {
    expect(() => merge(undefined, undefined)).toThrow(
      "Expected two objects but instead received 'undefined' and 'undefined'"
    );
    expect(() => merge({}, undefined)).toThrow(
      "Expected two objects but instead received '{}' and 'undefined'"
    );
    expect(() => merge(undefined, {})).toThrow(
      "Expected two objects but instead received 'undefined' and '{}'"
    );
  });

  it('should not handle an unknown type', function() {
    const first = {
      type: 'foo'
    };

    const second = {
      type: 'foo'
    };

    expect(() => merge(first, second)).toThrow(
      'type "foo" not supported, first: \'{"type":"foo"}\', second: \'{"type":"foo"}\''
    );
  });

  it('should handle merging two strings', function() {
    const first = {
      type: 'string',
      example: '123'
    };

    const second = {
      type: 'string',
      description: 'string example',
      example: '123456'
    };

    // Note that the first input values are considered to be more 'important'
    // For instance, we don't want to replace the initial description or examples
    const expected = {
      type: 'string',
      description: 'string example',
      example: '123'
    };

    const result = merge(first, second);
    expect(result).toEqual(expected);
  });

  it('should handle merging two integers', function() {
    const first = {
      type: 'integer',
      example: 123
    };

    const second = {
      type: 'integer',
      description: 'integer example',
      example: 123456
    };

    // Note that the first input values are considered to be more 'important'
    // For instance, we don't want to replace the initial description or examples
    const expected = {
      type: 'integer',
      description: 'integer example',
      example: 123
    };

    const result = merge(first, second);
    expect(result).toEqual(expected);
  });

  it('should handle merging two numbers', function() {
    const first = {
      type: 'number',
      example: 123.5
    };

    const second = {
      type: 'number',
      description: 'number example',
      example: 123456.5
    };

    // Note that the first input values are considered to be more 'important'
    // For instance, we don't want to replace the initial description or examples
    const expected = {
      type: 'number',
      description: 'number example',
      example: 123.5
    };

    const result = merge(first, second);
    expect(result).toEqual(expected);
  });

  it('should handle merging two booleans', function() {
    const first = {
      type: 'boolean',
      example: false
    };

    const second = {
      type: 'boolean',
      description: 'boolean example',
      example: true
    };

    // Note that the first input values are considered to be more 'important'
    // For instance, we don't want to replace the initial description or examples
    const expected = {
      type: 'boolean',
      description: 'boolean example',
      example: false
    };

    const result = merge(first, second);
    expect(result).toEqual(expected);
  });

  it('should not change the schema if the same object schema is merged with itself', () => {
    const input = {
      type: 'object',
      required: ['firstName'],
      properties: {
        firstName: {
          type: 'string'
        }
      }
    };

    const result = merge(input, input);
    expect(result).toEqual(input);
  });

  it('should merge two object schemas together, respecting required keys', function() {
    const first = {
      type: 'object',
      required: ['firstName'],
      properties: {
        firstName: {
          type: 'string'
        }
      }
    };

    const second = {
      type: 'object',
      required: ['firstName', 'lastName'],
      properties: {
        firstName: {
          type: 'string'
        },
        lastName: {
          type: 'string'
        }
      }
    };

    const expected = {
      type: 'object',
      required: ['firstName'],
      properties: {
        firstName: {
          type: 'string'
        },
        lastName: {
          type: 'string'
        }
      }
    };

    const result = merge(first, second);
    expect(result).toEqual(expected);
  });

  it('will handle one response containing no required fields', function() {
    const first = {
      type: 'object',
      required: ['firstName'],
      properties: {
        firstName: {
          type: 'string'
        }
      }
    };

    const second = {
      type: 'object',
      properties: {}
    };

    const expected = {
      type: 'object',
      properties: {
        firstName: {
          type: 'string'
        }
      }
    };

    const result = merge(first, second);
    expect(result).toEqual(expected);
  });

  it('will merge two defined arrays together', function() {
    const first = {
      type: 'array',
      items: {
        type: 'string',
        example: '123'
      }
    };

    const second = {
      type: 'array',
      items: {
        type: 'string',
        description: 'string example',
        example: '123456'
      }
    };

    const expected = {
      type: 'array',
      items: {
        type: 'string',
        description: 'string example',
        example: '123'
      }
    };

    const result = merge(first, second);
    expect(result).toEqual(expected);
  });

  it('will merge an empty array with a defined array together', function() {
    const first = {
      type: 'array',
      items: {}
    };

    const second = {
      type: 'array',
      items: {
        type: 'string'
      }
    };

    const expected = {
      type: 'array',
      items: {
        type: 'string'
      }
    };

    const result = merge(first, second);
    expect(result).toEqual(expected);
  });

  it('will merge two defined arrays together', function() {
    const first = {
      type: 'array',
      items: {
        type: 'string',
        example: '123'
      }
    };

    const second = {
      type: 'array',
      items: {
        type: 'string',
        description: 'string example',
        example: '123456'
      }
    };

    const expected = {
      type: 'array',
      items: {
        type: 'string',
        description: 'string example',
        example: '123'
      }
    };

    const result = merge(first, second);
    expect(result).toEqual(expected);
  });

  it('will merge two objects with array schemas together', function() {
    const first = {
      type: 'object',
      required: ['customers', 'tags'],
      properties: {
        customers: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'firstName'],
            properties: {
              id: {
                type: 'string'
              },

              firstName: {
                type: 'string'
              }
            }
          }
        },
        tags: {
          type: 'array',
          description: 'tags',
          items: {}
        }
      }
    };

    const second = {
      type: 'object',
      required: ['customers', 'tags'],
      properties: {
        customers: {
          type: 'array',
          description: 'customers',
          items: {
            type: 'object',
            required: ['id', 'lastName'],
            properties: {
              id: {
                type: 'string'
              },
              lastName: {
                type: 'string'
              }
            }
          }
        },

        tags: {
          type: 'array',
          items: {
            type: 'string',
            example: 'hello world'
          }
        }
      }
    };

    const expected = {
      type: 'object',
      required: ['customers', 'tags'],
      properties: {
        customers: {
          type: 'array',
          description: 'customers',
          items: {
            type: 'object',
            required: ['id'],
            properties: {
              id: {
                type: 'string'
              },
              firstName: {
                type: 'string'
              },
              lastName: {
                type: 'string'
              }
            }
          }
        },
        tags: {
          type: 'array',
          description: 'tags',
          items: {
            type: 'string',
            example: 'hello world'
          }
        }
      }
    };

    const result = merge(first, second);
    expect(result).toEqual(expected);
  });

  it('will not attempt to merge different data types, or widen scopes', function() {
    [
      // Integer and number are interesting, as a value previously defined as integer
      // may indeed be a number, and it may be possible to widen the types
      // But for now, let's treat it as an error.
      { first: { type: 'integer' }, second: { type: 'number' } },
      { first: { type: 'integer' }, second: { type: 'string' } },
      { first: { type: 'integer' }, second: { type: 'array' } },
      { first: { type: 'integer' }, second: { type: 'object' } },

      { first: { type: 'number' }, second: { type: 'integer' } },
      { first: { type: 'number' }, second: { type: 'string' } },
      { first: { type: 'number' }, second: { type: 'array' } },
      { first: { type: 'number' }, second: { type: 'object' } }
    ].forEach(function({ first, second }) {
      expect(() => merge(first, second)).toThrow(
        `The types \"${first.type}\" and \"${second.type}\" are not compatible`
      );
    });
  });
});
