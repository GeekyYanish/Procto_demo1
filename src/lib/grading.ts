/**
 * Auto-grading engine adapted from Procto backend.
 * Grades MCQ, multi-select, true/false, short answer, numerical automatically.
 * Essay and code questions are flagged for manual grading.
 */

export interface GradingResult {
    autoScore: number;
    needsManualGrading: boolean;
}

export function gradeAnswer(
    type: string,
    content: Record<string, unknown>,
    studentResponse: unknown,
    points: number
): GradingResult {
    switch (type) {
        case 'MULTIPLE_CHOICE':
            return gradeMCQ(studentResponse as string, content.correctAnswer as string, points);

        case 'MULTIPLE_SELECT':
            return gradeMultipleSelect(
                studentResponse as string[],
                content.correctAnswer as string[],
                points
            );

        case 'TRUE_FALSE':
            return gradeTrueFalse(studentResponse as string, content.correctAnswer as string, points);

        case 'SHORT_ANSWER':
            return gradeShortAnswer(
                studentResponse as string,
                content.correctAnswer as string,
                points,
                (content.caseInsensitive as boolean) ?? true
            );

        case 'NUMERICAL':
            return gradeNumerical(studentResponse as number, content.correctAnswer as number, points);

        case 'ESSAY':
        case 'CODE':
            return { autoScore: 0, needsManualGrading: true };

        default:
            return { autoScore: 0, needsManualGrading: false };
    }
}

function gradeMCQ(studentAnswer: string, correctAnswer: string, points: number): GradingResult {
    return {
        autoScore: studentAnswer === correctAnswer ? points : 0,
        needsManualGrading: false,
    };
}

function gradeMultipleSelect(
    studentAnswers: string[],
    correctAnswers: string[],
    points: number
): GradingResult {
    if (!Array.isArray(studentAnswers) || !Array.isArray(correctAnswers)) {
        return { autoScore: 0, needsManualGrading: false };
    }

    const studentSet = new Set(studentAnswers);
    const correctSet = new Set(correctAnswers);

    if (studentSet.size !== correctSet.size) {
        return { autoScore: 0, needsManualGrading: false };
    }

    for (const answer of correctAnswers) {
        if (!studentSet.has(answer)) {
            return { autoScore: 0, needsManualGrading: false };
        }
    }

    return { autoScore: points, needsManualGrading: false };
}

function gradeTrueFalse(
    studentAnswer: string,
    correctAnswer: string,
    points: number
): GradingResult {
    const isCorrect = studentAnswer?.toLowerCase() === correctAnswer?.toLowerCase();
    return { autoScore: isCorrect ? points : 0, needsManualGrading: false };
}

function gradeShortAnswer(
    studentAnswer: string,
    correctAnswer: string,
    points: number,
    caseInsensitive = true
): GradingResult {
    if (!studentAnswer || !correctAnswer) {
        return { autoScore: 0, needsManualGrading: false };
    }

    let student = studentAnswer.trim();
    let correct = correctAnswer.trim();

    if (caseInsensitive) {
        student = student.toLowerCase();
        correct = correct.toLowerCase();
    }

    return {
        autoScore: student === correct ? points : 0,
        needsManualGrading: false,
    };
}

function gradeNumerical(
    studentAnswer: number,
    correctAnswer: number,
    points: number
): GradingResult {
    const isCorrect = Math.abs(studentAnswer - correctAnswer) < 0.01;
    return { autoScore: isCorrect ? points : 0, needsManualGrading: false };
}
