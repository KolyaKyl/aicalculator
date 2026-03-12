import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as math from 'mathjs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    // Сначала пробуем простую математику
    try {
      const simpleMath = math.evaluate(query);
      if (simpleMath !== undefined && !isNaN(simpleMath)) {
        return NextResponse.json({
          type: 'math',
          result: Math.round(simpleMath * 100) / 100,
          unit: '',
          expression: query,
          steps: [],
          description: `Simple math: ${query} = ${simpleMath}`
        });
      }
    } catch (e) {
      // не простое выражение — идём в GPT
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a calculator assistant. Analyze the user's query and respond in the SAME LANGUAGE as the query.

Return a JSON object with ONE of these structures:

1. MATHEMATICAL EXPRESSION (if query can be turned into math):
{
  "type": "math",
  "expression": string (math.js compatible),
  "steps": array of { value: string, meaning: string },
  "description": string (explanation),
  "unit": string (optional)
}

2. CALCULATED ANSWER (if query asks for calculation but not pure math, e.g. "calories in pasta"):
{
  "type": "calculated",
  "answer": string (one line answer),
  "details": string (explanation)
}

3. LOGIC TASK (If the query is a word problem with numbers that needs reasoning (like "bat and ball cost $1.10..."):
{
  "type":"reasoning",
  "answer":number,
  "steps":[...],
  "description":"..."
}

4. UNKNOWN (if really can't understand):
{
  "type": "unknown",
  "message": string (polite message asking to clarify)
}

Examples (adapt language to user's query):

Query: "15% of 2340"
Return: {"type":"math","expression":"2340 * 15 / 100","steps":[{"value":"2340","meaning":"base value"},{"value":"15","meaning":"percentage"}],"description":"15% of 2340 = 351"}

Query: "calories in a bowl of pasta"
Return: {"type":"calculated","answer":"About 350 calories","details":"A typical bowl of cooked pasta (200g) contains approximately 350 calories"}

Query: "сколько калорий в пасте"
Return: {"type":"calculated","answer":"Примерно 350 калорий","details":"Стандартная порция вареной пасты (200г) содержит около 350 калорий"}

Query: "how many pizzas for 10 people"
Return: {"type":"calculated","answer":"About 3 pizzas","details":"10 people × 2-3 slices each ÷ 8 slices per pizza ≈ 3 pizzas"}

Query: "A bat and a ball cost 1.10. The bat costs 1 more than the ball. How much is the ball?"
Return: {"type": "reasoning","answer": 0.05,"steps": ["Let x = price of ball","Then bat = x + 1","Total: x + (x + 1) = 1.10","2x + 1 = 1.10","2x = 0.10","x = 0.05"],"description": "The ball costs 0.05, the bat costs 1.05"}

Query: "Бита и мяч стоят 1.10. Бита стоит на 1 больше мяча. Сколько стоит мяч?"
Return: {"type": "reasoning","answer": 0.05,"steps": ["Пусть x = цена мяча","Тогда бита = x + 1","Всего: x + (x + 1) = 1.10","2x + 1 = 1.10","2x = 0.10","x = 0.05"],"description": "Мяч стоит 0.05, бита стоит 1.05"}

Query: "что такое любовь"
Return: {"type":"unknown","message":"Я калькулятор и могу помочь только с вычислениями."}

Query: "what is love"
Return: {"type":"unknown","message":"I'm a calculator and can only help with calculations."}

 IMPORTANT: 
  - Use the SAME LANGUAGE as the query for ALL text (answer, steps, description)
  - If the query is in English → ALL text must be in English
  - If the query is in Russian → ALL text must be in Russian
  - NEVER mix languages in the response
  - For word problems and logit tasks, solve step by step and show the reasoning
  - NEVER include units to ANY part of the response (including answer, steps and description) unless the user explicitly typed them.
  - NEVER include currency symbols ($, €, ₽, £) in ANY part of the response (including answer, steps and description) unless the user explicitly typed them.
  - Return ONLY valid JSON`
        },
        { role: 'user', content: query }
      ],
      temperature: 0.1,
      max_tokens: 500
    });

    const content = response.choices[0].message.content || '';

    // Парсим JSON
    let data;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      } else {
        data = JSON.parse(content);
      }
    } catch (e) {
      console.error('Failed to parse GPT response:', content);
      return NextResponse.json({
        type: 'unknown',
        message: 'Could not understand your request. Please try again.'
      });
    }

    // Обрабатываем разные типы ответов
    switch (data.type) {
      case 'math':
        if (!data.expression) {
          return NextResponse.json({
            type: 'unknown',
            message: 'Invalid mathematical expression'
          });
        }

        // Вычисляем
        try {
          const computed = math.evaluate(data.expression);
          return NextResponse.json({
            type: 'math',
            result: Math.round(computed * 100) / 100,
            unit: data.unit || '',
            expression: data.expression,
            steps: data.steps || [],
            description: data.description || `Result: ${computed}`
          });
        } catch (e) {
          return NextResponse.json({
            type: 'unknown',
            message: 'Could not evaluate the expression'
          });
        }
      case 'reasoning':
        return NextResponse.json({
          type: 'reasoning',
          answer: data.answer,
          steps: data.steps || [],
          description: data.description || ''
        });

      case 'calculated':
        return NextResponse.json({
          type: 'calculated',
          answer: data.answer,
          details: data.details
        });

      case 'unknown':
        return NextResponse.json({
          type: 'unknown',
          message: data.message || 'Could not understand your request'
        });

      default:
        return NextResponse.json({
          type: 'unknown',
          message: 'Unexpected response format'
        });
    }

  } catch (error) {
    console.error('🔥 API error:', error);
    return NextResponse.json({
      type: 'unknown',
      message: 'Server error. Please try again.'
    });
  }
}