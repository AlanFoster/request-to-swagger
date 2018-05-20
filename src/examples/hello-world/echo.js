import requestToSwagger from "../..";

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

export default requestToSwagger(initialSchema, request, response);
