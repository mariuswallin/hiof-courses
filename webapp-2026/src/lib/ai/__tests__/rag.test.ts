// src/lib/ai/__tests__/rag.test.ts — semantic search and RAG.
//
// We test *our own handling* of the AI step: that missing bindings degrade
// gracefully, that errors do not fail the write, and that context actually
// ends up in the prompt. Not the model's quality — that is not deterministic.
import { describe, it, expect, vi } from "vitest";
import {
  indexPost,
  querySimilarPostIds,
  generateRagAnswer,
  type RagEnv,
} from "@/lib/ai/rag";

const post = { id: "p1", text: "Regn i Halden i dag", authorId: "u1" };

function fakeEnv(overrides: Partial<RagEnv> = {}): RagEnv {
  return {
    AI: {
      run: vi.fn(async () => ({ data: [[0.1, 0.2, 0.3]], response: "Et svar" })),
    },
    VECTORIZE: {
      upsert: vi.fn(async () => ({ count: 1 })),
      query: vi.fn(async () => ({ matches: [{ id: "p1", score: 0.9 }] })),
    },
    ...overrides,
  };
}

describe("indexPost", () => {
  it("indekserer innlegget når bindingene finnes", async () => {
    const env = fakeEnv();

    await expect(indexPost(env, post)).resolves.toBe(true);
    expect(env.VECTORIZE!.upsert).toHaveBeenCalledWith([
      { id: "p1", values: [0.1, 0.2, 0.3], metadata: { authorId: "u1" } },
    ]);
  });

  it("hopper over uten å kaste når Vectorize mangler (lokal utvikling)", async () => {
    const env = fakeEnv({ VECTORIZE: undefined });

    await expect(indexPost(env, post)).resolves.toBe(false);
  });

  it("svelger feil fra AI-kallet — indeksering skal aldri velte skrivingen", async () => {
    const env = fakeEnv();
    vi.mocked(env.AI!.run).mockRejectedValue(new Error("Workers AI nede"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(indexPost(env, post)).resolves.toBe(false);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe("querySimilarPostIds", () => {
  it("returnerer id-er med score", async () => {
    const env = fakeEnv();

    const hits = await querySimilarPostIds(env, "vær", 3);

    expect(hits).toEqual([{ id: "p1", score: 0.9 }]);
    expect(env.VECTORIZE!.query).toHaveBeenCalledWith([0.1, 0.2, 0.3], {
      topK: 3,
      returnMetadata: "all",
    });
  });

  it("gir tom liste når bindingene mangler", async () => {
    await expect(querySimilarPostIds({}, "vær")).resolves.toEqual([]);
  });
});

describe("generateRagAnswer", () => {
  it("legger de hentede innleggene i systemprompten", async () => {
    const env = fakeEnv();

    const answer = await generateRagAnswer(env, "Hvordan er været?", [
      { username: "kari", name: "Kari", text: "Regn i Halden" },
    ]);

    expect(answer).toBe("Et svar");
    const [, input] = vi.mocked(env.AI!.run).mock.calls[0]!;
    const system = (input.messages as { role: string; content: string }[])[0]!;
    expect(system.content).toContain('@kari: "Regn i Halden"');
    // The model must answer ONLY from the context — the instruction has to be there.
    expect(system.content).toMatch(/KUN/);
  });

  it("degraderer pent uten AI-binding", async () => {
    await expect(generateRagAnswer({}, "Hva skjer?", [])).resolves.toMatch(
      /ikke tilgjengelig/i,
    );
  });
});
