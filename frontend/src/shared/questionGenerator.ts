export interface Question {
  id: string;
  text: string;
  answer: number;
}

export function generateQuestion(difficulty: 'Easy' | 'Medium' | 'Hard'): Question {
  const id = Math.random().toString(36).substring(2, 9);
  let text = '';
  let answer = 0;

  const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  if (difficulty === 'Easy') {
    const type = getRandomInt(1, 4); // 1: Add, 2: Sub, 3: Mult, 4: Div
    switch (type) {
      case 1: {
        const a = getRandomInt(2, 50);
        const b = getRandomInt(2, 50);
        text = `${a} + ${b}`;
        answer = a + b;
        break;
      }
      case 2: {
        const a = getRandomInt(10, 80);
        const b = getRandomInt(2, a - 1);
        text = `${a} - ${b}`;
        answer = a - b;
        break;
      }
      case 3: {
        const a = getRandomInt(2, 10);
        const b = getRandomInt(2, 10);
        text = `${a} × ${b}`;
        answer = a * b;
        break;
      }
      case 4: {
        const b = getRandomInt(2, 10);
        const ans = getRandomInt(2, 10);
        const a = b * ans;
        text = `${a} ÷ ${b}`;
        answer = ans;
        break;
      }
    }
  } else if (difficulty === 'Medium') {
    const type = getRandomInt(1, 5); // 1: Large Add/Sub, 2: Mult/Div, 3: Multi-step, 4: Percentage, 5: Powers
    switch (type) {
      case 1: {
        const a = getRandomInt(50, 400);
        const b = getRandomInt(50, 400);
        if (Math.random() > 0.5) {
          text = `${a} + ${b}`;
          answer = a + b;
        } else {
          const maxVal = Math.max(a, b);
          const minVal = Math.min(a, b);
          text = `${maxVal} - ${minVal}`;
          answer = maxVal - minVal;
        }
        break;
      }
      case 2: {
        const a = getRandomInt(11, 20);
        const b = getRandomInt(3, 12);
        if (Math.random() > 0.5) {
          text = `${a} × ${b}`;
          answer = a * b;
        } else {
          const ans = getRandomInt(11, 20);
          const mult = ans * b;
          text = `${mult} ÷ ${b}`;
          answer = ans;
        }
        break;
      }
      case 3: {
        if (Math.random() > 0.5) {
          const a = getRandomInt(10, 50);
          const b = getRandomInt(10, 50);
          const c = getRandomInt(5, a + b - 1);
          text = `(${a} + ${b}) - ${c}`;
          answer = (a + b) - c;
        } else {
          const a = getRandomInt(2, 10);
          const b = getRandomInt(3, 10);
          const c = getRandomInt(5, 50);
          text = `${a} × ${b} + ${c}`;
          answer = (a * b) + c;
        }
        break;
      }
      case 4: {
        const percents = [10, 20, 25, 50, 75];
        const pct = percents[getRandomInt(0, percents.length - 1)];
        let base = 10;
        if (pct === 25 || pct === 75) base = 4;
        else if (pct === 50) base = 2;
        else if (pct === 20) base = 5;
        
        const multiplier = getRandomInt(2, 40);
        const num = base * multiplier * 10;
        text = `${pct}% of ${num}`;
        answer = (num * pct) / 100;
        break;
      }
      case 5: {
        const x = getRandomInt(2, 15);
        const c = getRandomInt(5, 50);
        if (Math.random() > 0.5) {
          text = `${x}² + ${c}`;
          answer = (x * x) + c;
        } else {
          text = `${x}² - ${c}`;
          answer = (x * x) - c;
        }
        break;
      }
    }
  } else {
    // Hard Mode
    const type = getRandomInt(1, 4); // 1: Roots + Mult, 2: Fractions, 3: Percentages + Add, 4: Complex Multi-step
    switch (type) {
      case 1: {
        const roots = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225];
        const base = roots[getRandomInt(0, roots.length - 1)];
        const rootVal = Math.sqrt(base);
        const b = getRandomInt(3, 15);
        const c = getRandomInt(3, 12);
        text = `√${base} + ${b} × ${c}`;
        answer = rootVal + (b * c);
        break;
      }
      case 2: {
        const bOptions = [3, 4, 5, 6, 8];
        const b = bOptions[getRandomInt(0, bOptions.length - 1)];
        const a = getRandomInt(1, b - 1);
        const multiplier = getRandomInt(3, 25);
        const c = b * multiplier;
        text = `${a}/${b} × ${c}`;
        answer = (a * c) / b;
        break;
      }
      case 3: {
        const percents = [15, 35, 45, 65, 85, 12, 18];
        const pct = percents[getRandomInt(0, percents.length - 1)];
        const gcd = (x: number, y: number): number => !y ? x : gcd(y, x % y);
        const base = 100 / gcd(pct, 100);
        const multiplier = getRandomInt(1, 15);
        const num = base * multiplier;
        const offset = getRandomInt(10, 100);
        text = `${pct}% of ${num} + ${offset}`;
        answer = Math.round((num * pct) / 100) + offset;
        break;
      }
      case 4: {
        if (Math.random() > 0.5) {
          const a = getRandomInt(2, 6);
          const b = getRandomInt(5, 20);
          const c = getRandomInt(5, 15);
          text = `${a}³ - ${b} × ${c}`;
          answer = Math.pow(a, 3) - (b * c);
        } else {
          const a = getRandomInt(12, 30);
          const b = getRandomInt(5, 15);
          const c = getRandomInt(2, 10);
          text = `${a} × ${b} - ${c}²`;
          answer = (a * b) - (c * c);
        }
        break;
      }
    }
  }

  return { id, text, answer };
}
