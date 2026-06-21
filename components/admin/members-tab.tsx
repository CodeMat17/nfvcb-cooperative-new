"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AddMemberSheet } from "./add-member-sheet";
import { formatNaira, formatMonthYear } from "@/lib/loan-utils";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Search, UserPlus, Pencil, TrendingUp, Loader2 } from "lucide-react";

export function MembersTab() {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Id<"users"> | null>(null);
  const [contribTarget, setContribTarget] = useState<Id<"users"> | null>(null);
  const [editForm, setEditForm] = useState({ name: "", pin: "", dateJoined: "" });
  const [contribForm, setContribForm] = useState({
    monthly: "",
    total: "",
  });
  const [saving, setSaving] = useState(false);
  const [dateCalOpen, setDateCalOpen] = useState(false);

  const users = useQuery(api.users.getAllUsers);
  const updateInfo = useMutation(api.users.updateUserInfo);
  const updateContribs = useMutation(api.users.updateContributions);

  const filtered = (users ?? [])
    .filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.pin.includes(search) ||
        u.ippis.includes(search)
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const editUser = users?.find((u) => u._id === editTarget);
  const contribUser = users?.find((u) => u._id === contribTarget);

  function openEdit(userId: Id<"users">) {
    const u = users?.find((x) => x._id === userId);
    if (u) setEditForm({ name: u.name, pin: u.pin, dateJoined: u.dateJoined });
    setEditTarget(userId);
  }

  function openContrib(userId: Id<"users">) {
    const u = users?.find((x) => x._id === userId);
    if (u)
      setContribForm({
        monthly: u.monthlyContribution.toString(),
        total: u.totalContribution.toString(),
      });
    setContribTarget(userId);
  }

  async function saveEdit() {
    if (!editTarget) return;
    setSaving(true);
    try {
      await updateInfo({ userId: editTarget, ...editForm });
      toast.success("Member info updated.");
      setEditTarget(null);
    } catch (err) {
      console.error("saveEdit error:", err);
      toast.error("Failed to update.");
    } finally {
      setSaving(false);
    }
  }

  async function saveContrib() {
    if (!contribTarget) return;
    setSaving(true);
    try {
      await updateContribs({
        userId: contribTarget,
        monthlyContribution: Number(contribForm.monthly),
        totalContribution: Number(contribForm.total),
      });
      toast.success("Contributions updated.");
      setContribTarget(null);
    } catch {
      toast.error("Failed to update.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 sm:gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, PIN, or IPPIS…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white shrink-0"
          onClick={() => setAddOpen(true)}
        >
          <UserPlus className="w-4 h-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Add Member</span>
        </Button>
      </div>

      {users === undefined ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground text-sm">
          No members found
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((user) => (
            <div
              key={user._id}
              className="rounded-xl border bg-card p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold leading-tight">{user.name}</p>
                <p className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {formatMonthYear(user.dateJoined)}
                </p>
              </div>
              <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                <span>
                  <span>PIN: </span>
                  <span className="font-mono text-foreground">{user.pin}</span>
                </span>
                <span>
                  <span>IPPIS: </span>
                  <span className="text-foreground">{user.ippis}</span>
                </span>
              </div>
              <div className="text-sm flex flex-wrap gap-x-4 gap-y-1">
                <span>
                  <span className="text-muted-foreground">Monthly: </span>
                  {formatNaira(user.monthlyContribution)}
                </span>
                <span>
                  <span className="text-muted-foreground">Total: </span>
                  {formatNaira(user.totalContribution)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  onClick={() => openEdit(user._id)}
                >
                  <Pencil className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  onClick={() => openContrib(user._id)}
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Update
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddMemberSheet open={addOpen} onOpenChange={setAddOpen} />

      <Dialog open={!!editTarget} onOpenChange={() => { setEditTarget(null); setDateCalOpen(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member — {editUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>PIN</Label>
              <Input
                type="text"
                maxLength={6}
                value={editForm.pin}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    pin: e.target.value.replace(/\D/g, ""),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Date Joined</Label>
              <Popover open={dateCalOpen} onOpenChange={setDateCalOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editForm.dateJoined && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editForm.dateJoined
                      ? format(parseISO(editForm.dateJoined), "MMMM dd, yyyy")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editForm.dateJoined ? parseISO(editForm.dateJoined) : undefined}
                    onSelect={(date) => {
                      setEditForm((f) => ({
                        ...f,
                        dateJoined: date ? format(date, "yyyy-MM-dd") : "",
                      }));
                      setDateCalOpen(false);
                    }}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={saveEdit}
              disabled={saving}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!contribTarget} onOpenChange={() => setContribTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Update Contributions — {contribUser?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Monthly Contribution (₦)</Label>
              <Input
                type="number"
                value={contribForm.monthly}
                onChange={(e) =>
                  setContribForm((f) => ({ ...f, monthly: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Total Contribution (₦)</Label>
              <Input
                type="number"
                value={contribForm.total}
                onChange={(e) =>
                  setContribForm((f) => ({ ...f, total: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContribTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={saveContrib}
              disabled={saving}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
