export interface GameResultDto {
  isCorrect: boolean;
  correctAnswer: string;
  gameProgress: {
    previousLevel: number;
    currentLevel: number;
    leveledUp: boolean;
    totalCorrect: number;
    totalQuestions: number;
    isLevelCompleted: boolean;
  };
  userProgress: {
    experienceGained: number;
    currentExperience: number;
    previousUserLevel: number;
    currentUserLevel: number;
    userLeveledUp: boolean;
  };
}
