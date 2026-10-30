import { alignSolutionFunctionName, normalizeProblemFunctionDescription } from './problem-function';

export type ImportExample = { input: string; output: string; explanation: string };
export type ImportParameter = { name: string; type: string; description: string };

export type InterviewImportPayload = {
  title: string;
  company: string;
  role: string;
  difficulty: string;
  stage: string;
  category: string[];
  topics: string[];
  problemDescription: string;
  examples: ImportExample[];
  functionDescription: {
    functionName: string;
    parameters: ImportParameter[];
    returnDescription: string;
  };
  constraints: string[];
  approach: {
    coreIdea: string;
    algorithmSteps: string;
    whyWorks: string;
    edgeCases: string;
  };
  solution: { python: string; java: string; cpp: string; javascript: string; sql: string };
  complexity: { time: string; space: string };
  aiAnalysis: {
    interviewIntent: string;
    keyConcepts: string;
    commonMistakes: string;
    followUpQuestions: string;
    betterStrategy: string;
  };
};

// Legacy flat contract retained for the current Admin review and Problem publish flow.
export type ImportQuestion = {
  title: string; company: string; role: string; difficulty: string; stage: string;
  category: string; topics: string[]; description: string; examples: ImportExample[];
  functionName: string; functionParameters: string; returnDescription: string; constraints: string[];
  approach: string; approachHowToThink: string; approachObservations: string; approachSteps: string;
  solution: string; solutionLanguage: string; solutionPython: string; solutionJava: string; solutionCpp: string; solutionJavascript: string; solutionSql: string;
  timeComplexity: string; spaceComplexity: string; aiInterviewFocus: string; aiKeyConcepts: string;
  aiCommonMistakes: string; aiFollowUpQuestions: string; aiBetterStrategy: string;
};

const stringValue = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const multilineValue = (value: unknown) => typeof value === 'string' ? value.replace(/\r\n/g, '\n').replace(/^\n+|\n+$/g, '') : '';
const objectValue = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const stringArray = (value: unknown) => Array.isArray(value) ? value.map(stringValue).filter(Boolean) : stringValue(value).split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);

function normalizeExamples(value: unknown): ImportExample[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => {
    const item = objectValue(entry);
    return { input: multilineValue(item.input), output: multilineValue(item.output), explanation: multilineValue(item.explanation) };
  }).filter((item) => item.input || item.output || item.explanation);
}

function normalizeParameters(value: unknown): ImportParameter[] {
  if (Array.isArray(value)) {
    return value.map((entry) => {
      const item = objectValue(entry);
      return { name: stringValue(item.name), type: stringValue(item.type), description: stringValue(item.description) };
    }).filter((item) => item.name || item.type || item.description);
  }
  return stringValue(value).split(/\r?\n/).map((line) => line.replace(/^[-*]\s*/, '').trim()).filter(Boolean).map((line) => {
    const match = line.match(/^([^:|-]+)\s*(?::|\|)\s*([^|-]*?)\s*(?:-|\|)\s*(.*)$/);
    if (match) return { name: match[1].trim(), type: match[2].trim(), description: match[3].trim() };
    const short = line.match(/^([^:]+)\s*:\s*(.*)$/);
    return short ? { name: short[1].trim(), type: '', description: short[2].trim() } : { name: line, type: '', description: '' };
  });
}

