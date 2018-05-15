// @flow

import generateJsonSchema from './generate-json-schema';
import { STATUS_CODES } from 'http';

const deepClone = value => JSON.parse(JSON.stringify(value));
const union = function (array, value) {
  if (array.indexOf(value) === -1) {
    array.push(value);
  }
  return array;
};

type Headers = { [string]: [string] }

type Request = {
  method: string,
  url: string,
  headers: Headers,
  body: any
};

type Response = {
  statusCode: number,
  headers: { [string]: [string] },
  body: any
};

function generateSwaggerPath(request: Request) {
  if (request.parsedUrl) {
    return request.parsedUrl;
  }

  return new URL(request.url).pathname;
}

function parseBody(request: Request) {
  const contentType = request.headers['Content-Type'] || '';

  if (request.body !== null && contentType.indexOf('application/json') === 0) {
    try {
      return JSON.parse(request.body);
    } catch (e) {
      throw new Error(`Unable to parse JSON body: ${JSON.stringify(request.body, null, 4)}`);
    }
  }

  return request.body;
}

export default function (schema, request: Request, response: Response) {
  if (schema.swagger !== '2.0') {
    throw new Error('Swagger 2.0 currently only supported');
  }

  const swaggerPath = generateSwaggerPath(request);
  const statusCode = response.statusCode.toString();

  const newSchema = deepClone(schema);

  newSchema.paths = newSchema.paths || {};
  newSchema.paths[swaggerPath] = newSchema.paths[swaggerPath] || {};
  const path = newSchema.paths[swaggerPath];
  const requestMethod = request.method.toLowerCase();
  if (!path[requestMethod]) {
    path[requestMethod] = { responses: {} };
  }

  const method = path[requestMethod];

  if (request.headers['Content-Type']) {
    method.consumes = method.consumes || [];
    union(method.consumes, request.headers['Content-Type']);
  }

  if (response.headers['Content-Type']) {
    method.produces = method.produces || [];
    union(method.produces, response.headers['Content-Type']);
  }

  if (request.body !== null) {
    method.parameters = method.parameters || [];
    let bodyParameter = method.parameters.find(parameter => parameter.in === 'body');
    if (!bodyParameter) {
      bodyParameter = {
        in: 'body',
        name: 'body',
      };
      method.parameters.push(bodyParameter);
    }

    const requestBody = parseBody(request);
    bodyParameter.schema = generateJsonSchema(requestBody);
  }

  const responseBody = parseBody(response);
  method.responses[statusCode] = {
    description: STATUS_CODES[statusCode],

    schema: responseBody === null ? undefined : generateJsonSchema(responseBody),
  };

  return newSchema;
}
