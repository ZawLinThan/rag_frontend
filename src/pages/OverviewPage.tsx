import { Link } from "react-router-dom";
import {
  ArrowRight,
  Plus,
  Sparkles,
  Layers,
  ListChecks,
  Files,
  GraduationCap,
  ArrowUpRight,
} from "lucide-react";
import { studyQueries, useStudyData } from "../hooks/useStudyQueries";
import QueryState from "../components/QueryState";

import { useAuthStore } from "../stores/authStore";
import CourseCard from "../components/CourseCard";
import PageHeading from "../components/PageHeading";
import { useQuery } from "@tanstack/react-query";

const OverviewPage = () => {
  const data = useStudyData();
  const { courses, notebooks, documents } = data;
  const sets = useQuery(studyQueries.sets());
  const tests = useQuery(studyQueries.tests());
  const { user } = useAuthStore();

  return (
    <>
      <PageHeading
        title={`Welcome back, ${user?.user_metadata.full_name || "Student"}!`}
        description="Pick up where you left off, or discover something new."
        action={
          <Link className="button primary" to="/documents">
            <Plus size={17} />
            Upload notes
          </Link>
        }
      />
      <QueryState
        pending={data.isPending}
        error={data.error}
        retry={data.refetch}
      />
      <section className="hero-panel">
        <div>
          <span className="hero-label">
            <Sparkles size={15} />
            YOUR PERSONAL STUDY COMPANION
          </span>
          <h2>
            Less searching.
            <br />
            More understanding.
          </h2>
          <p>
            Turn your course notes into clear answers, useful flashcards,
            <br className="desktop-break" /> and moments that make it all click.
          </p>
          <Link className="button primary" to="/chat">
            Ask your study assistant <ArrowRight size={17} />
          </Link>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="floating-tag tag-one">
            <Sparkles size={16} />
            Connect the dots
          </div>
          <div className="paper back-paper" />
          <div className="paper front-paper">
            <span className="paper-icon">
              <GraduationCap size={28} />
            </span>
            <strong>Aha, now I get it.</strong>
            <div className="paper-line" />
            <div className="paper-line short" />
            <div className="paper-highlight">
              A little clarity goes a long way.
            </div>
          </div>
          <div className="floating-tag tag-two">
            <span className="check-dot">✓</span>Grounded in your notes
          </div>
        </div>
      </section>
      <div className="stats-grid">
        {[
          {
            icon: GraduationCap,
            value: (courses ?? []).length,
            label: "Active courses",
          },
          {
            icon: Files,
            value: (documents ?? []).length,
            label: "Study documents",
          },
          {
            icon: Layers,
            value: sets.data?.length ?? 0,
            label: "Flashcard decks",
          },
          {
            icon: ListChecks,
            value: tests.data?.length ?? 0,
            label: "Generated tests",
          },
        ].map(({ icon: Icon, value, label }) => (
          <div className="stat" key={label}>
            <span>
              <Icon size={21} />
            </span>
            <div>
              <strong>{value}</strong>
              <p>{label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="section-heading">
        <h2>
          Your courses <span>{(courses ?? []).length}</span>
        </h2>
        <Link to="/courses">
          View all courses <ArrowRight size={16} />
        </Link>
      </div>
      <div className="course-grid">
        {(courses ?? []).slice(0, 3).map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            documentCount={
              documents.filter((document) => document.courseId === course.id)
                .length
            }
            notebookCount={
              notebooks.filter((notebook) => notebook.courseId === course.id)
                .length
            }
          />
        ))}
      </div>
      <div className="dashboard-bottom">
        <section className="panel">
          <div className="section-heading">
            <h2>Ready for a little practice?</h2>
            <Layers size={20} />
          </div>
          <p>
            Make what you’ve learned stick. Review a few cards or put your
            knowledge to the test.
          </p>
          <div className="inline-actions">
            <Link className="button" to="/flashcards">
              Review flashcards <ArrowRight size={16} />
            </Link>
            <Link className="text-link" to="/tests">
              Create a test <ArrowUpRight size={15} />
            </Link>
          </div>
        </section>
        <section className="panel tip-panel">
          <span className="eyebrow">THE STUDY CORNER</span>
          <h3>Recall it. Don’t just reread it.</h3>
          <p>
            Close your notes and explain an idea in your own words. Retrieval
            practice helps build lasting memories.
          </p>
          <span className="tip-source">
            A small habit. A lasting difference.
          </span>
        </section>
      </div>
    </>
  );
};

export default OverviewPage;