export function normalizeInterviewImportPayload(value: unknown): InterviewImportPayload {
  const input = objectValue(value);
  const functionDescription = objectValue(input.functionDescription);
  const approach = objectValue(input.approach);
  const solution = objectValue(input.solution);
  const complexity = objectValue(input.complexity);
  const aiAnalysis = objectValue(input.aiAnalysis);
  const legacyCategory = stringValue(input.category);
  const legacySolution = stringValue(input.solution);
  const solutionLanguage = stringValue(input.solutionLanguage).toLowerCase();
  const normalizedFunctionDescription = normalizeProblemFunctionDescription({
    functionName: stringValue(functionDescription.functionName) || stringValue(input.functionName),
    parameters: normalizeParameters(functionDescription.parameters ?? input.functionParameters),
    returnDescription: stringValue(functionDescription.returnDescription) || stringValue(input.returnDescription),
  });
  const pythonSolution = stringValue(solution.python) || stringValue(input.solutionPython) || (solutionLanguage.startsWith('python') ? legacySolution : '');
  const javaSolution = stringValue(solution.java) || stringValue(input.solutionJava) || (solutionLanguage === 'java' ? legacySolution : '');
  const cppSolution = stringValue(solution.cpp) || stringValue(input.solutionCpp) || (['cpp', 'c++'].includes(solutionLanguage) ? legacySolution : '');
  const javascriptSolution = stringValue(solution.javascript) || stringValue(input.solutionJavascript) || (['javascript', 'js'].includes(solutionLanguage) ? legacySolution : '');
  const sqlSolution = stringValue(solution.sql) || stringValue(input.solutionSql) || (['sql', 'sqlite'].includes(solutionLanguage) ? legacySolution : '');

  return {
    title: stringValue(input.title),
    company: stringValue(input.company),
    role: stringValue(input.role),
    difficulty: stringValue(input.difficulty),
    stage: stringValue(input.stage),
    category: stringArray(Array.isArray(input.category) ? input.category : legacyCategory),
    topics: stringArray(input.topics),
    problemDescription: stringValue(input.problemDescription) || stringValue(input.description),
    examples: normalizeExamples(input.examples),
    functionDescription: normalizedFunctionDescription,
    constraints: stringArray(input.constraints),
    approach: {
      coreIdea: stringValue(approach.coreIdea) || stringValue(input.approachHowToThink) || (typeof input.approach === 'string' ? stringValue(input.approach) : ''),
      algorithmSteps: stringValue(approach.algorithmSteps) || stringValue(input.approachSteps),
      whyWorks: stringValue(approach.whyWorks) || stringValue(input.approachObservations),
      edgeCases: stringValue(approach.edgeCases),
    },
    solution: {
      python: alignSolutionFunctionName(pythonSolution, normalizedFunctionDescription.functionName, 'Python 3'),
      java: alignSolutionFunctionName(javaSolution, normalizedFunctionDescription.functionName, 'Java'),
      cpp: alignSolutionFunctionName(cppSolution, normalizedFunctionDescription.functionName, 'C++'),
      javascript: alignSolutionFunctionName(javascriptSolution, normalizedFunctionDescription.functionName, 'JavaScript'),
      sql: sqlSolution,
    },
    complexity: {
      time: stringValue(complexity.time) || stringValue(input.timeComplexity),
      space: stringValue(complexity.space) || stringValue(input.spaceComplexity),
    },
    aiAnalysis: {
      interviewIntent: stringValue(aiAnalysis.interviewIntent) || stringValue(input.aiInterviewFocus),
      keyConcepts: stringValue(aiAnalysis.keyConcepts) || stringValue(input.aiKeyConcepts),
      commonMistakes: stringValue(aiAnalysis.commonMistakes) || stringValue(input.aiCommonMistakes),
      followUpQuestions: stringValue(aiAnalysis.followUpQuestions) || stringValue(input.aiFollowUpQuestions),
      betterStrategy: stringValue(aiAnalysis.betterStrategy) || stringValue(input.aiBetterStrategy),
    },
  };
}

export function validateInterviewImportPayload(payload: InterviewImportPayload) {
  const requiredMissingFields: string[] = [];
  if (!payload.title) requiredMissingFields.push('Title');
  if (!payload.company) requiredMissingFields.push('Company');
  if (!payload.problemDescription) requiredMissingFields.push('Problem Description');

  const missingFields = [...requiredMissingFields];
  if (!payload.role) missingFields.push('Role');
  if (!payload.difficulty) missingFields.push('Difficulty');
  if (!payload.stage) missingFields.push('Stage');
  if (!payload.category.length) missingFields.push('Category');
  if (!payload.topics.length) missingFields.push('Topics');
  if (!payload.examples.length) missingFields.push('Examples');
  if (!payload.functionDescription.functionName && !payload.functionDescription.parameters.length && !payload.functionDescription.returnDescription) missingFields.push('Function Description');
  if (!payload.constraints.length) missingFields.push('Constraints');
  if (!Object.values(payload.approach).some(Boolean)) missingFields.push('Approach');
  if (!Object.values(payload.solution).some(Boolean)) missingFields.push('Solution');
  if (!payload.complexity.time && !payload.complexity.space) missingFields.push('Complexity');
  if (!Object.values(payload.aiAnalysis).some(Boolean)) missingFields.push('AI Analysis');
  return { valid: requiredMissingFields.length === 0, requiredMissingFields, missingFields: [...new Set(missingFields)] };
}

