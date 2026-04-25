import { z } from "zod";

export const signInSchema = z.object({
    email: z.string().email("이메일 형식이 아닙니다."),
    password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다."),
})