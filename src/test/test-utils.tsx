import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement } from "react";

type Opts = { route?: string };

export function renderWithProviders(ui: ReactElement, opts: Opts = {}) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter initialEntries={[opts.route ?? "/"]}>
      <MantineProvider>
        <QueryClientProvider client={client}>{ui}</QueryClientProvider>
      </MantineProvider>
    </MemoryRouter>,
  );
}
