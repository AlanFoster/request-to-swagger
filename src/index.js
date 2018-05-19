// @flow

import statusCodes from './status-codes';
import * as jsonSchema from './json-schema';

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
  [string]: Array<SwaggerParameter>
};

type SwaggerPathDetails = {
  path: string,
  parameters: Array<SwaggerParameter>
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

function parsePath(
  request: Request,
  availablePaths: AvailablePaths = {}
): SwaggerPathDetails {
  const requestPathName = new URL(request.url).pathname;

  // Note: This can be smarter in the future, checking data types, etc.
  const existingPath = Object.keys(availablePaths).find(path => {
    const regex = path.replace(/{\w+}/g, '.*');

    return new RegExp(regex).test(requestPathName);
  });

  // TODO: Doesn't consider new params
  if (existingPath) {
    return { path: existingPath, parameters: [] };
  }

  // TODO: Doesn't consider UUIDs being in arbitrary places in a path
  const uuid = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
  const pathUuids = requestPathName.match(uuid);

  // TODO: Doesn't consider new params
  if (!pathUuids) {
    return { path: requestPathName, parameters: [] };
  }

  return pathUuids.reduce(
    function(details: SwaggerPathDetails, uuid, index) {
      const name = 'uuid' + (index === 0 ? '' : index);

      return {
        path: details.path.replace(uuid, `{${name}}`),
        parameters: details.parameters.concat([
          {
            description: name,
            in: 'path',
            name: name,
            required: true,
            type: 'string'
          }
        ])
      };
    },
    { path: requestPathName, parameters: [] }
  );
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

  const { path: swaggerPath, parameters: swaggerDetails } = parsePath(
    request,
    schema.paths
  );
  const newSchema = deepClone(schema);

  newSchema.paths = newSchema.paths || {};
  newSchema.paths[swaggerPath] = newSchema.paths[swaggerPath] || {};
  const path = newSchema.paths[swaggerPath];
  const requestMethod = request.method.toLowerCase();
  if (!path[requestMethod]) {
    path[requestMethod] = { responses: {} };
  }

  const method = path[requestMethod];

  method.consumes = method.consumes || [];
  if (request.headers['Content-Type']) {
    union(method.consumes, request.headers['Content-Type']);
  }

  method.produces = method.produces || [];
  if (response.headers['Content-Type']) {
    union(method.produces, response.headers['Content-Type']);
  }

  method.parameters = method.parameters || [];
  method.parameters = method.parameters.concat(swaggerDetails);

  if (request.body !== null) {
    const requestBody = parseBody(request);
    const requestBodySchema = jsonSchema.generate(requestBody);

    let bodyParameter: ?Object = method.parameters.find(
      parameter => parameter.in === 'body'
    );
    if (!bodyParameter) {
      bodyParameter = ({
        in: 'body',
        name: 'body',
        schema: requestBodySchema
      }: Object);
      method.parameters.push(bodyParameter);
    } else {
      bodyParameter.schema = jsonSchema.merge(
        bodyParameter.schema,
        requestBodySchema
      );
    }
  }

  method.responses[response.statusCode] =
    method.responses[response.statusCode] || {};
  const responses = method.responses[response.statusCode];

  responses.description =
    responses.description || statusCodes[response.statusCode];

  const responseBody = parseBody(response);
  let responseBodySchema;

  if (responseBody === null) {
    responseBodySchema = null;
  } else {
    responseBodySchema = jsonSchema.generate(responseBody);

    if (method.responses[response.statusCode].schema) {
      responseBodySchema = jsonSchema.merge(
        method.responses[response.statusCode].schema,
        responseBodySchema
      );
    }
  }

  method.responses[response.statusCode] = {
    description: statusCodes[response.statusCode],
    schema: responseBodySchema
  };

  return newSchema;
}
