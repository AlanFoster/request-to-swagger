// @flow

import statusCodes from './status-codes';
import generateJsonSchema from './generate-json-schema';

type Headers = { [string]: string };

export type Request = {
  method: string,
  url: string,
  headers: Headers,
  body: ?any
};

export type Response = {
  statusCode: number,
  headers: Headers,
  body: ?any
};

type SwaggerParameter = {
  in: 'header' | 'path' | 'body',
  name: string,
  type: string,
  required: ?boolean
};

type AvailablePaths = {
  [string]: [SwaggerParameter]
};

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function union(array, value) {
  if (array.indexOf(value) === -1) {
    array.push(value);
  }
  return array;
}

function generateSwaggerPath(
  request: Request,
  availablePaths: AvailablePaths = {}
) {
  const requestPathName = new URL(request.url).pathname;

  // Note: This can be smarter in the future, checking data types, etc.
  const match = Object.keys(availablePaths).find(path => {
    const regex = path.replace(/{\w+}/g, '.*');

    return new RegExp(regex).test(requestPathName);
  });

  return match || requestPathName;
}

function parseBody(requestOrResponse: Request | Response): any {
  const contentType = requestOrResponse.headers['Content-Type'] || '';

  if (
    typeof requestOrResponse.body === 'string' &&
    contentType.indexOf('application/json') === 0
  ) {
    try {
      return JSON.parse(requestOrResponse.body);
    } catch (e) {
      throw new Error(
        `Unable to parse JSON body: ${JSON.stringify(
          requestOrResponse.body,
          null,
          4
        )}`
      );
    }
  }

  return requestOrResponse.body;
}

export default function(
  schema: Object,
  request: Request,
  response: Response
): Object {
  if (schema.swagger !== '2.0') {
    throw new Error('Swagger 2.0 currently only supported');
  }

  const swaggerPath = generateSwaggerPath(request, schema.paths);
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
    let bodyParameter: ?Object = method.parameters.find(
      parameter => parameter.in === 'body'
    );
    if (!bodyParameter) {
      bodyParameter = ({
        in: 'body',
        name: 'body'
      }: Object);
      method.parameters.push(bodyParameter);
    }

    const requestBody = parseBody(request);
    bodyParameter.schema = generateJsonSchema(requestBody);
  }

  const responseBody = parseBody(response);
  method.responses[response.statusCode] = {
    description: statusCodes[response.statusCode],

    schema: responseBody === null ? undefined : generateJsonSchema(responseBody)
  };

  return newSchema;
}
