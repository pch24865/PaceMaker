import {z} from "zod";

export const signUpSchema = z.object({
    body: z.object({
        email: z.string("이메일을 입력해주세요").email("이메일 형식이 아닙니다."),
        password: z.string("비밀번호를 입력해주세요").min(6, "비밀번호는 최소 6자 이상이어야 합니다."),
        name: z.string("이름을 입력해주세요").min(2, "이름은 최소 2자 이상이어야 합니다."),
    }),
});