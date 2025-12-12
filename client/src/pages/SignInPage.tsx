import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { signin } from "@/lib/api";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";

const signInSchema = z.object({
    email: z.string().min(1, { message: "이메일을 입력해주세요." }).email({ message: "이메일이 올바르지 않습니다." }),
    password: z.string().min(1, { message: "비밀번호를 입력해주세요." }),
})
type SignInSchema = z.infer<typeof signInSchema>;

export default function SignInPage() {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const { setUser } = useAuth();

    const form = useForm<SignInSchema>({
        resolver: zodResolver(signInSchema),
        mode: "onSubmit",
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const { isSubmitting } = form.formState;

    const onSubmit = async (data: SignInSchema) => {
        try {
            const res = await signin(data);
            toast("로그인 성공", { description: `${res.user.name}님 환영합니다.` });
            setUser(res.user);
            navigate("/");
        } catch (error: any) {
            if (error.response) {
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
                    <CardTitle className="text-center text-2xl">로그인</CardTitle>
                    <CardDescription className="text-center text-sm">로그인하여 스터디를 시작하세요.</CardDescription>
                    <CardDescription className="text-center text-destructive text-md">{error}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="relative">
                                        <FormLabel>이메일</FormLabel>
                                        <FormControl>
                                            <Input autoComplete="email" placeholder="이메일을 입력해주세요." {...field} />
                                        </FormControl>
                                        <FormMessage className="absolute right-0 bottom-10 mt-1" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="relative">
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
                            <Button type="submit" className="w-full mt-8" disabled={isSubmitting}>{isSubmitting ? <><Spinner className="size-4" /> 로그인 중..</> : "로그인"}</Button>
                        </form>
                    </Form>

                </CardContent>
                <CardFooter className="flex items-center justify-center">
                    <Label>아직 계정이 없으신가요?</Label>
                    <Button variant="link" className="text-md" asChild><Link to={"/signup"}>회원가입</Link></Button>
                </CardFooter>
            </Card>
        </div>
    )
}