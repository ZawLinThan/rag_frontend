import { useState } from "react";
import { CheckCircle2, ListChecks, RotateCcw, ArrowRight } from "lucide-react";
import { studyCards } from "../data/sampleData";
import { useWorkspace } from "../hooks/useWorkspace";
import PageHeading from "../components/PageHeading";

const QuizzesPage = () => {
  const { courses } = useWorkspace();
  const [course, setCourse] = useState("");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const questions = studyCards.filter((c) => !course || c.courseId === course);
  const question = questions[index];
  const reset = () => {
    setIndex(0);
    setSelected("");
    setChecked(false);
    setScore(0);
  };
  return (
    <>
      <PageHeading
        title="Practice quizzes"
        description="Check your knowledge in a calm, low-pressure space."
      />
      <div className="study-toolbar">
        <label>
          Course
          <select
            value={course}
            onChange={(e) => {
              setCourse(e.target.value);
              reset();
            }}
          >
            <option value="">All sample courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <span className="muted">
          {questions.length} sample questions · Untimed
        </span>
      </div>
      {question ? (
        <section className="panel quiz-panel">
          <span className="eyebrow">
            QUESTION {index + 1} OF {questions.length}
          </span>
          <progress value={index} max={questions.length} />
          <h2>{question.question}</h2>
          <div className="quiz-options">
            {question.options.map((option, i) => (
              <button
                key={option}
                disabled={checked}
                className={`quiz-option ${selected === option ? "selected" : ""} ${checked && option === question.answer ? "correct" : ""} ${checked && selected === option && option !== question.answer ? "incorrect" : ""}`}
                onClick={() => setSelected(option)}
              >
                <span>{String.fromCharCode(65 + i)}</span>
                {option}
                {checked && option === question.answer && (
                  <CheckCircle2 size={18} />
                )}
              </button>
            ))}
          </div>
          {checked && (
            <div className="notice" role="status">
              <strong>
                {selected === question.answer
                  ? "You’ve got it!"
                  : "Keep going — this is how learning happens."}
              </strong>
              <p>{question.answer}</p>
            </div>
          )}
          <button
            className="button primary"
            disabled={!selected}
            onClick={() => {
              if (!checked) {
                setChecked(true);
                if (selected === question.answer) setScore(score + 1);
              } else {
                setIndex(index + 1);
                setSelected("");
                setChecked(false);
              }
            }}
          >
            {checked ? "Next question" : "Check answer"}
            <ArrowRight size={16} />
          </button>
        </section>
      ) : (
        <section className="panel completion">
          <ListChecks size={36} />
          <h2>
            {questions.length
              ? "Practice complete."
              : "No sample quiz available."}
          </h2>
          <p>
            {questions.length
              ? `You answered ${score} of ${questions.length} questions correctly. Every attempt is progress.`
              : "Choose one of the sample courses to practice."}
          </p>
          <button className="button primary" onClick={reset}>
            <RotateCcw size={16} />
            Try again
          </button>
        </section>
      )}
    </>
  );
};

export default QuizzesPage;
