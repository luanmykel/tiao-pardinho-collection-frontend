// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/vitest";

vi.mock("@/api", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    getToken: vi.fn(() => null),
    onAuthChange: vi.fn(() => () => {}),
  };
});

import { AdminLayout } from "./AdminLayout";

describe("AdminLayout (guard)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("redireciona para /login quando não há token", async () => {
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<div>LOGIN</div>} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<div>__OUTLET__</div>} />
        </Route>
      </Routes>,
      { route: "/admin" },
    );

    await waitFor(() => expect(screen.getByText("LOGIN")).toBeInTheDocument());

    expect(screen.queryByText("__OUTLET__")).not.toBeInTheDocument();
  });
});
