// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { Login } from "./Login";

vi.mock("@/api", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    getToken: vi.fn(() => null),
    doLogin: vi.fn(async () => "jwt.token.test"), // simula sucesso
  };
});

import { doLogin } from "@/api";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return { ...actual, useNavigate: vi.fn() };
});
import { useNavigate } from "react-router-dom";

describe("Login", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("faz login e navega para /admin", async () => {
    const mockNavigate = vi.fn();
    (useNavigate as unknown as Mock).mockReturnValue(mockNavigate);

    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() =>
      expect(doLogin).toHaveBeenCalledWith("admin@example.com", "secret123"),
    );

    expect(mockNavigate).toHaveBeenCalledWith("/admin", { replace: true });
  });
});
