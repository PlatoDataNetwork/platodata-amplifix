import { 
  FileText, 
  Plus, 
  LayoutDashboard, 
  Users, 
  Settings,
  ChevronDown,
  Tags,
  Layers,
  Globe,
  BarChart3,
  Map,
  Bot,
  Rss,
  ScrollText
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type View = "dashboard" | "articles" | "new-article" | "tags" | "verticals" | "feeds-syndicator" | "new-feed" | "edit-feed" | "feeds-logs" | "settings-general" | "settings-analytics" | "settings-sitemaps" | "settings-robots";

interface AdminSidebarProps {
  currentView: View;
  onViewChange: (view: View, verticalSlug?: string) => void;
}

const AdminSidebar = ({ currentView, onViewChange }: AdminSidebarProps) => {
  const isArticlesSection = ["articles", "new-article", "tags", "verticals"].includes(currentView);
  const isFeedsSection = ["feeds-syndicator", "new-feed", "edit-feed", "feeds-logs"].includes(currentView);
  const isSettingsSection = ["settings-general", "settings-analytics", "settings-sitemaps", "settings-robots"].includes(currentView);

  return (
    <Sidebar className="border-r border-border h-[calc(100vh-65px)] top-[65px]" collapsible="icon">
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onViewChange("dashboard")}
                  isActive={currentView === "dashboard"}
                  className="w-full text-base py-3"
                >
                  <LayoutDashboard className="w-6 h-6" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Articles with sub-menu */}
              <Collapsible defaultOpen={isArticlesSection} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className="w-full text-base py-3"
                      isActive={isArticlesSection}
                    >
                      <FileText className="w-6 h-6" />
                      <span>Articles</span>
                      <ChevronDown className="ml-auto w-5 h-5 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="space-y-1 py-1">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => onViewChange("articles")}
                          isActive={currentView === "articles"}
                          className="text-sm py-2"
                        >
                          <FileText className="w-5 h-5" />
                          <span>All Articles</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => onViewChange("new-article")}
                          isActive={currentView === "new-article"}
                          className="text-sm py-2"
                        >
                          <Plus className="w-5 h-5" />
                          <span>New Article</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => onViewChange("tags")}
                          isActive={currentView === "tags"}
                          className="text-sm py-2"
                        >
                          <Tags className="w-5 h-5" />
                          <span>Tags</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => onViewChange("verticals")}
                          isActive={currentView === "verticals"}
                          className="text-sm py-2"
                        >
                          <Layers className="w-5 h-5" />
                          <span>Verticals</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Feeds with sub-menu */}
              <Collapsible defaultOpen={isFeedsSection} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className="w-full text-base py-3"
                      isActive={isFeedsSection}
                    >
                      <Rss className="w-6 h-6" />
                      <span>Feed Syndicator</span>
                      <ChevronDown className="ml-auto w-5 h-5 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="space-y-1 py-1">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => onViewChange("feeds-syndicator")}
                          isActive={currentView === "feeds-syndicator"}
                          className="text-sm py-2"
                        >
                          <Rss className="w-5 h-5" />
                          <span>All Feeds</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => onViewChange("new-feed")}
                          isActive={currentView === "new-feed"}
                          className="text-sm py-2"
                        >
                          <Plus className="w-5 h-5" />
                          <span>Add Feed</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => onViewChange("feeds-logs")}
                          isActive={currentView === "feeds-logs"}
                          className="text-sm py-2"
                        >
                          <ScrollText className="w-5 h-5" />
                          <span>Logs</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Users - coming soon */}
              <SidebarMenuItem>
                <SidebarMenuButton disabled className="w-full opacity-50 text-base py-3">
                  <Users className="w-6 h-6" />
                  <span>Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Settings with sub-menu */}
              <Collapsible defaultOpen={isSettingsSection} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className="w-full text-base py-3"
                      isActive={isSettingsSection}
                    >
                      <Settings className="w-6 h-6" />
                      <span>Settings</span>
                      <ChevronDown className="ml-auto w-5 h-5 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="space-y-1 py-1">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => onViewChange("settings-general")}
                          isActive={currentView === "settings-general"}
                          className="text-sm py-2"
                        >
                          <Globe className="w-5 h-5" />
                          <span>General</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => onViewChange("settings-analytics")}
                          isActive={currentView === "settings-analytics"}
                          className="text-sm py-2"
                        >
                          <BarChart3 className="w-5 h-5" />
                          <span>Analytics</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => onViewChange("settings-sitemaps")}
                          isActive={currentView === "settings-sitemaps"}
                          className="text-sm py-2"
                        >
                          <Map className="w-5 h-5" />
                          <span>Sitemaps</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => onViewChange("settings-robots")}
                          isActive={currentView === "settings-robots"}
                          className="text-sm py-2"
                        >
                          <Bot className="w-5 h-5" />
                          <span>Robots.txt</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
