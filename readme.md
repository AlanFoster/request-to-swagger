# Request To Swagger

Generate your [Swagger](https://swagger.io/) documentation based on real
examples of requests and responses from your live staging/production traffic.

## Quick Overview

Providing you have access to an example request and response for your
application:

```javascript
import requestToSwagger from "request-to-swagger";

const request = {
  method: "GET",
  url: "http://example.com/echo/hello",
  headers: {},
  body: null
};

const response = {
  statusCode: 200,
  headers: {
    "Content-Type": "application/json"
  },
  body: `{
    "response": "hello"
  }`
};

const initialSchema = {
  swagger: "2.0"
};

const result = requestToSwagger(initialSchema, request, response);
console.log(JSON.stringify(result, null, 4));
```

When converted to YAML, the generated Swagger file will be:

```yml
swagger: '2.0'
info:
  version: '1.0'
  title: Generated Schema
paths:
  "/echo/hello":
    get:
      consumes: []
      produces:
      - application/json
      parameters: []
      responses:
        '200':
          description: OK
          schema:
            type: object
            properties:
              response:
                type: string
                example: hello
            required:
            - response
```

## Why?

Swagger is a great way to document your API. But what if you don't know your
API? This is unfortunately a common scenario for large monolithic applications
that have been maintained by various developers over the years. If you are
lucky, there might be tooling available for your application framework generate
swagger docs - otherwise you may have to write one by hand.

Instead, the approach taken by this tool is to record the current traffic being
used within your application, and generate the swagger document instead. The
more examples of requests and responses to your application, the more accurate
your generated Swagger schema will be.

This approach will also capture a side of your API that you may not have
documented correctly. For instance, do you know what your clients currently
receive when there is an unexpected exception somewhere within your stack?

## Assumptions

* This tool only generates
  [Swagger 2.0](https://github.com/OAI/OpenAPI-Specification/blob/8b85bfe60d5822871dff5904252e859625af6007/versions/2.0.md#openapi-specification)
  as at the time of writing, most client generation does not support Swagger 3.0
* This tool will try to differentiate between integers and numbers, but this may
  not always be right due to JavaScript's type limitations
* Empty Arrays and Null values will be ignored during schema duration. However,
  the assumption is that this type information will eventually be defined within
  a subsequent request/response so this should not be an issue when multiple
  valid responses are merged together.
* The tool does not currently guess formats, such as
  date/date-time/enums/minimum/maximum/lengths, or regex patterns etc.

## Semantics

When merging multiple requests in to a schema, the left value is considered to
be more important. In a scenario such as the schema already containing a
description and example type, an additional request will not override these
initially set values.

This tool will create the schema for all requests, not just 2xx responses. For
instance, if a request led to a 4xx response, the original request will still be
present within the schema.

When a new request is seen for the first time, all object keys will be required.
If an additional request comes in which does not specify the same keys, then the
new required key set will be the intersection of both requests.

## Limitations

It is not possible for this tool to know the _semantics_ of your API. For
instance, it will not attempt to cross correlate values within your payload, or
work out default values.

This tool only generates inferred schemas for JSON. XML and other data types
will be treated as strings.

## Useful

If you are new to Swagger:

* [Swagger Tutorial](https://apihandyman.io/writing-openapi-swagger-specification-tutorial-part-1-introduction/)
* [Swagger 2.0 Specification](https://github.com/OAI/OpenAPI-Specification/blob/8b85bfe60d5822871dff5904252e859625af6007/versions/2.0.md)
* [Swagger Map](https://openapi-map.apihandyman.io/)
* [Swagger Editor](https://editor.swagger.io/)

## Similar Arts

* [GenSON](https://github.com/wolverdude/GenSON) - Python JSON Schema Generator,
  multiple inputs
* [JSON Schema](https://jsonschema.net/) - Online JSON to JSON Schema Generator,
  single input
* [Liquid Technologies](https://www.liquid-technologies.com/online-json-to-schema-converter) -
  Online JSON to JSON Schema Converter, single input
* [Prmd](https://github.com/interagent/prmd) - JSON Schema tools and doc
  generation for HTTP APIs
