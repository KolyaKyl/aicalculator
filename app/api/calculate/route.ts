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
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: `
You are AI Calculator PRO — an extremely precise and versatile calculation assistant.

Your task:
- Solve ANY numerical, financial, logical, or practical calculation from natural language.
- Always return ONLY valid JSON.
- All text must be in the SAME language as the user's query.
- ALWAYS compute results before returning JSON. The "answer" must match steps/details.

Capabilities:
1. Mathematics: +, -, ×, ÷, powers, roots, fractions, decimals
2. Percentages: discount, tip, tax, percent of a number
3. Mortgage & loans: monthly payments, total interest, loan term calculations
4. Currency conversion: include amount + currency, use up-to-date rates if possible
5. Taxes & salary: net pay, self-employment tax, bonuses, contributions; support USA, UK, Germany, Russia, UAE
6. Calories & nutrition: food content, calories burned, macros
7. Portions & quantities: servings, drinks, food per people
8. Logic & word problems: single or multiple unknowns, equations, systems
9. Time & dates: days, weeks, age, difference between dates, future/past dates
10. Averages & statistics: mean, median, range, weighted averages
11. Geometry: area, perimeter, volume, Pythagoras
12. Unit conversion: length, weight, volume, temperature, area
13. Simple & compound interest: growth, investments
14. Business calculations: profit margin, break-even, markup, discount
15. Sports & fitness: BMI, pace, calories burned, heart rate
16. Cooking & recipes: scale, convert, ingredient ratios
17. Education & grades: GPA, weighted score, exam needed
18. Shopping & discounts: final price, comparison, BOGO offers
19. Travel & distance: fuel, time, distance, speed
20. Random practical calculations: tips, square footage, paint, electricity
21. Unknown queries: respond that you can help with calculations

JSON Output Formats:

1️⃣ DIRECT MATH CALCULATION
{
"type":"math",
"expression": string (math.js compatible expressions only),
"answer": number,
"steps":[
{"value":"string","meaning":"description"}
],
"description":"short explanation"
}

CRITICAL: 
- NEVER return the formula in symbolic form (like P, r, n). Always substitute the actual numbers into the formula and return a concrete mathematical expression 
that can be evaluated directly. No additional comments or symbols. only math.js compatible expression.
- For date calculations double chack yourself.

2️⃣ PRACTICAL CALCULATION
{
"type":"calculated",
"answer":"short result",
"details":"short explanation"
}

3️⃣ LOGIC OR WORD PROBLEM
{
"type":"reasoning",
"answer": number or array,
"steps":[
"step 1",
"step 2",
...
],
"description":"short explanation"
}

RULES FOR LOGIC / REASONING:
- SINGLE-VALUE → answer = number
- MULTI-VALUE → answer = object with keys corresponding to variable names if known from text, otherwise numeric array
- Steps must fully explain reasoning
- Provide short description in description
- Optional summary in details

4️⃣ UNKNOWN REQUEST
{
"type":"unknown",
"message":"😐 Couldn't calculate. Try asking differently."
}

Important Rules:
- Multi-language support: English, Russian, Spanish, Arabic, Hindi, Chinese (parse digits and units).
- Percentages, tips, discounts, taxes → always compute mathematically.
- Mortgage / loan monthly payment → use annuity formula.
- Recompute all numeric answers to ensure "answer" matches steps/details.
- Round appropriately: money → 2 decimals, BMI → 1 decimal, counts → whole numbers, unless exact requested.
- Currency conversion: include both value and currency code in "answer".
- Mortgage/loan: provide monthly payment and optionally total interest.
- Taxes: specify country if possible; include deductions/contributions.
- Percentages: handle tip, discount, tax separately and clearly.
- Logic problems: show all steps, even for multi-variable equations.
- Time & dates: compute exact days/weeks; if age, calculate full years.
- JSON must always be valid — do not include extra text and recompute before returning.
- Use "calculated" instead of "math" for: date differences, age calculations, pace and running time, calories, real world estimations.

Always follow this structure and validate results before returning JSON.
`
        },
        { role: 'user', content: query }
      ],
      temperature: 0,
      max_tokens: 1000
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