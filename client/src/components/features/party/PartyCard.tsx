import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, User } from "lucide-react"

interface PartyUser {
    name: string;
}

export interface Party {
    _id: string;
    userId: PartyUser;
    title: string;
    category: string;
    content: string;
    tag: string[];
    startDate: string;
    maximumCapacity: number;
    participants: PartyUser[];
    requiresApproval: boolean;
    isOffline: boolean;
    locate: string;
    createdAt: string;
}

interface PartyCardProps {
    party: Party;
}

export function PartyCard({ party }: PartyCardProps) {
    // 상태 계산
    const currentMembers = party.participants.length;
    const isRecruiting = currentMembers < party.maximumCapacity;

    // 날짜 포맷팅
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    return (
        <Card className="hover:bg-accent hover:scale-102 transition-all duration-200 cursor-pointer flex flex-col w-full h-80">
            <CardHeader className="px-5">
                {/* 상단: 뱃지 및 인원수 */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2 flex-wrap">
                        <Badge variant={isRecruiting ? "default" : "secondary"}>
                            {isRecruiting ? "모집중" : "모집마감"}
                        </Badge>

                        {/* 카테고리는 외곽선 스타일(outline) 또는 secondary 추천 */}
                        <Badge variant="outline" className="font-normal">
                            {party.category}
                        </Badge>
                    </div>

                    <div className="flex items-center text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md">
                        <Users size={14} className="mr-1" />
                        <span>{currentMembers}/{party.maximumCapacity}</span>
                    </div>
                </div>

                {/* 제목 */}
                <h3 className="font-bold text-lg leading-tight line-clamp-1 mb-1">
                    {party.title}
                </h3>

                {/* 작성자 */}
                <div className="flex items-center text-sm text-muted-foreground">
                    <User size={14} className="mr-1" />
                    <span>{party.userId.name}</span>
                </div>
            </CardHeader>

            <CardContent className="p-5 pt-0 flex-grow">
                {/* 본문 내용 */}
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] mb-4 leading-relaxed">
                    {party.content}
                </p>

                {/* 날짜 및 장소 */}
                <div className="flex flex-col gap-2 text-sm text-muted-foreground mt-auto">
                    <div className="flex items-center gap-2">
                        <Calendar size={15} />
                        <span className="font-medium">{formatDate(party.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin size={15} />
                        <span className="font-medium">
                            {party.isOffline ? party.locate : "온라인"}
                        </span>
                    </div>
                </div>
                {/* 태그 목록 */}
                <div className="mt-5">
                    {party.tag.map((t, index) => (
                        <Badge
                            key={`${party._id}-tag-${index}`}
                            variant="secondary" // secondary 테마 사용
                            className="font-normal"
                        >
                            #{t}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}