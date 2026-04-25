import { z } from "zod";

export const createNoteSchema = z.object({
    body: z.object({
        title: z.string().min(1, "제목을 입력해주세요."),
        theme: z.string().optional(),
        tag: z.string().optional(),
    }),
});