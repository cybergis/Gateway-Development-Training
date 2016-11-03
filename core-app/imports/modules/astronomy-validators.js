import { Validator } from 'meteor/jagi:astronomy';

Validator.create({
  name: 'integer',
  isValid ({ value }) {
    return Number.isInteger(value);
  },
  resolveError ({ name }) {
    return `"${name}" must be an integer.`;
  }
});

Validator.create({
  name: 'bbox',
  parseParam (param) {
    if (!Array.isArray(param)
      || param.length !== 4
      || !param.every((x) => typeof x === 'number')
    ) {
      throw new TypeError(
        `Parameter for the "bbox" validator has to be an array of 4 number.`
      );
    }
  },
  isValid ({ value, param }) {
    return Array.isArray(param)
          && param.length === 4
          && param.every((x) => typeof x === 'number')
          && (value[0] >= param[0] && value[0] <= param[1])
          && (value[2] >= param[0] && value[2] <= param[1])
          && (value[1] >= param[2] && value[1] <= param[3])
          && (value[3] >= param[2] && value[3] <= param[3]);
  },
  resolveError ({ name, param }) {
    return `"${name}" must have x values from ${param[0]} to ${param[1]} and y values from ${param[2]} to ${param[3]}.`;
  }
});
