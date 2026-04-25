import { PartyCard } from "@/components/features/party/PartyCard";
import { PartyPagination } from "@/components/features/party/PartyPagination";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getParties } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import z from "zod";

const createPartySchema = z.object({
    title: z.string().min(6, { message: "제목의 최소길이는 6글자 입니다." }),
    categories: z.string().min(1, { message: "카테고리를 선택해주세요." }),
    content: z.string().min(6, { message: "내용의 최소길이는 6글자 입니다." }),
    maximumCapacity: z.coerce.number().min(2, { message: "최소인원은 2명 이상이어야 합니다." }),
    startDate: z.date().min(new Date(), { message: "시작일은 오늘 이후여야 합니다." }),
    requiresApproval: z.boolean().default(false),
    isOffline: z.boolean().default(true),
    location: z.string().min(6, { message: "장소의 최소길이는 6글자 입니다." }),
});

type CreatePartyFormValues = z.infer<typeof createPartySchema>;

export default function PartyPage() {
    const [parties, setParties] = useState([]);
    const [searchParams] = useSearchParams();
    const [searchText, setSearchText] = useState("");
    const [lastPage, setLastPage] = useState(0);
    const navigate = useNavigate();
    const categories = ['자율', '어학', '취업', '고시/공무원', '취미/교양', '프로그래밍', '수험', '기타'];

    const form = useForm<CreatePartyFormValues>({
        resolver: zodResolver(createPartySchema),
        defaultValues: {
            title: "",
            categories: "",
            content: "",
            maximumCapacity: 2,
            startDate: new Date(),
            requiresApproval: false,
            isOffline: true,
            location: "",
        },
    });

    const onSubmit = async (values: CreatePartyFormValues) => {
        console.log(values);
    }

    useEffect(() => {
        const fetchParties = async () => {
            const page = parseInt(searchParams.get('page') ?? '1') || 1;
            const search = searchParams.get('search') || "";
            const res = await getParties({ page, search });
            setLastPage(res.data.lastPage);
            setParties(res.data.parties);
        }
        fetchParties();
    }, [searchParams])

    const handleSearch = () => {
        navigate(`/party?page=1&search=${searchText}`);
    }

    const handlePagination = (page: number) => {
        const search = searchParams.get('search') || "";
        navigate(`/party?page=${page}&search=${search}`)
    }
    return (
        <div className="container max-w-6xl mx-auto">
            <Label className="text-4xl mt-10 mb-4">스터디 파티 모집</Label>
            <div className="flex">
                <Label className="text-2xl mb-4">함께 성장할 스터디를 멤버를 찾아보세요.</Label>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="ml-auto">모집글 올리기</Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[80vh] overflow-y-auto">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField<CreatePartyFormValues>
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>제목</FormLabel>
                                            <FormControl>
                                                <Input placeholder="제목을 입력해주세요." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField<CreatePartyFormValues>
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>내용</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="내용을 입력해주세요." {...field} className="resize-none max-h-[150px] overflow-y-auto" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField<CreatePartyFormValues>
                                    control={form.control}
                                    name="maximumCapacity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>최대인원</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="최대인원을 입력해주세요." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField<CreatePartyFormValues>
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>시작일</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="date" 
                                                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                                                    onChange={(e) => field.onChange(new Date(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField<CreatePartyFormValues>
                                    control={form.control}
                                    name="requiresApproval"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <Input 
                                                    type="checkbox" 
                                                    className="size-4"
                                                    checked={field.value}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                />
                                            </FormControl>
                                            <FormLabel>승인 필요</FormLabel>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField<CreatePartyFormValues>
                                    control={form.control}
                                    name="isOffline"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <Input 
                                                    type="checkbox" 
                                                    className="size-4"
                                                    checked={field.value}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                />
                                            </FormControl>
                                            <FormLabel>오프라인</FormLabel>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField<CreatePartyFormValues>
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>위치</FormLabel>
                                            <FormControl>
                                                <Input placeholder="위치를 입력해주세요." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">등록하기</Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="flex w-full items-center">
                <div className="relative flex-1 my-6">

                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSearch();
                    }}>
                        <Input
                            type="text"
                            placeholder="제목 또는 내용을 검색하세요."
                            className="pl-10 h-10 rounded-full w-full bg-secondary/50 border-none"
                            onChange={(e) => { setSearchText(e.target.value) }}
                        />
                    </form>
                </div>
                <Select>
                    <SelectTrigger className="w-1/5 ml-3 rounded-full">
                        <SelectValue placeholder="카테고리를 선택해주세요." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <Label className="text-12 text-muted-foreground ml-2">카테고리</Label>
                            <hr className="my-1" />
                            <SelectItem value="all">전체</SelectItem>
                            {categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {parties.map((party: any) => <PartyCard key={party._id} party={party} />)}
            </div>

            <PartyPagination currentPage={parseInt(searchParams.get('page') ?? '1') || 1} totalPages={lastPage} onPageChange={handlePagination} />
        </div>
    );
}