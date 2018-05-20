// @flow

function isObject(item) {
  return typeof item === 'object' && !Array.isArray(item) && item !== null;
}

function intersection(first = [], second = []) {
  return first.filter(element => second.indexOf(element) !== -1);
}

function asString(value) {
  return JSON.stringify(value);
}

function isEmpty(value) {
  return Object.keys(value).length === 0;
}

export default function mergeJsonSchema(first: any, second: any): Object {
  if (!isObject(first) || !isObject(second)) {
    throw new Error(
      `Expected two objects but instead received '${asString(
        first
      )}' and '${asString(second)}'`
    );
  }

  if (first.type !== second.type) {
    throw new Error(
      `The types ${asString(first.type)} and ${asString(
        second.type
      )} are not compatible for '${asString(first)}' and '${asString(second)}'`
    );
  }

  switch (first.type) {
    case 'object':
      const intersectingKeys = intersection(first.required, second.required);
      const intersectingDefinition = intersectingKeys.reduce(function(
        acc,
        key
      ) {
        const firstValue = first.properties[key];
        if (!isObject(firstValue)) {
          throw new Error(
            `Missing required key '${key}' within first properties '${asString(
              first.properties
            )}'`
          );
        }

        const secondValue = second.properties[key];
        if (!isObject(secondValue)) {
          throw new Error(
            `Missing required key '${key}' within second properties '${asString(
              second.properties
            )}'`
          );
        }

        acc[key] = mergeJsonSchema(
          first.properties[key],
          second.properties[key]
        );
        return acc;
      },
      {});

      const result = {
        ...second,
        ...first,
        required: intersectingKeys,
        properties: {
          ...second.properties,
          ...first.properties,
          ...intersectingDefinition
        }
      };

      if (intersectingKeys.length === 0) {
        delete result['required'];
      }

      return result;
    case 'array':
      let items;

      if (isEmpty(first.items)) {
        items = second.items;
      } else if (isEmpty(second.items)) {
        items = first.items;
      } else {
        items = mergeJsonSchema(first.items, second.items);
      }

      return {
        ...second,
        ...first,
        items: items
      };

    case 'boolean':
      return { ...second, ...first };
    case 'integer':
      return { ...second, ...first };
    case 'number':
      return { ...second, ...first };
    case 'string':
      return { ...second, ...first };
    default:
      throw new Error(
        `type ${asString(first.type)} not supported, first: '${asString(
          first
        )}', second: '${asString(second)}'`
      );
  }
}
