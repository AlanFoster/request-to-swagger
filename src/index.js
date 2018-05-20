// @flow

import deepMerge from 'deepmerge';
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

  const requestMethod = request.method.toLowerCase();
  const statusCode = response.statusCode;
  const { path: swaggerPath, parameters: swaggerDetails } = parsePath(
    request,
    schema.paths
  );
  const defaultSchema = {
    swagger: '2.0',

    info: {
      version: '1.0',
      title: 'Generated Schema'
    },

    paths: {
      [swaggerPath]: {
        [request.method.toLowerCase()]: {
          consumes: [],
          produces: [],
          parameters: [],
          responses: {
            [statusCode]: {
              description: statusCodes[statusCode] || 'Unknown status code'
            }
          }
        }
      }
    }
  };

  const newSchema = deepMerge(defaultSchema, deepClone(schema));
  const method = newSchema.paths[swaggerPath][requestMethod];
  const methodResponse = method.responses[statusCode];

  if (request.headers['Content-Type']) {
    union(method.consumes, request.headers['Content-Type']);
  }

  if (response.headers['Content-Type']) {
    union(method.produces, response.headers['Content-Type']);
  }

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

  const responseBody = parseBody(response);
  let responseBodySchema;
  if (responseBody === null) {
    responseBodySchema = null;
  } else {
    responseBodySchema = jsonSchema.generate(responseBody);

    if (methodResponse.schema) {
      responseBodySchema = jsonSchema.merge(
        methodResponse.schema,
        responseBodySchema
      );
    }
  }

  methodResponse.schema = responseBodySchema;

  return newSchema;
}
