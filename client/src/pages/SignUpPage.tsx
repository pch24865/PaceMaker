import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useState } from "react";
import { signup } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const signUpSchema = z.object({
    email: z.string().min(1, { message: "이메일을 입력해주세요." }).email({ message: "이메일이 올바르지 않습니다." }),
    password: z.string().min(1, { message: "비밀번호를 입력해주세요." }).min(8, { message: "비밀번호는 8자 이상이어야 합니다." }),
    passwordConfirm: z.string().min(1, { message: "비밀번호를 입력해주세요." }),
    name: z.string().min(1, { message: "이름을 입력해주세요." }).max(10, { message: "이름은 10자 이하로 입력해주세요." }),
}).refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
});
type SignUpSchema = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    const form = useForm<SignUpSchema>({
        resolver: zodResolver(signUpSchema),
        mode: "onSubmit",
        defaultValues: {
            email: "",
            password: "",
            passwordConfirm: "",
            name: "",
        },
    });

    const { isSubmitting } = form.formState;

    const onSubmit = async (data: SignUpSchema) => {
        try {
            await signup(data);
            toast("회원가입이 완료되었습니다.");
            navigate("/signin");
        } catch (error) {
            if (axios.isAxiosError(error) && error.status === 409) {
                form.setError("email", {
                    type: "manual",
                    message: "이미 사용 중인 이메일입니다."
                }, { shouldFocus: true });
            }
            else if (axios.isAxiosError(error) && error.response?.data.message) {
                setError(error.response.data.message);
            }
            else {
                setError("오류가 발생하였습니다. 잠시 후 다시 시도해주세요.");
            }
        }
    }

    return (
        <div className="flex h-full items-center justify-center">
            <Card className="w-full max-w-sm z-50">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">회원가입</CardTitle>
                    <CardDescription className="text-center text-destructive text-md">{error}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="relative mb-6">
                                        <FormLabel>이름</FormLabel>
                                        <FormControl>
                                            <Input placeholder="이름을 입력해주세요." {...field} />
                                        </FormControl>
                                        <FormMessage className="absolute right-0 bottom-10 mt-1" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="relative mb-6">
                                        <FormLabel>이메일</FormLabel>
                                        <FormControl>
                                            <Input placeholder="이메일을 입력해주세요." {...field} />
                                        </FormControl>
                                        <FormMessage className="absolute right-0 bottom-10 mt-1" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="relative mb-6">
                                        <FormLabel>비밀번호</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="비밀번호를 입력해주세요."
                                                {...field}
                                                autoComplete="current-password"
                                            />
                                        </FormControl>
                                        <FormMessage className="absolute right-0 bottom-10 mt-1" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="passwordConfirm"
                                render={({ field }) => (
                                    <FormItem className="relative mb-6">
                                        <FormLabel>비밀번호 확인</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="비밀번호를 다시 입력해주세요."
                                                {...field}
                                                autoComplete="current-password"
                                            />
                                        </FormControl>
                                        <FormMessage className="absolute right-0 bottom-10 mt-1" />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full mt-8" disabled={isSubmitting}>{isSubmitting ? <><Spinner className="size-4" /> 회원가입 중..</> : "회원가입"}</Button>
                        </form>
                    </Form>

                </CardContent>
                <CardFooter className="flex items-center justify-center">
                    <Label>이미 계정이 있으신가요?</Label>
                    <Button variant="link" className="text-md" asChild><Link to={"/signin"}>로그인</Link></Button>
                </CardFooter>
            </Card>
        </div>
    )
}