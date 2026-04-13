<?php

namespace App\Services;

/**
 * Safe arithmetic expression parser using a recursive descent approach.
 *
 * Never uses eval(). Only allows whitelisted variable names and
 * the operators: + - * / ( )
 *
 * Grammar:
 *   expression  = term   { ('+' | '-') term   }
 *   term        = factor { ('*' | '/') factor }
 *   factor      = number | variable | '(' expression ')' | '-' factor
 */
class SafeExpressionParser
{
    /**
     * Variables the expression is allowed to reference.
     */
    public const ALLOWED_VARS = [
        'eligibility_score',
        'damage_score',
        'farm_size',
        'membership_score',
        'years_farming',
    ];

    /**
     * Token types produced by the tokenizer.
     */
    private const T_NUMBER   = 'NUMBER';
    private const T_VAR      = 'VAR';
    private const T_PLUS     = 'PLUS';
    private const T_MINUS    = 'MINUS';
    private const T_STAR     = 'STAR';
    private const T_SLASH    = 'SLASH';
    private const T_LPAREN   = 'LPAREN';
    private const T_RPAREN   = 'RPAREN';
    private const T_EOF      = 'EOF';

    /** @var array<int, array{type: string, value: string|float}> */
    private array $tokens = [];
    private int $pos = 0;

    /** @var array<string, float> */
    private array $variables = [];

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Validate that an expression is syntactically correct and uses only
     * whitelisted variables/operators.
     *
     * @return array{ valid: bool, errors: string[] }
     */
    public function validate(string $expression): array
    {
        $errors = [];

        // Check for forbidden PHP/shell patterns before tokenisation
        $forbidden = ['eval', 'exec', 'system', 'shell_exec', 'passthru', '`', '$', '<?', '?>'];
        foreach ($forbidden as $f) {
            if (stripos($expression, $f) !== false) {
                $errors[] = "Forbidden pattern detected: \"{$f}\"";
            }
        }
        if ($errors) {
            return ['valid' => false, 'errors' => $errors];
        }

        try {
            $this->tokenize($expression);
            // Dry-run evaluate with dummy variable values (all = 1)
            $dummyVars = array_fill_keys(self::ALLOWED_VARS, 1.0);
            $this->variables = $dummyVars;
            $this->pos = 0;
            $this->parseExpression();

            if ($this->currentToken()['type'] !== self::T_EOF) {
                $errors[] = 'Unexpected token at position ' . $this->pos . ': "' . $this->currentToken()['value'] . '"';
            }
        } catch (\RuntimeException $e) {
            $errors[] = $e->getMessage();
        }

        return ['valid' => empty($errors), 'errors' => $errors];
    }

    /**
     * Evaluate an expression with the supplied variable bindings.
     * All variable names must exist in ALLOWED_VARS.
     *
     * @param  array<string, float|int>  $variables
     * @throws \RuntimeException  on parse/evaluation errors
     */
    public function evaluate(string $expression, array $variables): float
    {
        // Restrict variable map to whitelisted keys only
        $safe = [];
        foreach ($variables as $k => $v) {
            if (in_array($k, self::ALLOWED_VARS, true)) {
                $safe[$k] = (float) $v;
            }
        }

        $this->tokenize($expression);
        $this->variables = $safe;
        $this->pos = 0;

        $result = $this->parseExpression();

        if ($this->currentToken()['type'] !== self::T_EOF) {
            throw new \RuntimeException('Unexpected token: "' . $this->currentToken()['value'] . '"');
        }

        return $result;
    }

    // -----------------------------------------------------------------------
    // Tokenizer
    // -----------------------------------------------------------------------

