"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

interface AddMemberSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMemberSheet({ open, onOpenChange }: AddMemberSheetProps) {
  const [form, setForm] = useState({
    name: "",
    ippis: "",
    pin: "",
    monthlyContribution: "",
    totalContribution: "",
    phone: "",
    dateJoined: format(new Date(), "yyyy-MM-dd"),
  });
  const [loading, setLoading] = useState(false);
  const [calOpen, setCalOpen] = useState(false);

  const addUser = useMutation(api.users.addUser);

  function update(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function isValid() {
    return (
      form.name &&
      form.ippis &&
      form.pin.length === 6 &&
      form.monthlyContribution &&
      form.totalContribution &&
      form.dateJoined
    );
  }

  async function handleSubmit() {
    if (!isValid()) return;
    setLoading(true);
    try {
      await addUser({
        name: form.name,
        ippis: form.ippis,
        pin: form.pin,
        monthlyContribution: Number(form.monthlyContribution),
        totalContribution: Number(form.totalContribution),
        phone: form.phone || undefined,
        dateJoined: form.dateJoined,
      });
      toast.success("Member added successfully!");
      onOpenChange(false);
      setForm({
        name: "",
        ippis: "",
        pin: "",
        monthlyContribution: "",
        totalContribution: "",
        phone: "",
        dateJoined: format(new Date(), "yyyy-MM-dd"),
      });
    } catch {
      toast.error("Failed to add member.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[500px] overflow-y-auto">
        <SheetHeader className="">
          <SheetTitle>Add New Member</SheetTitle>
        </SheetHeader>

        <div className="px-4 space-y-4">
          {[
            { label: "Full Name", key: "name", placeholder: "e.g. John Doe" },
            { label: "IPPIS Number", key: "ippis", placeholder: "e.g. 123456" },
            { label: "Phone Number", key: "phone", placeholder: "e.g. 08012345678" },
          ].map(({ label, key, placeholder }) => (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <Input
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) => update(key as keyof typeof form, e.target.value)}
              />
            </div>
          ))}

          <div className="space-y-2">
            <Label>6-Digit PIN</Label>
            <Input
              type="password"
              placeholder="6-digit PIN"
              maxLength={6}
              value={form.pin}
              onChange={(e) => update("pin", e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Monthly Contribution (₦)</Label>
              <Input
                type="number"
                placeholder="e.g. 5000"
                value={form.monthlyContribution}
                onChange={(e) => update("monthlyContribution", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Total Contribution (₦)</Label>
              <Input
                type="number"
                placeholder="e.g. 60000"
                value={form.totalContribution}
                onChange={(e) => update("totalContribution", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date Joined</Label>
            <Popover open={calOpen} onOpenChange={setCalOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {form.dateJoined ? format(parseISO(form.dateJoined), "MMMM dd, yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.dateJoined ? parseISO(form.dateJoined) : undefined}
                  onSelect={(date) => { update("dateJoined", date ? format(date, "yyyy-MM-dd") : ""); setCalOpen(false); }}
                  disabled={{ after: new Date() }}
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white h-11"
            disabled={!isValid() || loading}
            onClick={handleSubmit}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding…
              </>
            ) : (
              "Add Member"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
