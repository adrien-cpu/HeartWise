import {Button} from '@/components/ui/button';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {Icons} from "@/components/icons";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";

export default function Home() {
  return (
    <>
      <Sidebar className="bg-gray-100">
        <SidebarHeader>
          <div className="space-y-2">
            <h1 className="text-lg font-semibold">HeartWise</h1>
            <p className="text-sm text-gray-500">Your health, our priority</p>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Features</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/geolocation-meeting">
                  <SidebarMenuButton>
                    <Icons.home className="mr-2 h-4 w-4"/>
                    <span>Geolocation Meeting</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/facial-analysis-matching">
                  <SidebarMenuButton>
                    <Icons.user className="mr-2 h-4 w-4"/>
                    <span>Facial Analysis &amp; Matching</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/ai-conversation-coach">
                  <SidebarMenuButton>
                    <Icons.messageSquare className="mr-2 h-4 w-4"/>
                    <span>AI Conversation Coach</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/blind-exchange-mode">
                  <SidebarMenuButton>
                    <Icons.shield className="mr-2 h-4 w-4"/>
                    <span>Blind Exchange Mode</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator/>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex h-8 w-full items-center justify-between rounded-md">
                <Avatar className="mr-2 h-6 w-6">
                  <AvatarImage src="https://picsum.photos/50/50" alt="Avatar"/>
                  <AvatarFallback>CM</AvatarFallback>
                </Avatar>
                <span>My Account</span>
                <Icons.chevronDown className="ml-2 h-4 w-4 opacity-50"/>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator/>
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <main className="flex flex-col items-center justify-center min-h-screen p-8 ml-64">
        <h1 className="text-4xl font-bold mb-4">HeartWise App Dashboard</h1>
        <p className="text-lg mb-8">Explore the core features and services:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/geolocation-meeting">
            <Button className="w-full">Geolocation Meeting</Button>
          </Link>
          <Link href="/facial-analysis-matching">
            <Button className="w-full">Facial Analysis &amp; Matching</Button>
          </Link>
          <Link href="/ai-conversation-coach">
            <Button className="w-full">AI Conversation Coach</Button>
          </Link>
          <Link href="/blind-exchange-mode">
            <Button className="w-full">Blind Exchange Mode</Button>
          </Link>
        </div>
      </main>
    </>
  );
}
