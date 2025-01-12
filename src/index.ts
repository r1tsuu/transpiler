import { equal } from 'assert'

function isStringNumber(str: string) {
  return !isNaN(Number(str))
}

function isAlphabetic(char: string) {
  return /^[a-z]$/i.test(char)
}

type NumberLiteralToken = {
  type: 'NUMBER_LITERAL'
  value: number
}

type FunctionCallToken = {
  argTokens: Token[]
  functionName: string
  type: 'FUNCTION_CALL'
}

type VariableDeclarationToken = {
  type: 'VARIABLE_DECLARATION'
  value: number
  variableName: string
}

type BraceToken = {
  type: 'BRACE_END' | 'BRACE_START'
}

type MathOperationToken = {
  type: 'OPERATOR_ADD' | 'OPERATOR_DIVIDE' | 'OPERATOR_MULTIPLE' | 'OPERATOR_SUB'
}

type Token =
  | BraceToken
  | FunctionCallToken
  | MathOperationToken
  | NumberLiteralToken
  | VariableDeclarationToken

const mathExpressionMap: Record<MathOperationToken['type'], string> = {
  OPERATOR_ADD: '+',
  OPERATOR_DIVIDE: '/',
  OPERATOR_MULTIPLE: '*',
  OPERATOR_SUB: '-',
}

type ExecutionContext = {
  tokens: Token[]
  variables: Map<string, number>
}

const applyFunctionCalls = (ctx: ExecutionContext) => {
  const result: Token[] = []

  const { tokens, variables } = ctx

  for (const token of tokens) {
    if (token.type === 'FUNCTION_CALL') {
      const value = transpileExecutionContext({
        tokens: token.argTokens,
        variables,
      })!

      switch (token.functionName) {
        case 'cos':
          result.push({
            type: 'NUMBER_LITERAL',
            value: Math.sin(value),
          })
          break
        case 'log':
          result.push({
            type: 'NUMBER_LITERAL',
            value: Math.log(value),
          })
          break
        case 'sin':
          result.push({
            type: 'NUMBER_LITERAL',
            value: Math.sin(value),
          })
          break
        case 'sqrt':
          result.push({
            type: 'NUMBER_LITERAL',
            value: Math.sqrt(value),
          })
          break
        default:
          throw new Error(`Unknown function ${token.functionName}`)
      }
    } else {
      result.push(token)
    }
  }

  ctx.tokens = result
}

const sanitizeParenthness = (ctx: ExecutionContext) => {
  const result: Token[] = []
  const { tokens, variables } = ctx

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    if (token.type === 'BRACE_START') {
      let end = 0
      let extraBraces = 0

      for (let j = i; j < tokens.length; j++) {
        if (j !== i && tokens[j].type === 'BRACE_START') {
          extraBraces++
        }

        if (tokens[j].type === 'BRACE_END') {
          if (extraBraces) {
            extraBraces--
          } else {
            end = j
            break
          }
        }
      }

      const value = transpileExecutionContext({ tokens: tokens.splice(i + 1, end - 1), variables })

      if (value === null) {
        throw new Error('Bad brace value')
      }

      result.push({ type: 'NUMBER_LITERAL', value })
    } else if (token.type !== 'BRACE_END') {
      result.push(token)
    }
  }

  ctx.tokens = result
}

const sanitizePrioritizedOperators = (ctx: ExecutionContext) => {
  const result: Token[] = []

  const { tokens } = ctx
  let pushNext = true
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    if (token.type === 'OPERATOR_MULTIPLE' || token.type === 'OPERATOR_DIVIDE') {
      const previous = tokens[i - 1]
      const next = tokens[i + 1]

      if (previous.type !== 'NUMBER_LITERAL' || next.type !== 'NUMBER_LITERAL') {
        throw new Error('s')
      }

      result.pop()

      pushNext = false
      result.push({
        type: 'NUMBER_LITERAL',
        value:
          token.type === 'OPERATOR_DIVIDE'
            ? previous.value / next.value
            : previous.value * next.value,
      })
    } else if (pushNext) {
      result.push(token)
    } else {
      pushNext = true
    }
  }

  ctx.tokens = result
}

