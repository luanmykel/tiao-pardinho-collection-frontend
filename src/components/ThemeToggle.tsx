import { ActionIcon, useMantineColorScheme, Portal } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useEffect } from "react";

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  function toggle() {
    const next = dark ? "light" : "dark";
    setColorScheme(next);
    localStorage.setItem("color-scheme", next);
    document.documentElement.setAttribute("data-bs-theme", next);
  }

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", colorScheme);
  }, [colorScheme]);

  return (
    <Portal>
      <ActionIcon
        onClick={toggle}
        variant="light"
        size="lg"
        radius="xl"
        style={{ position: "fixed", top: 16, right: 12, zIndex: 10000 }}
      >
        {dark ? <IconSun size={20} /> : <IconMoon size={20} />}
      </ActionIcon>
    </Portal>
  );
}
