// @flow

import { Validator } from 'jsonschema';
import requestToSwagger from '../';
import type { Request, Response } from '../';
import swaggerSchema from './schemas/swagger-2.0.0.json';
import jsonSchemaDraft04 from './schemas/json-schema-draft-04.json';

const validator = new Validator();
validator.addSchema(swaggerSchema);
validator.addSchema(jsonSchemaDraft04);

function validationErrorsFor(value) {
  return validator.validate(value, swaggerSchema).errors;
}

function requestsToSwagger(
  schema: Object,
  requests: Array<{ request: Request, response: Response }>
): Object {
  return requests.reduce((acc, { request, response }) => {
    return requestToSwagger(acc, request, response);
  }, schema);
}

function createStartingSchema(): Object {
  return {
    swagger: '2.0',
    info: {
      version: '1.0',
      title: 'Hello World API'
    }
  };
}

const getHelloRequest: Request = {
  method: 'GET',
  url: 'http://example.com/hello',
  headers: {
    'Content-Type': 'application/json'
  },
  body: null
};

const getUserRequest: Request = {
  method: 'GET',
  url: 'http://example.com/users/1234',
  headers: {},
  body: null
};

const getNotificationRequest: Request = {
  method: 'GET',
  url:
    'http://example.com/users/d6fae598-f62d-468e-845e-d4b1b2020bce/notifications/03c9b475-376d-4eae-bd02-d7bba40d00c8.json',
  headers: {},
  body: null
};

const postHelloRequest: Request = {
  method: 'POST',
  url: 'http://example.com/hello',
  headers: {
    'Content-Type': 'application/json'
  },
  body: `{
    "userName": "userName"
  }`
};

const postHelloRequestWithExtraDetails: Request = {
  method: 'POST',
  url: 'http://example.com/hello',
  headers: {
    'Content-Type': 'application/json'
  },
  body: `{
    "userName": "userName",
    "firstName": "firstName",
    "lastName": "lastName"
  }`
};

const successResponse: Response = {
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json'
  },
  body: `{
    "data": {
      "result": "some string"
    }
  }`
};

const successResponseWithExtraDetails: Response = {
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json'
  },
  body: `{
    "data": {
      "result": "some string",
      "extraField": "some value"
    }
  }`
};

const failureResponse: Response = {
  statusCode: 500,
  headers: {
    'Content-Type': 'application/json'
  },
  body: `{
    "error": "Something unexpected happened"
  }`
};

