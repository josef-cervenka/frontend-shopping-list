const DEFAULT_MAX = 128

function stringRequired(label, { max = DEFAULT_MAX } = {}) {
  return (value) => {
    if (typeof value !== 'string') return `${label} must be a string`
    const trimmed = value.trim()
    if (!trimmed) return `${label} is required`
    if (trimmed.length > max) return `${label} is too long (max ${max} chars)`
    return null
  }
}

function stringOptional(label, { max = DEFAULT_MAX } = {}) {
  return (value) => {
    if (value === undefined) return null
    if (typeof value !== 'string') return `${label} must be a string`
    const trimmed = value.trim()
    if (!trimmed) return `${label} cannot be empty`
    if (trimmed.length > max) return `${label} is too long (max ${max} chars)`
    return null
  }
}

function booleanOptional(label) {
  return (value) => {
    if (value === undefined) return null
    if (typeof value !== 'boolean') return `${label} must be a boolean`
    return null
  }
}

function booleanStringOptional(label) {
  return (value) => {
    if (value === undefined) return null
    if (typeof value !== 'string') return `${label} must be a string ('true' or 'false')`
    const lowered = value.toLowerCase()
    if (lowered !== 'true' && lowered !== 'false') {
      return `${label} must be 'true' or 'false'`
    }
    return null
  }
}

function runRules(source, rules, sourceName, errors) {
  if (!rules) return
  for (const [field, rule] of Object.entries(rules)) {
    const error = rule(source?.[field])
    if (error) {
      errors.push(`${sourceName}.${field}: ${error}`)
    }
  }
}

function validate(schema) {
  return (req, res, next) => {
    const errors = []

    runRules(req.params, schema.params, 'params', errors)
    runRules(req.query, schema.query, 'query', errors)
    runRules(req.body, schema.body, 'body', errors)

    if (errors.length) {
      return res.status(400).json({ message: 'Invalid input', errors })
    }

    return next()
  }
}

module.exports = {
  validate,
  stringRequired,
  stringOptional,
  booleanOptional,
  booleanStringOptional,
}
