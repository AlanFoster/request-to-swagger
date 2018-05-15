// @flow
import generateJsonSchema from '../generate-json-schema';

describe('generateJsonSchema', () => {
  it('should work for strings', () => {
    const input = {
      name: 'alan'
    };

    const expected = {
      type: 'object',
      required: ['name'],
      properties: {
        name: {
          type: 'string'
        }
      }
    };

    const result = generateJsonSchema(input);
    expect(result).toEqual(expected);
  });

  it('should work for primitive data types', () => {
    const input = {
      id: 1,
      description: 'wooden door',
      checked: true,
      quantity: 13.37,
      ignored: null
    };

    const expected = {
      type: 'object',
      required: ['id', 'description', 'checked', 'quantity'],
      properties: {
        id: {
          type: 'integer'
        },
        description: {
          type: 'string'
        },
        checked: {
          type: 'boolean'
        },
        quantity: {
          type: 'number'
        }
      }
    };

    const result = generateJsonSchema(input);
    expect(result).toEqual(expected);
  });

  // Note: Swagger 2.0 does not support null values. We'll skip those keys for now.
  // However, we'll handle these missing keys explicitly within the merging
  // mechanism of multiple schemas
  it('ignores null values', () => {
    const input = {
      missing: null
    };

    const expected = {
      type: 'object',
      properties: {}
    };

    const result = generateJsonSchema(input);
    expect(result).toEqual(expected);
  });

  it('should treat integers and numbers differently', () => {
    const input = {
      integer: 1000,
      number: 12.34
    };

    const expected = {
      type: 'object',
      required: ['integer', 'number'],
      properties: {
        integer: {
          type: 'integer'
        },
        number: {
          type: 'number'
        }
      }
    };

    const result = generateJsonSchema(input);
    expect(result).toEqual(expected);
  });

  it('should work for simple arrays', () => {
    const input = {
      emptyArray: [],
      tags: ['wooden', 'door', 'foo']
    };

    const expected = {
      type: 'object',
      required: ['emptyArray', 'tags'],
      properties: {
        emptyArray: {
          type: 'array',
          items: {}
        },
        tags: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      }
    };

    const result = generateJsonSchema(input);
    expect(result).toEqual(expected);
  });

  it('should work for array of arrays', () => {
    const input = {
      arrayOfArray: [[1, 2], [3, 4]]
    };

    const expected = {
      type: 'object',
      required: ['arrayOfArray'],
      properties: {
        arrayOfArray: {
          type: 'array',
          items: {
            type: 'array',
            items: {
              type: 'integer'
            }
          }
        }
      }
    };

    const result = generateJsonSchema(input);
    expect(result).toEqual(expected);
  });

  it('should work for simple objects', () => {
    const input = {
      address: {
        city: 'foo-city'
      }
    };

    const expected = {
      type: 'object',
      required: ['address'],
      properties: {
        address: {
          type: 'object',
          required: ['city'],
          properties: {
            city: { type: 'string' }
          }
        }
      }
    };

    const result = generateJsonSchema(input);
    expect(result).toEqual(expected);
  });

  it('should work for various data types', () => {
    const input = {
      id: 1,
      description: 'wooden door',
      checked: true,
      quantity: 13.37,
      tags: ['wooden', 'door', 'foo'],
      reviews: [
        {
          id: 1,
          comment: 'Nested comment'
        }
      ]
    };

    const expected = {
      type: 'object',
      required: ['id', 'description', 'checked', 'quantity', 'tags', 'reviews'],
      properties: {
        id: {
          type: 'integer'
        },
        description: {
          type: 'string'
        },
        checked: {
          type: 'boolean'
        },
        quantity: {
          type: 'number'
        },
        tags: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        reviews: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'comment'],
            properties: {
              id: {
                type: 'integer'
              },
              comment: {
                type: 'string'
              }
            }
          }
        }
      }
    };

    const result = generateJsonSchema(input);
    expect(result).toEqual(expected);
  });

  it('should work for a more complex example', () => {
    const input = {
      blogs: [
        {
          id: 1,
          content: 'first blog',
          comments: [
            {
              id: 1,
              content: 'first comment'
            },
            {
              id: 2,
              content: 'second comment'
            }
          ]
        }
      ]
    };

    const expected = {
      type: 'object',
      required: ['blogs'],
      properties: {
        blogs: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'content', 'comments'],
            properties: {
              id: {
                type: 'integer'
              },
              content: {
                type: 'string'
              },
              comments: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['id', 'content'],
                  properties: {
                    id: {
                      type: 'integer'
                    },
                    content: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const result = generateJsonSchema(input);
    expect(result).toEqual(expected);
  });
});