const evaluateArithmetic = ({ tokens }: ExecutionContext) => {
  let result: null | number = null

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    if (token.type === 'OPERATOR_ADD' || token.type === 'OPERATOR_SUB') {
      const previous = tokens[i - 1]
      const next = tokens[i + 1]

      if (previous.type !== 'NUMBER_LITERAL' || next.type !== 'NUMBER_LITERAL') {
        throw new Error('s')
      }

      if (!result) {
        result = previous.value
      }

      if (token.type === 'OPERATOR_ADD') {
        result += next.value
      } else {
        result -= next.value
      }
    }
  }

  return result
}

const tryReturn = ({ tokens }: ExecutionContext) => {
  if (tokens.length === 1 && tokens[0].type === 'NUMBER_LITERAL') {
    return tokens[0].value
  }
}

const transpileExecutionContext = (ctx: ExecutionContext) => {
  if (tryReturn(ctx) !== undefined) {
    return tryReturn(ctx)!
  }

  applyFunctionCalls(ctx)
  sanitizeParenthness(ctx)

  if (tryReturn(ctx) !== undefined) {
    return tryReturn(ctx)!
  }

  sanitizePrioritizedOperators(ctx)

  if (tryReturn(ctx) !== undefined) {
    return tryReturn(ctx)!
  }

  return evaluateArithmetic(ctx)
}

const tokenizeSource = (source: string) => {
  const tokens: Token[] = []

  let i = 0

  while (true) {
    const char = source[i]

    if (char === '\n') {
      i++
      continue
    }

    if (char === ' ') {
      i++
      continue
    }

    if (char === '(') {
      tokens.push({
        type: 'BRACE_START',
      })
      i++
      continue
    }

    if (char === ')') {
      tokens.push({
        type: 'BRACE_END',
      })
      i++
      continue
    }

    if (isStringNumber(char)) {
      let localIndex = i
      let number = ``

      while (true) {
        if (source[localIndex] !== '.' && !isStringNumber(source[localIndex])) {
          i--
          break
        }

        number = `${number}${source[localIndex]}`
        localIndex++
        i++
      }

      tokens.push({
        type: 'NUMBER_LITERAL',
        value: Number(number),
      })
    }

    if (isAlphabetic(char)) {
      let localIndex = i
      let word = ``

      while (localIndex < source.length && isAlphabetic(source[localIndex])) {
        word += source[localIndex]
        localIndex++
        i++
      }
      i-- // Adjust to avoid skipping the next character

      if (word === 'PI') {
        tokens.push({
          type: 'NUMBER_LITERAL',
          value: 3.14159,
        })
      }

      if (source[i + 1] === '(') {
        let argumentCode = ''
        for (let j = i + 2; j < source.length; j++) {
          if (source[j] === ')') {
            i = j + 1
            break
          }

          argumentCode = `${argumentCode}${source[j]}`
        }

        tokens.push({
          type: 'FUNCTION_CALL',
          argTokens: tokenizeSource(argumentCode),
          functionName: word,
        })
      }
    }

    const mathOperator = Object.entries(mathExpressionMap).find(([_, symbol]) => symbol === char)

    if (mathOperator) {
      const [type] = mathOperator as [MathOperationToken['type'], string]

      tokens.push({ type })
    }

    if (i >= source.length - 1) {
      break
    }

    i++
  }

  return tokens
}

const tokenizeAndTranspile = (source: string): null | number => {
  return transpileExecutionContext({
    tokens: tokenizeSource(source),
    variables: new Map(),
  })
}

export { tokenizeAndTranspile, tokenizeSource, transpileExecutionContext }
