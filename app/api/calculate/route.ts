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
          result: Math.round(simpleMath * 100) / 100,
          unit: '',
          expression: query,
          steps: [],
          description: `Result: ${simpleMath}`
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

3. UNKNOWN (if really can't understand):
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

Query: "что такое любовь"
Return: {"type":"unknown","message":"Я калькулятор и могу помочь только с вычислениями."}

Query: "what is love"
Return: {"type":"unknown","message":"I'm a calculator and can only help with calculations."}

Return ONLY valid JSON.`
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