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
  Rss
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

type View = "dashboard" | "articles" | "new-article" | "tags" | "verticals" | "feeds-syndicator" | "settings-general" | "settings-analytics" | "settings-sitemaps" | "settings-robots";

interface AdminSidebarProps {
  currentView: View;
  onViewChange: (view: View, verticalSlug?: string) => void;
}

const AdminSidebar = ({ currentView, onViewChange }: AdminSidebarProps) => {
  const isArticlesSection = ["articles", "new-article", "tags", "verticals"].includes(currentView);
  const isSettingsSection = ["settings-general", "settings-analytics", "settings-sitemaps", "settings-robots"].includes(currentView);

  return (
    <Sidebar className="border-r border-border">
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onViewChange("dashboard")}
                  isActive={currentView === "dashboard"}
                  className="w-full"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Articles with sub-menu */}
              <Collapsible defaultOpen={isArticlesSection} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className="w-full"
                      isActive={isArticlesSection}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Articles</span>
                      <ChevronDown className="ml-auto w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => onViewChange("articles")}
                          isActive={currentView === "articles"}
                        >
                          <FileText className="w-3 h-3" />
                          <span>All Articles</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => onViewChange("new-article")}
                          isActive={currentView === "new-article"}
                        >
                          <Plus className="w-3 h-3" />
                          <span>New Article</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => onViewChange("tags")}
                          isActive={currentView === "tags"}
                        >
                          <Tags className="w-3 h-3" />
                          <span>Tags</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => onViewChange("verticals")}
                          isActive={currentView === "verticals"}
                        >
                          <Layers className="w-3 h-3" />
                          <span>Verticals</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Feeds Syndicator */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onViewChange("feeds-syndicator")}
                  isActive={currentView === "feeds-syndicator"}
                  className="w-full"
                >
                  <Rss className="w-4 h-4" />
                  <span>Feeds Syndicator</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Users - coming soon */}
              <SidebarMenuItem>
                <SidebarMenuButton disabled className="w-full opacity-50">
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Settings with sub-menu */}
              <Collapsible defaultOpen={isSettingsSection} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className="w-full"
                      isActive={isSettingsSection}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                      <ChevronDown className="ml-auto w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => onViewChange("settings-general")}
                          isActive={currentView === "settings-general"}
                        >
                          <Globe className="w-3 h-3" />
                          <span>General</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => onViewChange("settings-analytics")}
                          isActive={currentView === "settings-analytics"}
                        >
                          <BarChart3 className="w-3 h-3" />
                          <span>Analytics</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => onViewChange("settings-sitemaps")}
                          isActive={currentView === "settings-sitemaps"}
                        >
                          <Map className="w-3 h-3" />
                          <span>Sitemaps</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => onViewChange("settings-robots")}
                          isActive={currentView === "settings-robots"}
                        >
                          <Bot className="w-3 h-3" />
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
