import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/contexts/ThemeProvider"
import UserButton from "@/components/features/user/UserButton"
import { Link } from "react-router-dom"
import { useState } from "react"
import { Button } from "../ui/button"

export const Navigation = () => {
    const [isHidden, setIsHidden] = useState(false);
    const [isFullyHidden, setIsFullyHidden] = useState(false);
    const { setTheme } = useTheme();

    const handleHide = () => {
        setIsHidden(true);
        setTimeout(() => {
            setIsFullyHidden(true);
        }, 300); // duration-300과 일치해야 함
    };

    if (isFullyHidden) return null; // 아예 렌더링 안 함 (또는 hidden 클래스 사용)

    return (
        <div className="bg-sidebar">
            <div className={`max-w-7xl mx-auto flex h-16 w-full items-center  ${isHidden ? "-translate-y-16 duration-300" : "translate-y-0 duration-300"}`}>
                <Link to="/">
                    <Label className="text-primary text-2xl ml-8 mr-4 cursor-pointer">PaceMaker</Label>
                </Link>
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link to="/note" className="px-4">노트</Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link to="/party" className="px-4">파티</Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="bg-transparent">목표 설정</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <Button onClick={handleHide}>숨기기</Button>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
                <div className="ml-auto mr-4">
                    <UserButton />
                </div>
                <div className="ml-2 mr-8">
                    <div className="flex items-center space-x-2">
                        <Switch id="theme" onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} defaultChecked={true} />
                        <Label htmlFor="theme">다크 모드</Label>
                    </div>
                </div>
            </div>
        </div>
    )
}