describe('requestToSwagger', () => {
  it('only supports swagger 2.0', () => {
    const invalidSchema = {
      openapi: '3.0.0'
    };

    expect(() =>
      requestToSwagger(invalidSchema, getHelloRequest, successResponse)
    ).toThrow('Swagger 2.0 currently only supported');
  });

  it('creates a new path when an existing path is not present', () => {
    const schema = createStartingSchema();

    const expected = {
      swagger: '2.0',
      info: {
        version: '1.0',
        title: 'Hello World API'
      },
      paths: {
        '/hello': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        result: {
                          type: 'string'
                        }
                      },
                      required: ['result']
                    }
                  },
                  required: ['data']
                }
              }
            },
            consumes: ['application/json'],
            produces: ['application/json'],
            parameters: []
          }
        }
      }
    };

    const result = requestToSwagger(schema, getHelloRequest, successResponse);

    expect(result).toEqual(expected);
    expect(validationErrorsFor(result)).toEqual([]);
  });

  it('generates parameters when UUIDs are present within the path', function() {
    const expected = {
      swagger: '2.0',
      info: {
        version: '1.0',
        title: 'Hello World API'
      },
      paths: {
        '/users/{uuid}/notifications/{uuid1}.json': {
          get: {
            parameters: [
              {
                in: 'path',
                name: 'uuid',
                type: 'string',
                required: true,
                description: 'uuid'
              },
              {
                in: 'path',
                name: 'uuid1',
                type: 'string',
                required: true,
                description: 'uuid1'
              }
            ],
            consumes: [],
            produces: ['application/json'],
            responses: {
              '200': {
                description: 'OK',
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        result: {
                          type: 'string'
                        }
                      },
                      required: ['result']
                    }
                  },
                  required: ['data']
                }
              }
            }
          }
        }
      }
    };

    const schema = createStartingSchema();
    const result = requestToSwagger(
      schema,
      getNotificationRequest,
      successResponse
    );

    expect(result).toEqual(expected);
    expect(validationErrorsFor(result)).toEqual([]);
  });

  it('works with existing swagger path params defined', () => {
    const schema = createStartingSchema();
    schema.paths = {
      '/users/{userId}': {
        get: {
          parameters: [
            {
              in: 'path',
              name: 'userId',
              type: 'integer',
              required: true,
              description: 'Numeric ID of the user to get'
            }
          ],
          responses: {}
        }
      }
    };

    const expected = {
      swagger: '2.0',
      info: {
        version: '1.0',
        title: 'Hello World API'
      },
      paths: {
        '/users/{userId}': {
          get: {
            parameters: [
              {
                in: 'path',
                name: 'userId',
                type: 'integer',
                required: true,
                description: 'Numeric ID of the user to get'
              }
            ],
            consumes: [],
            produces: ['application/json'],
            responses: {
              '200': {
                description: 'OK',
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        result: {
                          type: 'string'
                        }
                      },
                      required: ['result']
                    }
                  },
                  required: ['data']
                }
              }
            }
          }
        }
      }
    };

    const result = requestToSwagger(schema, getUserRequest, successResponse);

    expect(result).toEqual(expected);
    expect(validationErrorsFor(result)).toEqual([]);
  });

  it('aggregates requests to the same path into one definition', () => {
    const expected = {
      swagger: '2.0',
      info: {
        version: '1.0',
        title: 'Hello World API'
      },
      paths: {
        '/hello': {
          post: {
            parameters: [
              {
                in: 'body',
                name: 'body',
                schema: {
                  type: 'object',
                  required: ['userName'],
                  properties: {
                    userName: {
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
              }
            ],
            consumes: ['application/json'],
            produces: ['application/json'],

            responses: {
              '200': {
                description: 'OK',
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        result: {
                          type: 'string'
                        }
                      },
                      required: ['result']
                    }
                  },
                  required: ['data']
                }
              }
            }
          }
        }
      }
    };

    const requests = [
      { request: postHelloRequest, response: successResponse },
      { request: postHelloRequestWithExtraDetails, response: successResponse },
      { request: postHelloRequest, response: successResponse }
    ];

    const initialSchema = createStartingSchema();
    const finalSchema = requestsToSwagger(initialSchema, requests);

    expect(finalSchema).toEqual(expected);
    expect(validationErrorsFor(finalSchema)).toEqual([]);
  });

  it('works with multiple simple GET request and responses', () => {
    const expected = {
      swagger: '2.0',
      info: {
        version: '1.0',
        title: 'Hello World API'
      },
      paths: {
        '/hello': {
          get: {
            parameters: [],
            consumes: ['application/json'],
            produces: ['application/json'],

            responses: {
              '200': {
                description: 'OK',
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        result: {
                          type: 'string'
                        }
                      },
                      required: ['result']
                    }
                  },
                  required: ['data']
                }
              },
              '500': {
                description: 'Internal Server Error',
                schema: {
                  type: 'object',
                  required: ['error'],
                  properties: {
                    error: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    };

    const requests = [
      { request: getHelloRequest, response: successResponse },
      { request: getHelloRequest, response: successResponse },
      { request: getHelloRequest, response: failureResponse }
    ];

    const initialSchema = createStartingSchema();
    const finalSchema = requestsToSwagger(initialSchema, requests);

    expect(finalSchema).toEqual(expected);
    expect(validationErrorsFor(finalSchema)).toEqual([]);
  });

  it('works with multiple simple requests and responses', () => {
    const expected = {
      swagger: '2.0',
      info: {
        version: '1.0',
        title: 'Hello World API'
      },
      paths: {
        '/hello': {
          post: {
            consumes: ['application/json'],
            produces: ['application/json'],
            parameters: [
              {
                in: 'body',
                name: 'body',
                schema: {
                  type: 'object',
                  required: ['userName'],
                  properties: {
                    userName: {
                      type: 'string'
                    }
                  }
                }
              }
            ],
            responses: {
              '200': {
                description: 'OK',
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        result: {
                          type: 'string'
                        }
                      },
                      required: ['result']
                    }
                  },
                  required: ['data']
                }
              },
              '500': {
                description: 'Internal Server Error',
                schema: {
                  type: 'object',
                  required: ['error'],
                  properties: {
                    error: { type: 'string' }
                  }
                }
              }
            }
          },

          get: {
            parameters: [],
            consumes: ['application/json'],
            produces: ['application/json'],

            responses: {
              '200': {
                description: 'OK',
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        result: {
                          type: 'string'
                        },
                        extraField: {
                          type: 'string'
                        }
                      },
                      required: ['result']
                    }
                  },
                  required: ['data']
                }
              },
              '500': {
                description: 'Internal Server Error',
                schema: {
                  type: 'object',
                  required: ['error'],
                  properties: {
                    error: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    };

    const requests = [
      { request: postHelloRequest, response: successResponse },
      { request: postHelloRequest, response: failureResponse },

      { request: getHelloRequest, response: successResponse },
      { request: getHelloRequest, response: successResponseWithExtraDetails },
      { request: getHelloRequest, response: failureResponse }
    ];

    const initialSchema = createStartingSchema();
    const finalSchema = requestsToSwagger(initialSchema, requests);

    expect(finalSchema).toEqual(expected);
    expect(validationErrorsFor(finalSchema)).toEqual([]);
  });
});
