import React, { useState, useEffect } from "react";

interface AppearingTextRotatorProps {
  facts: string[];
  rotateInterval: number;
  timeBetweenChars: number;
}

export const shuffleArray = (array: string[]): string[] => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

const AppearingTextRandomizer: React.FC<AppearingTextRotatorProps> = ({
  facts,
  rotateInterval,
  timeBetweenChars,
}) => {
  const [shuffledFacts] = useState(shuffleArray(facts));
  const [activeFactIndex, setActiveFactIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (displayedText === shuffledFacts[activeFactIndex]) {
      const nextIndex = (activeFactIndex + 1) % shuffledFacts.length;
      setTimeout(() => {
        setActiveFactIndex(nextIndex);
        setDisplayedText(shuffledFacts[nextIndex][0]);
      }, rotateInterval);
    } else {
      setTimeout(() => {
        setDisplayedText(
          shuffledFacts[activeFactIndex].slice(0, displayedText.length + 1)
        );
      }, timeBetweenChars);
    }
  }, [
    activeFactIndex,
    shuffledFacts,
    displayedText,
    timeBetweenChars,
    rotateInterval,
  ]);

  return <div>{displayedText}</div>;
};

export default AppearingTextRandomizer;
