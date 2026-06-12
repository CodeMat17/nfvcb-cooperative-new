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
import { formatNaira, formatDate } from "@/lib/loan-utils";
import { toast } from "sonner";
import { Search, UserPlus, Pencil, TrendingUp, Loader2 } from "lucide-react";

export function MembersTab() {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Id<"users"> | null>(null);
  const [contribTarget, setContribTarget] = useState<Id<"users"> | null>(null);
  const [editForm, setEditForm] = useState({ name: "", pin: "" });
  const [contribForm, setContribForm] = useState({
    monthly: "",
    total: "",
  });
  const [saving, setSaving] = useState(false);

  const users = useQuery(api.users.getAllUsers);
  const updateInfo = useMutation(api.users.updateUserInfo);
  const updateContribs = useMutation(api.users.updateContributions);

  const filtered = (users ?? []).filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.pin.includes(search) ||
      u.ippis.includes(search)
  );

  const editUser = users?.find((u) => u._id === editTarget);
  const contribUser = users?.find((u) => u._id === contribTarget);

  function openEdit(userId: Id<"users">) {
    const u = users?.find((x) => x._id === userId);
    if (u) setEditForm({ name: u.name, pin: u.pin });
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
    } catch {
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
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  {[
                    "Name",
                    "PIN",
                    "IPPIS",
                    "Monthly",
                    "Total",
                    "Joined",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No members found
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {"•".repeat(user.pin.length)}
                      </td>
                      <td className="px-4 py-3">{user.ippis}</td>
                      <td className="px-4 py-3">
                        {formatNaira(user.monthlyContribution)}
                      </td>
                      <td className="px-4 py-3">
                        {formatNaira(user.totalContribution)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(user.dateJoined)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(user._id)}
                          >
                            <Pencil className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openContrib(user._id)}
                          >
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Update
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddMemberSheet open={addOpen} onOpenChange={setAddOpen} />

      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
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
                type="password"
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
