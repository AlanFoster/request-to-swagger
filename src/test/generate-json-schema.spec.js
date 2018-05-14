import generateJsonSchema from '../generate-json-schema';

describe('simple', () => {
  it('should work for strings', () => {
    const input = {
      name: 'alan',
    };

    const expected = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
      },
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
    };

    const expected = {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
        },
        description: {
          type: 'string',
        },
        checked: {
          type: 'boolean',
        },
        quantity: {
          type: 'number',
        },
      },
    };

    const result = generateJsonSchema(input);
    expect(result).toEqual(expected);
  });

  it('does not support null', () => {
    const input = {
      missing: null,
    };

    expect(() => generateJsonSchema(input)).toThrow('Data type: object not supported, value: null');
  });

  it('should treat integers and numbers differently', () => {
    const input = {
      integer: 1000,
      number: 12.34,
    };

    const expected = {
      type: 'object',
      properties: {
        integer: {
          type: 'integer',
        },
        number: {
          type: 'number',
        },
      },
    };

    const result = generateJsonSchema(input);
    expect(result).toEqual(expected);
  });

  it('should work for simple arrays', () => {
    const input = {
      emptyArray: [],
      tags: ['wooden', 'door', 'foo'],
    };

    const expected = {
      type: 'object',
      properties: {
        emptyArray: {
          type: 'array',
        },
        tags: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    };

    const result = generateJsonSchema(input);
    expect(result).toEqual(expected);
  });

  it('should work for array of arrays', () => {
    const input = {
      arrayOfArray: [
        [
          1,
          2,
        ],
        [
          3,
          4,
        ],
      ],
    };

    const expected = {
      type: 'object',
      properties: {
        arrayOfArray: {
          type: 'array',
          items: {
            type: 'array',
            items: {
              type: 'integer',
            },
          },
        },
      },
    };

    const result = generateJsonSchema(input);
    expect(result).toEqual(expected);
  });

  it('should work for simple objects', () => {
    const input = {
      address: {
        city: 'foo-city',
      },
    };

    const expected = {
      type: 'object',
      properties: {
        address: {
          type: 'object',
          properties: {
            city: { type: 'string' },
          },
        },
      },
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
          comment: 'Nested comment',
        },
      ],
    };

    const expected = {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
        },
        description: {
          type: 'string',
        },
        checked: {
          type: 'boolean',
        },
        quantity: {
          type: 'number',
        },
        tags: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        reviews: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
              },
              comment: {
                type: 'string',
              },
            },
          },
        },
      },
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
              content: 'first comment',
            },
            {
              id: 2,
              content: 'second comment',
            },
          ],
        },
      ],
    };

    const expected = {
      type: 'object',
      properties: {
        blogs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
              },
              content: {
                type: 'string',
              },
              comments: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                    },
                    content: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const result = generateJsonSchema(input);
    expect(result).toEqual(expected);
  });
});
