import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router";

export function NavMain({ items }) {
  const { user } = useSelector((state) => state.auth);
  const userRoleId = user?.roleId;

  const filterMenuItems = (items, userRoleId) => {
    return items
      .map((item) => {
        // Clone the item to avoid mutating the original object
        const newItem = { ...item };

        // If the item has children, recursively filter them
        if (item.items && Array.isArray(item.items)) {
          newItem.items = item.items.filter(
            (child) =>
              !child.allowedRoles || child.allowedRoles.includes(userRoleId)
          );

          // If no allowed child items remain, you may want to remove the parent too (optional)
          if (newItem.collapsible && newItem.items.length === 0) {
            return null; // or return undefined
          }
        }

        // Filter out the top-level item if it's not allowed
        if (!item.allowedRoles || item.allowedRoles.includes(userRoleId)) {
          return newItem;
        }

        // If parent is not allowed but children are not collapsible (i.e., should still be visible), allow them
        if (!item.allowedRoles && newItem.items && newItem.items.length > 0) {
          return newItem;
        }

        return null;
      })
      .filter(Boolean); // Remove null/undefined items
  };

  const filteredItems = filterMenuItems(items, userRoleId);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {filteredItems.map((item) => {
          if (!item.collapsible) {
            return (
              <NavLink
                key={item.title}
                className={({ isActive }) =>
                  `rounded-md ${
                    isActive && "bg-primary text-primary-foreground"
                  }`
                }
                to={item.url}
              >
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </NavLink>
            );
          } else
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <NavLink to={subItem.url}>
                              <span>{subItem.title}</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