export function toLegacyImportQuestion(value: InterviewImportPayload): ImportQuestion {
  const payload = normalizeInterviewImportPayload(value);
  const primaryLanguage = payload.solution.python ? 'python' : payload.solution.java ? 'java' : payload.solution.cpp ? 'cpp' : payload.solution.javascript ? 'javascript' : payload.solution.sql ? 'sql' : 'python';
  const primarySolution = payload.solution[primaryLanguage as keyof typeof payload.solution] || '';
  return normalizeImportQuestion({
    title: payload.title, company: payload.company, role: payload.role, difficulty: payload.difficulty, stage: payload.stage,
    category: payload.category[0] || '', topics: payload.topics, description: payload.problemDescription, examples: payload.examples,
    functionName: payload.functionDescription.functionName,
    functionParameters: payload.functionDescription.parameters.map((parameter) => [parameter.name, parameter.type, parameter.description].filter(Boolean).join(' | ')).join('\n'),
    returnDescription: payload.functionDescription.returnDescription, constraints: payload.constraints,
    approach: payload.approach.coreIdea, approachHowToThink: payload.approach.coreIdea, approachObservations: payload.approach.whyWorks,
    approachSteps: payload.approach.algorithmSteps, solution: primarySolution, solutionLanguage: primaryLanguage,
    solutionPython: payload.solution.python, solutionJava: payload.solution.java, solutionCpp: payload.solution.cpp, solutionJavascript: payload.solution.javascript, solutionSql: payload.solution.sql,
    timeComplexity: payload.complexity.time, spaceComplexity: payload.complexity.space,
    aiInterviewFocus: payload.aiAnalysis.interviewIntent, aiKeyConcepts: payload.aiAnalysis.keyConcepts,
    aiCommonMistakes: payload.aiAnalysis.commonMistakes, aiFollowUpQuestions: payload.aiAnalysis.followUpQuestions,
    aiBetterStrategy: payload.aiAnalysis.betterStrategy,
  });
}

export function normalizeImportQuestion(value: unknown): ImportQuestion {
  const input = objectValue(value);
  return {
    title: stringValue(input.title), company: stringValue(input.company), role: stringValue(input.role), difficulty: stringValue(input.difficulty), stage: stringValue(input.stage), category: stringValue(input.category), topics: stringArray(input.topics), description: stringValue(input.description), examples: normalizeExamples(input.examples),
    functionName: stringValue(input.functionName), functionParameters: stringValue(input.functionParameters), returnDescription: stringValue(input.returnDescription), constraints: stringArray(input.constraints),
    approach: stringValue(input.approach), approachHowToThink: stringValue(input.approachHowToThink), approachObservations: stringValue(input.approachObservations), approachSteps: stringValue(input.approachSteps),
    solution: stringValue(input.solution), solutionLanguage: stringValue(input.solutionLanguage) || 'python', solutionPython: stringValue(input.solutionPython), solutionJava: stringValue(input.solutionJava), solutionCpp: stringValue(input.solutionCpp), solutionJavascript: stringValue(input.solutionJavascript), solutionSql: stringValue(input.solutionSql),
    timeComplexity: stringValue(input.timeComplexity), spaceComplexity: stringValue(input.spaceComplexity), aiInterviewFocus: stringValue(input.aiInterviewFocus), aiKeyConcepts: stringValue(input.aiKeyConcepts), aiCommonMistakes: stringValue(input.aiCommonMistakes), aiFollowUpQuestions: stringValue(input.aiFollowUpQuestions), aiBetterStrategy: stringValue(input.aiBetterStrategy),
  };
}

// Strict legacy validation is intentionally retained for the existing publish flow.
export function validateImportQuestion(question: ImportQuestion) {
  const missing: string[] = [];
  const required: Array<[string, string]> = [
    ['Title', question.title], ['Company', question.company], ['Role', question.role], ['Difficulty', question.difficulty], ['Stage', question.stage], ['Category', question.category], ['Problem Description', question.description],
    ['Function Description.Function Name', question.functionName], ['Function Description.Parameters', question.functionParameters], ['Function Description.Return Description', question.returnDescription], ['Approach', question.approach || question.approachSteps],
    ['Solution', question.solution || question.solutionPython || question.solutionJava || question.solutionCpp || question.solutionJavascript || question.solutionSql], ['Complexity.Time Complexity', question.timeComplexity], ['Complexity.Space Complexity', question.spaceComplexity],
    ['AI Analysis', question.aiInterviewFocus || question.aiKeyConcepts || question.aiCommonMistakes || question.aiFollowUpQuestions || question.aiBetterStrategy],
  ];
  for (const [name, field] of required) if (!field) missing.push(name);
  if (!question.examples.length) missing.push('Example');
  question.examples.forEach((example, index) => {
    if (!example.input) missing.push(`Example ${index + 1}.Input`);
    if (!example.output) missing.push(`Example ${index + 1}.Output`);
    if (!example.explanation) missing.push(`Example ${index + 1}.Explanation`);
  });
  if (!question.constraints.length) missing.push('Constraints');
  return { valid: missing.length === 0, missingFields: [...new Set(missing)] };
}

export function formatLegacyExamples(examples: ImportExample[]) {
  return examples.map((item, index) => `Example ${index + 1}\nInput:\n${item.input}\n\nOutput:\n${item.output}\n\nExplanation:\n${item.explanation}`).join('\n\n');
}

