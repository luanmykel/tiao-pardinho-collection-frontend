// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { SuggestionForm } from "./SuggestionForm";
import "@testing-library/jest-dom/vitest";

vi.mock("@/api", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    createSuggestion: vi.fn(),
  };
});

import { createSuggestion } from "@/api";

describe("SuggestionForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("envia sugestão e limpa o input", async () => {
    (createSuggestion as unknown as Mock).mockResolvedValue({ id: 1 });

    renderWithProviders(<SuggestionForm />);

    const input = screen.getByPlaceholderText(/cole aqui o link do youtube/i);
    fireEvent.change(input, {
      target: { value: "https://youtu.be/abc123xyz00" },
    });

    fireEvent.click(screen.getByRole("button", { name: /enviar/i }));

    expect(await screen.findByText(/sugestão enviada!/i)).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("exibe mensagem do backend quando a API falha", async () => {
    (createSuggestion as unknown as Mock).mockRejectedValue({
      response: { data: { message: "Mensagem do backend" } },
    });

    renderWithProviders(<SuggestionForm />);

    const input = screen.getByPlaceholderText(/cole aqui o link do youtube/i);
    fireEvent.change(input, {
      target: { value: "https://youtu.be/abc123xyz00" },
    });

    fireEvent.click(screen.getByRole("button", { name: /enviar/i }));

    expect(await screen.findByText(/mensagem do backend/i)).toBeInTheDocument();
  });
});
