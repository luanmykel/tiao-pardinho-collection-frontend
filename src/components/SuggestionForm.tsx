import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { TextInput, Button, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { createSuggestion } from "@/api";
import { SuggestionSuccessModal, InfoModal } from "@/components/modals";

export function SuggestionForm() {
  const [youtubeUrl, setUrl] = useState("");
  const [successOpen, successCtrl] = useDisclosure(false);
  const [infoOpen, infoCtrl] = useDisclosure(false);
  const [infoMsg, setInfoMsg] = useState<string>("");

  const m = useMutation({
    mutationFn: (payload: { youtube: string }) => createSuggestion(payload),
    onSuccess: () => {
      setUrl("");
      successCtrl.open();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        "Não foi possível enviar sua sugestão no momento.";
      setInfoMsg(msg);
      infoCtrl.open();
    },
  });

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!youtubeUrl.trim()) return;
          m.mutate({ youtube: youtubeUrl.trim() });
        }}
      >
        <Group gap="sm" align="flex-end" wrap="nowrap">
          <TextInput
            placeholder="Cole aqui o link do YouTube"
            value={youtubeUrl}
            onChange={(e) => setUrl(e.currentTarget.value)}
            disabled={m.isPending}
            size="md"
            style={{ flex: 1 }}
          />
          <Button
            type="submit"
            loading={m.isPending}
            color="brown"
            size="md"
            style={{ whiteSpace: "nowrap" }}
          >
            Enviar
          </Button>
        </Group>
      </form>

      <SuggestionSuccessModal open={successOpen} onClose={successCtrl.close} />

      <InfoModal
        open={infoOpen}
        onClose={infoCtrl.close}
        message={infoMsg}
        title="Aviso"
      />
    </>
  );
}
