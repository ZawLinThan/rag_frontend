import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import {
  OverviewHero,
  OverviewPracticePanels,
  OverviewTotals,
} from "../components/OverviewSections";
import { OverviewCoursesSkeleton } from "../skeletons";
import { studyQueries, useStudyData } from "../hooks/useStudyQueries";
import QueryState from "../components/QueryState";

import { useAuthStore } from "../stores/authStore";
import CourseCardGrid from "../components/CourseCardGrid";
import PageHeading from "../components/PageHeading";
import { useQuery } from "@tanstack/react-query";

const OverviewPage = () => {
  const data = useStudyData();
  const { courses, notebooks, documents } = data;
  const sets = useQuery(studyQueries.sets());
  const tests = useQuery(studyQueries.tests());
  const { user } = useAuthStore();

  return (
    <div className="overview-page">
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
      <OverviewHero />
      <QueryState
        error={sets.error ?? tests.error}
        retry={() => Promise.all([sets.refetch(), tests.refetch()])}
      />
      <OverviewTotals
        courses={data.isPending || data.error ? undefined : courses.length}
        documents={data.isPending || data.error ? undefined : documents.length}
        decks={sets.isError ? undefined : sets.data?.length}
        tests={tests.isError ? undefined : tests.data?.length}
      />
      <QueryState
        pending={data.isPending}
        skeleton={<OverviewCoursesSkeleton />}
        error={data.error}
        retry={data.refetch}
      />
      {!data.isPending && !data.error && (
        <section
          className="overview-courses"
          aria-labelledby="overview-courses-heading"
        >
          <div className="section-heading">
            <h2 id="overview-courses-heading">
              Your courses <span>{courses.length}</span>
            </h2>
            <Link to="/courses">
              View all courses <ArrowRight size={16} />
            </Link>
          </div>
          {courses.length ? (
            <CourseCardGrid
              courses={courses}
              documents={documents}
              notebooks={notebooks}
              limit={3}
            />
          ) : (
            <p className="panel empty">
              No courses yet. Open My courses to get started.
            </p>
          )}
        </section>
      )}
      <OverviewPracticePanels />
    </div>
  );
};

export default OverviewPage;
