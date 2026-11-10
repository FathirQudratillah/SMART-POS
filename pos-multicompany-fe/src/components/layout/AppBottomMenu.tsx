import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Store,
  UserRound,
  X,
} from "lucide-react";

import { navigation } from "@/enums/menu";
import type { AppBottomMenuProps } from "@/types";



function isPathActive(pathname: string, url?: string) {
  if (!url) return false;
  return pathname === url || pathname.startsWith(`${url}/`);
}

function hasAnyPermission(userPermissions: string[], required?: string[]) {
  return !required?.length || required.some((permission) => userPermissions.includes(permission));
}

export function AppBottomMenu({
  userId = 0,
  isSuperAdmin = false,
  userName = "Administrator",
  userEmail = "admin@example.com",
  userCompany = "SMART POS",
  userBranch = "NEXPOS",
  permissions = [],
  onLogout,
  className = "md:hidden",
}: AppBottomMenuProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const visibleNavigation = navigation
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) => {
          const children = item.children?.filter((child) =>
            hasAnyPermission(permissions, child.permissions),
          );
          return {
            ...item,
            children,
          };
        })
        .filter((item) => {
          if (item.children) return item.children.length > 0;
          return hasAnyPermission(permissions, item.permissions);
        }),
    }))
    .filter((group) => group.items.length > 0);

  const [openPath, setOpenPath] = useState<string | null>(null);
  const [folder, setFolder] = useState<string | null>(null);
  const open = openPath === pathname;

  const closeMenu = () => {
    setOpenPath(null);
    setFolder(null);
  };

  const activeFolder = folder
    ? visibleNavigation
        .flatMap((group) => group.items)
        .find((item) => item.title === folder && item.children)
    : undefined;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (folder) setFolder(null);
      else {
        setOpenPath(null);
        setFolder(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, folder]);

  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const tabIndex = open ? 0 : -1;

  return (
    <div className={className}>
      <div
        aria-hidden="true"
        onClick={closeMenu}
        className={[
          "fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <div
        id="app-bottom-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
        aria-hidden={!open}
        className={[
          "fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-3xl border-t border-white/10",
          "sm:inset-x-auto sm:bottom-5 sm:right-5 sm:max-h-[min(85dvh,44rem)] sm:w-104 sm:rounded-3xl sm:border",
          "bg-[#0B1739] text-slate-200 shadow-2xl shadow-black/50",
          "transition-[transform,visibility] duration-300 ease-out motion-reduce:transition-none",
          open ? "visible translate-y-0" : "invisible translate-y-full",
        ].join(" ")}
      >
        <div className="shrink-0 px-5 pb-3 pt-2.5">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />

          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-950/40">
              <Store className="size-5" />
            </div>

            <div className="grid min-w-0 flex-1 leading-tight">
              <span className="truncate text-base uppercase font-bold tracking-wider text-white">
                {userBranch}
              </span>
              <span className="truncate text-[10px] tracking-[0.18em] text-blue-200/70">
                {userCompany}
              </span>
            </div>

            <button
              type="button"
              onClick={closeMenu}
              aria-label="Tutup menu"
              tabIndex={tabIndex}
              className="flex size-9 items-center justify-center rounded-full bg-white/[0.07] text-slate-300 transition hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-blue-400"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar overscroll-contain border-t border-white/10 px-5 pb-4">
          {activeFolder?.children ? (
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setFolder(null)}
                tabIndex={tabIndex}
                className="mb-4 flex items-center gap-2 rounded-full bg-white/[0.07] py-1.5 pl-2 pr-4 text-sm font-medium text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-blue-400"
              >
                <ChevronLeft className="size-4.5" />
                <activeFolder.icon className="size-4.5 text-blue-300" />
                {activeFolder.title}
              </button>

              <ul className="space-y-2">
                {activeFolder.children.map((child) => {
                  const active = isPathActive(pathname, child.url);

                  return (
                    <li key={child.url}>
                      <NavLink
                        to={child.url}
                        end
                        tabIndex={tabIndex}
                        className={[
                          "flex h-12 items-center justify-between rounded-2xl px-4 text-sm transition",
                          "focus-visible:outline-2 focus-visible:outline-blue-400",
                          active
                            ? "bg-blue-500 font-semibold text-white shadow-md shadow-blue-950/30"
                            : "bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white",
                        ].join(" ")}
                      >
                        {child.title}
                        <ChevronRight
                          className={`size-4 ${active ? "text-white" : "text-slate-500"}`}
                        />
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            visibleNavigation.map((group) => (
              <section key={group.title} className="pt-4">
                <h3 className="mb-3 text-[10px] font-semibold tracking-[0.16em] text-slate-500">
                  {group.title}
                </h3>

                <ul className="grid grid-cols-4 gap-x-2 gap-y-4">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const hasChildren = Boolean(item.children);

                    const itemIsActive = item.url
                      ? isPathActive(pathname, item.url)
                      : (item.children?.some((child) =>
                          isPathActive(pathname, child.url),
                        ) ?? false);

                    const tile = (
                      <>
                        <span
                          className={[
                            "relative flex size-14 items-center justify-center rounded-2xl transition",
                            "group-active:scale-90 motion-reduce:transition-none",
                            itemIsActive
                              ? "bg-blue-500 text-white shadow-lg shadow-blue-950/40"
                              : "bg-white/[0.07] text-slate-300 group-hover:bg-white/15 group-hover:text-white",
                          ].join(" ")}
                        >
                          <Icon className="size-6" />

                          {hasChildren && (
                            <span
                              aria-hidden="true"
                              className={[
                                "absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-[#0B1739]",
                                itemIsActive
                                  ? "bg-blue-200 text-blue-700"
                                  : "bg-slate-600 text-slate-200",
                              ].join(" ")}
                            >
                              <ChevronRight className="size-3" />
                            </span>
                          )}
                        </span>

                        <span
                          className={[
                            "line-clamp-2 w-full text-center text-[11px] leading-tight",
                            itemIsActive
                              ? "font-semibold text-white"
                              : "text-slate-400 group-hover:text-white",
                          ].join(" ")}
                        >
                          {item.title}
                        </span>
                      </>
                    );

                    const tileClass =
                      "group flex w-full flex-col items-center gap-2 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400";

                    return (
                      <li key={item.title} className="flex justify-center">
                        {hasChildren ? (
                          <button
                            type="button"
                            onClick={() => setFolder(item.title)}
                            tabIndex={tabIndex}
                            aria-haspopup="true"
                            className={tileClass}
                          >
                            {tile}
                          </button>
                        ) : (
                          <NavLink
                            to={item.url!}
                            end
                            tabIndex={tabIndex}
                            className={tileClass}
                          >
                            {tile}
                          </NavLink>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </nav>

        <div className="shrink-0 border-t border-white/10 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-blue-300/20 bg-blue-400/15 text-sm font-bold text-blue-200">
              {initials}
            </div>

            <div className="grid min-w-0 flex-1 leading-tight">
              <span className="truncate text-sm font-medium text-white">
                {userName}
              </span>
              <span className="truncate text-[11px] text-slate-400">
                {userEmail}
              </span>
            </div>

            <button
              type="button"
              tabIndex={tabIndex}
              onClick={() => {
                closeMenu();
                navigate(isSuperAdmin ? `/admin/users/${userId}` : `/users/${userId}`)
              }}
              aria-label="My Profile"
              className="flex size-9 items-center justify-center rounded-full bg-white/[0.07] text-slate-300 transition hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-blue-400"
            >
              <UserRound className="size-4.5" />
            </button>

            <button
              type="button"
              tabIndex={tabIndex}
              onClick={() => onLogout?.()}
              aria-label="Sign Out"
              className="flex size-9 items-center justify-center rounded-full bg-red-500/10 text-red-300 transition hover:bg-red-500/20 focus-visible:outline-2 focus-visible:outline-red-300"
            >
              <LogOut className="size-4.5" />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          if (open) closeMenu();
          else {
            setFolder(null);
            setOpenPath(pathname);
          }
        }}
        aria-label={open ? "Tutup menu" : "Buka menu"}
        aria-expanded={open}
        aria-controls="app-bottom-menu"
        className={[
          "fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-49 flex size-14 items-center justify-center rounded-full",
          "bg-blue-500 text-white shadow-lg shadow-blue-950/50 transition duration-300 motion-reduce:transition-none",
          "hover:bg-blue-400 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300",
          open ? "pointer-events-none scale-75 opacity-0" : "",
        ].join(" ")}
      >
        <Menu className="size-6" />
      </button>
    </div>
  );
}
