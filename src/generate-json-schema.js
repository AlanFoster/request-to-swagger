// @flow

function isObject(item) {
  return (typeof item === 'object' && !Array.isArray(item) && item !== null);
}

export default function generateJsonSchema(value) {
  if (isObject(value)) {
    // All keys are required by default when generating a schema for a single object
    // Note that null keys are ignored, as there is no type information available
    // This logic will instead be implemented within the merging of multiple schemas
    const requiredKeys = Object.keys(value).filter(key => value[key] !== null);

    const result = {
      type: 'object',
      properties: requiredKeys.reduce((acc, key) => {
        acc[key] = generateJsonSchema(value[key]);
        return acc;
      }, {}),
    };

    if (requiredKeys.length > 0) {
      result.required = requiredKeys;
    }

    return result;
  } else if (Array.isArray(value)) {
    if (value.length === 0) {
      return { type: 'array', items: {} };
    }

    return {
      type: 'array',
      items: generateJsonSchema(value[0]),
    };
  } else if (typeof value === 'number') {
    return {
      type: Number.isSafeInteger(value) ? 'integer' : 'number',
    };
  } else if (typeof value === 'boolean') {
    return {
      type: 'boolean',
    };
  } else if (typeof value === 'string') {
    return {
      type: 'string',
    };
  }
  throw new Error(`Data type: ${typeof value} not supported, value: ${value}`);
}
