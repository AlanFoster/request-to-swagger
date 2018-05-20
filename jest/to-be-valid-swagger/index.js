import { Validator } from 'jsonschema';
import swaggerSchema from './schemas/swagger-2.0.0.json';
import jsonSchemaDraft04 from './schemas/json-schema-draft-04.json';

const validator = new Validator();
validator.addSchema(swaggerSchema);
validator.addSchema(jsonSchemaDraft04);

function validationErrorsFor(value) {
  return validator.validate(value, swaggerSchema).errors;
}

export default function (received) {
  try {
    expect(validationErrorsFor(received)).toEqual([]);
    return { pass: true };
  } catch (e) {
    return { pass: false, message: () => e.message };
  }
};
