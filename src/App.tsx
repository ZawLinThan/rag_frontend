import { Navigate, Route, Routes } from "react-router-dom";
import LayoutPage from "./pages/LayoutPage";
import OverviewPage from "./pages/OverviewPage";
import CoursesPage from "./pages/CoursesPage";
import CoursePage from "./pages/CoursePage";
import DocumentsPage from "./pages/DocumentsPage";
import DocumentPage from "./pages/DocumentPage";
import ChatPage from "./pages/ChatPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import TestsPage from "./pages/TestsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CallbackPage from "./pages/CallbackPage";
import NotFoundPage from "./pages/NotFoundPage";
import { useAuthStore } from "./stores/authStore";
import ProtectedRoute from "./components/ProtectedRoute";
import WorkspaceProvider from "./components/WorkspaceProvider";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { studyKeys } from "./hooks/useStudyQueries";

const App = () => {
  const { initializeAuth } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    let previousUserId = useAuthStore.getState().user?.id;
    const unsubscribeIdentity = useAuthStore.subscribe((state) => {
      if (state.user?.id !== previousUserId) {
        previousUserId = state.user?.id;
        // Never reuse one account's server records after an account switch.
        queryClient.removeQueries({ queryKey: studyKeys.all });
      }
    });
    const unsubscribe = initializeAuth();
    return () => {
      unsubscribe();
      unsubscribeIdentity();
    };
  }, [initializeAuth, queryClient]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/auth/callback" element={<CallbackPage />} />
      <Route
        element={
          <ProtectedRoute>
            <WorkspaceProvider>
              <LayoutPage />
            </WorkspaceProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:courseId" element={<CoursePage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="documents/:documentId" element={<DocumentPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="flashcards" element={<FlashcardsPage />} />
        <Route path="tests" element={<TestsPage />} />
        <Route path="quizzes" element={<Navigate to="/tests" replace />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