    private function tokenize(string $expression): void
    {
        $this->tokens = [];
        $i = 0;
        $len = strlen($expression);

        while ($i < $len) {
            $ch = $expression[$i];

            // Skip whitespace
            if (ctype_space($ch)) {
                $i++;
                continue;
            }

            // Number (integer or decimal)
            if (ctype_digit($ch) || ($ch === '.' && $i + 1 < $len && ctype_digit($expression[$i + 1]))) {
                $start = $i;
                while ($i < $len && (ctype_digit($expression[$i]) || $expression[$i] === '.')) {
                    $i++;
                }
                $this->tokens[] = ['type' => self::T_NUMBER, 'value' => (float) substr($expression, $start, $i - $start)];
                continue;
            }

            // Identifier (variable or function name)
            if (ctype_alpha($ch) || $ch === '_') {
                $start = $i;
                while ($i < $len && (ctype_alnum($expression[$i]) || $expression[$i] === '_')) {
                    $i++;
                }
                $name = substr($expression, $start, $i - $start);
                if (!in_array($name, self::ALLOWED_VARS, true)) {
                    throw new \RuntimeException("Unknown variable or function: \"{$name}\". Allowed: " . implode(', ', self::ALLOWED_VARS));
                }
                $this->tokens[] = ['type' => self::T_VAR, 'value' => $name];
                continue;
            }

            // Operators and parentheses
            $map = ['+' => self::T_PLUS, '-' => self::T_MINUS, '*' => self::T_STAR, '/' => self::T_SLASH, '(' => self::T_LPAREN, ')' => self::T_RPAREN];
            if (isset($map[$ch])) {
                $this->tokens[] = ['type' => $map[$ch], 'value' => $ch];
                $i++;
                continue;
            }

            throw new \RuntimeException("Illegal character \"{$ch}\" at position {$i}");
        }

        $this->tokens[] = ['type' => self::T_EOF, 'value' => ''];
    }

    // -----------------------------------------------------------------------
    // Recursive Descent Parser
    // -----------------------------------------------------------------------

    private function currentToken(): array
    {
        return $this->tokens[$this->pos] ?? ['type' => self::T_EOF, 'value' => ''];
    }

    private function consume(string $expectedType): array
    {
        $tok = $this->currentToken();
        if ($tok['type'] !== $expectedType) {
            throw new \RuntimeException("Expected {$expectedType}, got {$tok['type']} (\"{$tok['value']}\")");
        }
        $this->pos++;
        return $tok;
    }

    /** expression = term { ('+' | '-') term } */
    private function parseExpression(): float
    {
        $left = $this->parseTerm();

        while (in_array($this->currentToken()['type'], [self::T_PLUS, self::T_MINUS], true)) {
            $op = $this->currentToken()['type'];
            $this->pos++;
            $right = $this->parseTerm();
            $left = ($op === self::T_PLUS) ? $left + $right : $left - $right;
        }

        return $left;
    }

    /** term = factor { ('*' | '/') factor } */
    private function parseTerm(): float
    {
        $left = $this->parseFactor();

        while (in_array($this->currentToken()['type'], [self::T_STAR, self::T_SLASH], true)) {
            $op = $this->currentToken()['type'];
            $this->pos++;
            $right = $this->parseFactor();
            if ($op === self::T_SLASH) {
                if ($right == 0) {
                    throw new \RuntimeException('Division by zero in expression');
                }
                $left = $left / $right;
            } else {
                $left = $left * $right;
            }
        }

        return $left;
    }

    /** factor = number | variable | '(' expression ')' | '-' factor */
    private function parseFactor(): float
    {
        $tok = $this->currentToken();

        if ($tok['type'] === self::T_NUMBER) {
            $this->pos++;
            return (float) $tok['value'];
        }

        if ($tok['type'] === self::T_VAR) {
            $this->pos++;
            $name = (string) $tok['value'];
            return $this->variables[$name] ?? 0.0;
        }

        if ($tok['type'] === self::T_LPAREN) {
            $this->pos++;
            $val = $this->parseExpression();
            $this->consume(self::T_RPAREN);
            return $val;
        }

        if ($tok['type'] === self::T_MINUS) {
            $this->pos++;
            return -$this->parseFactor();
        }

        throw new \RuntimeException("Unexpected token \"{$tok['value']}\" (type: {$tok['type']})");
    }
}
