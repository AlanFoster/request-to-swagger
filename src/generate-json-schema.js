function isObject(item) {
  return (typeof item === 'object' && !Array.isArray(item) && item !== null);
}

export default function generateJsonSchema(value) {
  if (isObject(value)) {
    return {
      type: 'object',
      // All keys are required by default when generating a schema for a single object
      required: Object.keys(value),
      properties: Object.keys(value).reduce((acc, key) => {
        acc[key] = generateJsonSchema(value[key]);
        return acc;
      }, {}),
    };
  } else if (Array.isArray(value)) {
    if (value.length === 0) {
      return { type: 'array' };
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
